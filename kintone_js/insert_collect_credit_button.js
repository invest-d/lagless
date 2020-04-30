/*
    Version 1
    申込みアプリ(159)のレコードを、工務店と締日ごとに金額をまとめ、回収アプリ(160)に新規レコードとして挿入する。

    申込みアプリでの対象レコードは、下記の全ての条件を満たすもの。
        状態が「支払予定明細送付済」 かつ 回収IDが未入力

    回収アプリに新規レコードとして追加したあと、
    申込みレコードの回収IDフィールドに回収アプリ側のレコード番号を入力する。
*/

(function () {
    "use strict";

    const APP_ID = ((app_id) => {
        switch(app_id) {
        // 開発版の申込みアプリ
        case 159:
            return {
                APPLY: 159,
                COLLECT: 160
            };

            // 本番の申込みアプリ
        case 161:
            return {
                APPLY: 161,
                COLLECT: 162
            };
        default:
            console.warn(`Unknown app: ${  app_id}`);
        }
    })(kintone.app.getId());

    const APP_ID_APPLY = APP_ID.APPLY;
    const fieldRecordId_APPLY = "レコード番号";
    const fieldStatus_APPLY = "状態";
    const statusReady_APPLY = "支払予定明細送付済";
    const fieldConstructionShopId_APPLY = "constructionShopId";
    const fieldClosingDay_APPLY = "closingDay";
    const fieldApplicant_APPLY = "支払先正式名称";
    const fieldTotalReceivables_APPLY = "totalReceivables";
    const fieldPaymentDate_APPLY = "paymentDate";
    const fieldCollectId_APPLY = "collectId";
    const fieldInvoice_APPLY = "invoice";

    const APP_ID_COLLECT = APP_ID.COLLECT;
    const fieldRecordId_COLLECT = "レコード番号";
    const fieldConstructionShopId_COLLECT = "constructionShopId";
    const fieldClosingDate_COLLECT = "closingDate";
    const fieldDeadline_COLLECT = "deadline";
    const fieldStatus_COLLECT = "collectStatus";
    const statusDefault_COLLECT = "クラウドサイン送信待ち";
    const statusPaymentPendings_COLLECT = [statusDefault_COLLECT, "クラウドサイン回付中", "クラウドサイン承認済み"];
    const fieldScheduledCollectableAmount_COLLECT = "scheduledCollectableAmount";
    const fieldParent_COLLECT = "parentCollectRecord";
    const tableCloudSignApplies_COLLECT = "cloudSignApplies";
    const tableFieldApplyRecordNoCS = "applyRecordNoCS";
    const tableFieldApplicantOfficialNameCS = "applicantOfficialNameCS";
    const tableFieldReceivableCS = "receivableCS";
    const tableFieldAttachmentFileKeyCS = "attachmentFileKeyCS";
    const tableInvoiceTargets_COLLECT = "invoiceTargets";
    const tableFieldApplyRecordNoIV = "applyRecordNoIV";
    const tableFieldApplicantOfficialNameIV = "applicantOfficialNameIV";
    const tableFieldReceivableIV = "receivableIV";

    const APP_ID_KOMUTEN = 96;
    const fieldConstructionShopId_KOMUTEN = "id";
    const fieldOriginalPaymentDate_KOMUTEN = "original";

    const kintoneRecord = new kintoneJSSDK.Record({connection: new kintoneJSSDK.Connection()});

    kintone.events.on("app.record.index.show", (event) => {
        if (needShowButton()) {
            const button = createInsertCollectRecordButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function needShowButton() {
        // 一旦は常にボタンを表示する。増殖バグだけ防止
        return document.getElementById("insertCollect") === null;
    }

    function createInsertCollectRecordButton() {
        const insertCollect = document.createElement("button");
        insertCollect.id = "insertCollect";
        insertCollect.innerText = "債権譲渡契約準備を開始";
        insertCollect.addEventListener("click", clickInsertCollect);
        return insertCollect;
    }

    // ボタンクリック時の処理を定義
    async function clickInsertCollect() {
        const clicked_ok = confirm("支払明細送付済みの申込みを、工務店と締日ごとにまとめ、回収アプリにレコード追加します。");
        if (!clicked_ok) {
            alert("処理は中断されました。");
            return;
        }

        try {
            // 対象となるレコードを申込みアプリから全件取得
            const insert_targets = await getAppliesReadyForCollect()
                .catch((err) => {
                    console.error(err);
                    throw new Error("申込みレコードの取得中にエラーが発生しました。");
                });

            if (insert_targets.records.length <= 0) {
                alert("状態が 支払予定明細送付済 かつ\n回収IDが 未入力 のレコードは存在しませんでした。\n回収アプリのレコードを作り直したい場合は、\n回収アプリのレコード詳細画面から\n「回収レコード削除」ボタンを押してください。");
                return;
            }

            // 取得したレコードを元に、回収アプリにレコードを追加する。
            const inserted_ids = await insertCollectRecords(insert_targets.records)
                .catch((err) => {
                    console.error(err);
                    throw new Error("回収アプリへのレコード挿入中にエラーが発生しました。");
                });

            // 回収アプリのレコード番号を、申込みレコードに紐付ける
            const updated_apply = await assignCollectIdsToApplies(insert_targets.records, inserted_ids)
                .catch((err) => {
                    console.error(err);
                    throw new Error("回収アプリにはレコードを作成できましたが、\n申込みレコードとの紐付け中にエラーが発生しました。");
                });
            console.log("update completed.");
            console.log(updated_apply.results[0].records);

            // いま新しく挿入した回収レコードについて、既に親が存在する場合、債権金額などを親の回収レコードに合計する
            await appendDataToParent(inserted_ids)
                .catch((err) => {
                    console.error(err);
                    throw new Error("回収アプリにはレコードを作成できましたが、\n回収親レコードへの情報追加中にエラーが発生しました。");
                });

            alert(`${updated_apply.results[0].records.length}件 の申込みレコードを回収アプリに登録しました。`);
            alert("ページを更新します。");
            window.location.reload();
        } catch(err) {
            alert(err);
        }
    }

    function getAppliesReadyForCollect() {
        console.log("申込みアプリの中で支払予定明細送付済 かつ 回収IDがブランクのレコードを全て取得する。");
        const request_body = {
            "app": APP_ID_APPLY,
            "fields": [
                fieldRecordId_APPLY,
                fieldConstructionShopId_APPLY,
                fieldClosingDay_APPLY,
                fieldApplicant_APPLY,
                fieldTotalReceivables_APPLY,
                fieldPaymentDate_APPLY,
                fieldInvoice_APPLY
            ],
            "query": `${fieldStatus_APPLY} in ("${statusReady_APPLY}") and ${fieldCollectId_APPLY} = ""`, //回収IDブランク
            "seek": true
        };

        return kintoneRecord.getAllRecordsByQuery(request_body);
    }

    async function insertCollectRecords(insert_targets_array) {
        console.log("回収アプリにレコード挿入できる形にデータを加工する。");

        // 渡されてくるのは {constructionShopId: {…}, 支払先正式名称: {…}, totalReceivables: {…}, closingDay: {…}, paymentDate: {…}} のオブジェクトの配列
        // 各keyに対応するフィールド値へのアクセスは、array[0].constructionShopId.valueのようにする。

        // まず工務店IDと締日だけ全て抜き出す
        const key_pairs = insert_targets_array.map((obj) => {
            return {
                [fieldConstructionShopId_APPLY]: obj[fieldConstructionShopId_APPLY]["value"],
                [fieldClosingDay_APPLY]: obj[fieldClosingDay_APPLY]["value"]
            };
        });

        // 抜き出した工務店IDと締日のペアについて、重複なしのリストを作る。
        // ロジックとしては、filterを利用するよく知られた重複削除のロジックと同じ。
        // 今回はオブジェクトの配列なので、インデックスを探す上でindexOfが使えない代わりにfindIndexを使っている。
        const unique_key_pairs = key_pairs.filter((key_pair1, key_pairs_index, self_arr) => {
            const target_index = self_arr.findIndex(((key_pair2) => {
                // 工務店IDの一致
                return (key_pair1[fieldConstructionShopId_APPLY] === key_pair2[fieldConstructionShopId_APPLY])
                // 締日の一致
                && (key_pair1[fieldClosingDay_APPLY] === key_pair2[fieldClosingDay_APPLY]);
            }));

            const is_unique = (target_index === key_pairs_index);
            return is_unique;
        });

        console.log("unique_key_pairs is");
        console.log(unique_key_pairs);

        // 工務店マスタから回収日の情報を取得。申込みのある工務店のみ
        const body_komuten_payment_date = {
            "app": APP_ID_KOMUTEN,
            "fields": [fieldConstructionShopId_KOMUTEN, fieldOriginalPaymentDate_KOMUTEN],
            "query": `${fieldConstructionShopId_KOMUTEN} in ("${key_pairs.map((pair) => pair[fieldConstructionShopId_APPLY]).join("\",\"")}")`,
            "seek": true
        };

        const komuten = await kintoneRecord.getAllRecordsByQuery(body_komuten_payment_date);

        // {工務店ID: 通常支払日}のオブジェクトを作る
        const komuten_info = {};
        komuten.records.forEach((komuten_record) => {
            komuten_info[komuten_record[fieldConstructionShopId_KOMUTEN]["value"]] = komuten_record[fieldOriginalPaymentDate_KOMUTEN]["value"];
        });

        // 申込レコード一覧の中から重複なしの工務店IDと締日のペアをキーに、INSERT用のレコードを作成。
        const request_body = {
            "app": APP_ID_COLLECT,
            "records": unique_key_pairs.map((key_pair) => {
                // 工務店IDと締日が同じ申込みレコードを抽出
                const target_records = insert_targets_array.filter((obj) => {
                    return (obj[fieldConstructionShopId_APPLY]["value"] === key_pair[fieldConstructionShopId_APPLY]
                    && obj[fieldClosingDay_APPLY]["value"] === key_pair[fieldClosingDay_APPLY]);
                });

                // 抽出した中から申込金額を合計
                const totalAmount = target_records.reduce((total, record_obj) => {
                    return total + Number(record_obj[fieldTotalReceivables_APPLY]["value"]);
                }, 0);

                // INSERTするレコードオブジェクトを生成して格納
                // レコード内のサブテーブルを操作する方法のリファレンス：https://developer.cybozu.io/hc/ja/articles/200752984-%E3%83%AC%E3%82%B3%E3%83%BC%E3%83%89%E6%9B%B4%E6%96%B0%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8B%E3%83%86%E3%83%BC%E3%83%96%E3%83%AB%E6%93%8D%E4%BD%9C%E3%81%AE%E3%83%86%E3%82%AF%E3%83%8B%E3%83%83%E3%82%AF
                return {
                    [fieldConstructionShopId_COLLECT]: {
                        "value": key_pair[fieldConstructionShopId_APPLY]
                    },
                    [fieldClosingDate_COLLECT]: {
                        "value": key_pair[fieldClosingDay_APPLY]
                    },
                    // 工務店マスタの入力内容から回収期限を計算。
                    [fieldDeadline_COLLECT]: {
                        "value": getDeadline(key_pair[fieldClosingDay_APPLY], komuten_info[String(key_pair[fieldConstructionShopId_APPLY])])
                    },
                    [fieldStatus_COLLECT]: {
                        "value": statusDefault_COLLECT
                    },
                    [fieldScheduledCollectableAmount_COLLECT]: {
                        "value": totalAmount
                    },
                    // レコード内サブテーブルに申込レコードの情報を追加する
                    [tableCloudSignApplies_COLLECT]: {
                        "value": target_records.map((record) => {
                            return {
                                "value": {
                                    [tableFieldApplyRecordNoCS]: {
                                        "value": record[fieldRecordId_APPLY]["value"]
                                    },
                                    [tableFieldApplicantOfficialNameCS]: {
                                        "value": record[fieldApplicant_APPLY]["value"]
                                    },
                                    [tableFieldReceivableCS] : {
                                        "value": record[fieldTotalReceivables_APPLY]["value"]
                                    },
                                    [tableFieldAttachmentFileKeyCS]: {
                                        "value": record[fieldInvoice_APPLY]["value"][0]["fileKey"]
                                    }
                                }
                            };
                        })
                    }
                };
            })
        };

        // INSERT実行
        console.log("insert request body is");
        console.log(request_body);
        const resp = await kintoneRecord.addAllRecords(request_body);
        // idsは文字列型のレコード番号の配列
        return resp.results[0].ids;
    }

    // YYYY-MM-DDの日付書式と'翌月15日'などの文字列から、締め日をYYYY-MM-DDにして返す
    function getDeadline(closingDay, original_payment_date_str) {
        // YYYY-MM-DDをDate型に変換
        const splitted = closingDay.split("-");
        const closing = new Date(Number(splitted[0]), Number(splitted[1])-1, Number(splitted[2]));

        // 工務店マスタの通常の支払日の入力書式は 翌(々|)月(末|\d{1,2}日) となる。
        // '翌'の数と'々'の数を合計して、何ヶ月後か判定する
        const months_later = (original_payment_date_str.match(/翌/g) || []).length + (original_payment_date_str.match(/々/g) || []).length;

        // 第二引数にはデフォルトでgetDate()の値が渡される。
        // その時、setMonthで設定したい月が30日までしかない月なのにgetDate()の返り値で31日の値が入ってきたりすると設定したい月から余分に月が進んでしまうので、1を渡しておく。
        // この計算で年をまたいだ場合は、Yearも加算される。
        const deadline = new Date(closing.getTime());
        deadline.setMonth(deadline.getMonth() + Number(months_later), 1);

        // 日付を判定してセット。末日かそうでないかで場合分け
        if (original_payment_date_str.match(/末/)) {
            // 月の末日をセット。0を指定すると'前月の'最終日がセットされる。
            deadline.setMonth(deadline.getMonth() + 1);
            deadline.setDate(0);
        } else {
            // 数字だけ抜き出して日付とする
            const date = original_payment_date_str.replace(/[^0-9]/g, "");
            deadline.setDate(Number(date));
        }

        return [deadline.getFullYear(), deadline.getMonth()+1, deadline.getDate()].join("-");
    }

    async function assignCollectIdsToApplies(applies, inserted_ids) {
        console.log("申込みレコードに回収レコードのレコード番号を振る");

        // 先ほど回収アプリに挿入したレコードのidを使って、そのまま回収アプリからGET
        const in_query = `("${  inserted_ids.join("\",\"")  }")`;
        const body_new_collects = {
            "app": APP_ID_COLLECT,
            "fields": [fieldRecordId_COLLECT, fieldConstructionShopId_COLLECT, fieldClosingDate_COLLECT],
            "query": `${fieldRecordId_COLLECT} in ${in_query}`
        };
        const inserted_collects = await kintoneRecord.getAllRecordsByQuery(body_new_collects);

        // 申込みレコードがどの回収レコードに紐づいているかわかるように、回収IDフィールドに回収レコードのレコード番号をセットする
        const body_add_collect_id = {
            "app": APP_ID_APPLY,
            "records": applies.map((apply) => {
                // どの回収レコードにまとめられているかを特定
                const collect_dist_record = inserted_collects.records.find((collect) => {
                    // 工務店IDの一致
                    return apply[fieldConstructionShopId_APPLY]["value"] === collect[fieldConstructionShopId_COLLECT]["value"]
                    // 締日の一致
                    && apply[fieldClosingDay_APPLY]["value"] === collect[fieldClosingDate_COLLECT]["value"];
                });

                return {
                    "id": apply[fieldRecordId_APPLY]["value"],
                    "record": {
                        [fieldCollectId_APPLY]: {
                            "value": collect_dist_record[fieldRecordId_COLLECT]["value"]
                        }
                    }
                };
            })
        };
        return kintoneRecord.updateAllRecords(body_add_collect_id);
    }

    async function appendDataToParent(inserted_ids) {
        console.log("新規に挿入された回収レコードの親に対して必要な情報を追加する");
        // 別に親が存在すればその親に情報を追加し、存在しなければ自身を親に設定して自身に情報を追加する
        // 親とは：親フラグフィールドがtrue and 支払実行前 and 工務店IDと締日がどちらも同じ

        // まず新規回収レコードを全て取得
        const request_new = {
            "app": APP_ID_COLLECT,
            "fields": [
                fieldRecordId_COLLECT,
                fieldScheduledCollectableAmount_COLLECT,
                tableCloudSignApplies_COLLECT
            ],
            "query": `${fieldRecordId_COLLECT} in ("${inserted_ids.join("\",\"")}")`
        };
        const new_inserteds = await kintoneRecord.getAllRecordsByQuery(request_new);

        // 次に親レコードを取得
        // 工務店と締日の2フィールドをキーにするqueryの書き方が思いつかないので((工務店= and 締日=) or (工務店= and 締日=) or (...)と書くわけにもいかない) 、それ以外の支払実行前の親をとりあえず全部取る
        const request_parent = {
            "app": APP_ID_COLLECT,
            "fields": [
                fieldRecordId_COLLECT,
                fieldConstructionShopId_COLLECT,
                fieldClosingDate_COLLECT,
                fieldScheduledCollectableAmount_COLLECT,
                tableInvoiceTargets_COLLECT
            ],
            "query": `${fieldParent_COLLECT} in ("true") and ${fieldStatus_COLLECT} in ("${statusPaymentPendings_COLLECT.join("\",\"")}")`
        };
        const parents = await kintoneRecord.getAllRecordsByQuery(request_parent);

        // 新規レコードのそれぞれについて、親がいるかどうかで2つのグループに分ける
        const has_no_parent = [];
        const has_parent = [];
        new_inserteds.records.forEach((inserted) => {
            const parent = parents.records.find((record) => record[fieldConstructionShopId_COLLECT]["value"] === inserted[fieldConstructionShopId_COLLECT]["value"]
            && record[fieldClosingDate_COLLECT]["value"] === inserted[fieldClosingDate_COLLECT]["value"]);

            // もし親が居なければparentはundefined
            if (parent === undefined) {
                has_no_parent.push(inserted);
            } else {
                // 親がいる場合は、親のIDはどれなのかという情報を追加
                inserted["parent_id"] = {"value": parent[fieldRecordId_COLLECT]["value"]};
                has_parent.push(inserted);
            }
        });

        await kintone.Promise.all([
            makeParentSelf(has_no_parent),
            addCollectableToParent(has_parent, parents)
        ]);
    }

    async function makeParentSelf(has_no_parents) {
        if (has_no_parents.length === 0) {
            return;
        }

        console.log("自分自身を親レコードとし、自分自身に振込依頼書作成に必要な情報を追加する");
        // クラウドサインに必要なサブテーブルの情報を、振込依頼書に必要なサブテーブルにほぼ転記する形
        const request_body = {
            "app": APP_ID_COLLECT,
            "records": has_no_parents.map((record) => {
                return {
                    "id": record[fieldRecordId_COLLECT]["value"],
                    "record": {
                        [fieldParent_COLLECT]: {
                            "value": "true"
                        },
                        [tableInvoiceTargets_COLLECT]: {
                            "value": record[tableCloudSignApplies_COLLECT]["value"].map((sub_table) => {
                                return {
                                    "value": {
                                        [tableFieldApplyRecordNoIV]: {
                                            "value": sub_table["value"][tableFieldApplyRecordNoCS]["value"]
                                        },
                                        [tableFieldApplicantOfficialNameIV]: {
                                            "value": sub_table["value"][tableFieldApplicantOfficialNameCS]["value"]
                                        },
                                        [tableFieldReceivableIV]: {
                                            "value": sub_table["value"][tableFieldReceivableCS]["value"]
                                        }
                                    }
                                };
                            })
                        }
                    }
                };
            })
        };

        console.log("body is");
        console.log(request_body);
        return await kintoneRecord.updateAllRecords(request_body);
    }

    async function addCollectableToParent(has_parents, parents) {
        if (parents.records.length === 0) {
            return;
        }

        console.log("親レコードの回収金額に子の回収金額を合計し、親レコードの振込依頼書サブテーブルに子の情報を追加する");
        // 親のレコード番号を抽出
        const parent_ids = new Set(has_parents.map((record) => record["parent_id"]["value"]));

        // 今回作成された回収レコードの中に子を持っている親だけを抽出
        const has_childs = parents.filter((record) => parent_ids.has(record[fieldRecordId_COLLECT]["value"]));

        if (has_childs.length === 0) {
            console.log("子を持っている親が存在しない");
            return;
        }

        // 親それぞれについてupdate
        const request_body = {
            "app": APP_ID_COLLECT,
            "records": has_childs.map((parent) => {
                const target_child = has_parents.filter((child) => child["parent_id"]["value"] === parent[fieldRecordId_COLLECT]["value"]);
                return {
                    "id": parent[fieldRecordId_COLLECT]["value"],
                    "record": {
                        // 初期値を親の回収予定金額としてreduce関数を実行し、子の回収金額を合計する
                        [fieldScheduledCollectableAmount_COLLECT]: target_child
                            .reduce((sum, child) => sum + Number(child[fieldScheduledCollectableAmount_COLLECT]["value"]), Number(parent[fieldScheduledCollectableAmount_COLLECT]["value"])),
                        // 振込依頼書用のサブテーブルに子の情報を追加。元からあった親の行を消さないように追加する
                        [tableInvoiceTargets_COLLECT]: {
                            "value": parent[tableInvoiceTargets_COLLECT]["value"].push(...target_child[tableCloudSignApplies_COLLECT]["value"].map((sub_record) => {
                                return {
                                    "value": {
                                        [tableFieldApplyRecordNoIV]: {
                                            "value": sub_record["value"][tableFieldApplyRecordNoCS]["value"]
                                        },
                                        [tableFieldApplicantOfficialNameIV]: {
                                            "value": sub_record["value"][tableFieldApplicantOfficialNameCS]["value"]
                                        },
                                        [tableFieldReceivableIV]: {
                                            "value": sub_record["value"][tableFieldReceivableCS]["value"]
                                        }
                                    }
                                };
                            }))
                        }
                    }
                };
            })
        };

        console.log("body is");
        console.log(request_body);
        return await kintoneRecord.updateAllRecords(request_body);
    }
})();
