/*
    Version 4
    軽バン.COM案件について、回収レコード作成前に申込金額を記入する処理を追加

    Version 3
    申込アプリ内で対象となるレコードの種類を変更。
    支払タイミングが通常払いのレコードは対象外となるようにした

    Version 2.1
    申込アプリ内で対象となるレコードの種類を変更。
    旧: 状態フィールドが「支払予定明細送付済」
    新: 状態フィールドが「ID確認済」

    Version 2
    申込レコードから、新たに挿入する回収レコードへと転記するフィールドの中に
    支払タイミングと支払日のフィールドを追加

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

    const KE_BAN_CONSTRUCTORS = [
        "400",
        "401",
        "402",
        "403",
        "404",
    ];

    const commonRecordID = "$id";

    const APP_ID_APPLY                      = APP_ID.APPLY;
    const fieldRecordId_APPLY               = "レコード番号";
    const fieldStatus_APPLY                 = "状態";
    const statusReady_APPLY                 = "ID確認済";
    const fieldConstructionShopId_APPLY     = "constructionShopId";
    const fieldClosingDay_APPLY             = "closingDay";
    const fieldApplicant_APPLY              = "支払先正式名称";
    const fieldInvoiceAmount_APPLY          = "applicationAmount";
    const fieldMemberFee_APPLY              = "membership_fee";
    const fieldTotalReceivables_APPLY       = "totalReceivables";
    const fieldPaymentTiming_APPLY          = "paymentTiming";
    const statusPaymentTimingOriginal_APPLY = "通常払い";
    const fieldPaymentDate_APPLY            = "paymentDate";
    const fieldCollectId_APPLY              = "collectId";
    const fieldInvoice_APPLY                = "invoice";
    const factorableTotalAmountWFI          = "factorableTotalAmountWFI";

    const APP_ID_COLLECT                            = APP_ID.COLLECT;
    const fieldRecordId_COLLECT                     = "レコード番号";
    const fieldConstructionShopId_COLLECT           = "constructionShopId";
    const fieldClosingDate_COLLECT                  = "closingDate";
    const fieldDeadline_COLLECT                     = "deadline";
    const fieldStatus_COLLECT                       = "collectStatus";
    const statusDefault_COLLECT                     = "クラウドサイン作成待ち";
    const fieldScheduledCollectableAmount_COLLECT   = "scheduledCollectableAmount";
    const tableCloudSignApplies_COLLECT             = "cloudSignApplies";
    const tableFieldApplyRecordNoCS                 = "applyRecordNoCS";
    const tableFieldApplicantOfficialNameCS         = "applicantOfficialNameCS";
    const tableFieldInvoiceAmountCS                 = "invoiceAmountCS";
    const tableFieldMemberFeeCS                     = "membershipFeeCS";
    const tableFieldReceivableCS                    = "receivableCS";
    const tableFieldPaymentTimingCS                 = "paymentTimingCS";
    const tableFieldPaymentDateCS                   = "paymentDateCS";
    const tableFieldAttachmentFileKeyCS             = "attachmentFileKeyCS";

    const APP_ID_KOMUTEN                    = 96;
    const fieldConstructionShopId_KOMUTEN   = "id";
    const fieldOriginalPaymentDate_KOMUTEN  = "original";

    const client = new KintoneRestAPIClient({baseUrl: "https://investdesign.cybozu.com"});

    const INSERT_TARGET_COND = `${fieldStatus_APPLY} in ("${statusReady_APPLY}")`
        + `and ${fieldCollectId_APPLY} = ""` //回収IDブランク
        + `and ${fieldPaymentTiming_APPLY} not in ("${statusPaymentTimingOriginal_APPLY}")`; // 通常払い以外

    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.index.show", (event) => {
        if (needShowButton()) {
            const button = createButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    const button_id = "insertCollect";
    const button_label = "クラウドサイン用に回収レコードを作成";
    function needShowButton() {
        // 一旦は常にボタンを表示する。増殖バグだけ防止
        return document.getElementById(button_id) === null;
    }

    function createButton() {
        const button = document.createElement("button");
        button.id = button_id;
        button.innerText = button_label;
        button.addEventListener("click", clickButton);
        return button;
    }

    // ボタンクリック時の処理を定義
    async function clickButton() {
        const clicked_ok = confirm("ID確認済の申込みを、工務店と締日ごとにまとめ、回収アプリにレコード追加します。");
        if (!clicked_ok) {
            alert("処理は中断されました。");
            return;
        }
        const text_ready = this.innerText;
        this.innerText = "作成中...";

        try {
            // 作成前に軽バン.COM案件の対象債権合計金額を手動で別フィールドから転記する必要がある。
            // しかし忘れていても大丈夫なように転記処理をしておく。
            await copyKebanFactoringAmount();

            // 対象となるレコードを申込みアプリから全件取得
            const insert_targets = await getAppliesReadyForCollect()
                .catch((err) => {
                    console.error(err);
                    throw new Error("申込みレコードの取得中にエラーが発生しました。");
                });

            if (insert_targets.length <= 0) {
                alert(`状態が ${statusReady_APPLY} かつ\n回収IDが 未入力 のレコードは存在しませんでした。\n回収アプリのレコードを作り直したい場合は、\n回収アプリのレコード詳細画面から\n「回収レコード削除」ボタンを押してください。`);
                return;
            }

            // 取得したレコードを元に、回収アプリにレコードを追加する。
            const inserted_ids = await insertCollectRecords(insert_targets)
                .catch((err) => {
                    console.error(err);
                    throw new Error("回収アプリへのレコード挿入中にエラーが発生しました。");
                });

            // 回収アプリのレコード番号を、申込みレコードに紐付ける
            const updated_apply = await assignCollectIdsToApplies(insert_targets, inserted_ids)
                .catch((err) => {
                    console.error(err);
                    throw new Error("回収アプリにはレコードを作成できましたが、\n申込みレコードとの紐付け中にエラーが発生しました。");
                });

            alert(`${updated_apply.records.length}件 の申込みレコードを回収アプリに登録しました。`);
            alert("ページを更新します。");
            window.location.reload();
        } catch(err) {
            alert(err);
        } finally {
            this.innerText = text_ready;
        }
    }

    const getKebanZeroApplies = () => {
        const in_query = KE_BAN_CONSTRUCTORS
            .map((id) => `"${id}"`).join(",");

        const body = {
            app: APP_ID_APPLY,
            fields: [
                commonRecordID,
                fieldInvoiceAmount_APPLY,
                factorableTotalAmountWFI
            ],
            // 回収レコード作成対象 && 工務店IDがWFI && 申込金額が0
            condition: `${INSERT_TARGET_COND}
                and ${fieldConstructionShopId_APPLY} in (${in_query})
                and ${fieldInvoiceAmount_APPLY} = 0`,
        };

        return client.record.getAllRecords(body);
    };

    const getCopiedPutPayload = (targets) => {
        const records = targets.map((r) => {
            return {
                "id": r[commonRecordID]["value"],
                "record": {
                    [fieldInvoiceAmount_APPLY]: {
                        "value": r[factorableTotalAmountWFI]["value"],
                    }
                }
            };
        });

        return {
            app: APP_ID_APPLY,
            records: records
        };
    };

    const copyKebanFactoringAmount = async () => {
        // 軽バン.COMの支払予定明細未作成レコードの更新処理を行う。
        // 申込金額フィールドが0のレコードに限り、前払対象金額フィールドを申込金額フィールドに転記する。
        const targets = await getKebanZeroApplies();
        const payload = getCopiedPutPayload(targets);
        await client.record.updateAllRecords(payload);
    };

    function getAppliesReadyForCollect() {
        // 申込みアプリの中で ID確認済 かつ 回収IDがブランクのレコードを全て取得する。
        const request_body = {
            "app": APP_ID_APPLY,
            "fields": [
                fieldRecordId_APPLY,
                fieldConstructionShopId_APPLY,
                fieldClosingDay_APPLY,
                fieldApplicant_APPLY,
                fieldInvoiceAmount_APPLY,
                fieldMemberFee_APPLY,
                fieldTotalReceivables_APPLY,
                fieldPaymentTiming_APPLY,
                fieldPaymentDate_APPLY,
                fieldInvoice_APPLY
            ],
            "condition": INSERT_TARGET_COND
        };

        return client.record.getAllRecords(request_body);
    }

    async function insertCollectRecords(insert_targets_array) {
        // 回収アプリにレコード挿入できる形にデータを加工する。
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

        // 工務店マスタから回収日の情報を取得。申込レコードに含まれる工務店の情報のみ取得する
        const body_komuten_payment_date = {
            "app": APP_ID_KOMUTEN,
            "fields": [fieldConstructionShopId_KOMUTEN, fieldOriginalPaymentDate_KOMUTEN],
            "condition": `${fieldConstructionShopId_KOMUTEN} in ("${key_pairs.map((pair) => pair[fieldConstructionShopId_APPLY]).join('","')}")`
        };

        const komuten = await client.record.getAllRecords(body_komuten_payment_date);

        // {工務店ID: 通常支払日}のオブジェクトを作る
        const komuten_info = {};
        komuten.forEach((komuten_record) => {
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

                // 抽出した中から申込金額を合計（ここで合計する金額はクラウドサイン送信用。振込依頼書送信用の合計金額は振込依頼書の送信時に別途計算する）
                const totalAmount = target_records.reduce((total, record_obj) => {
                    return total + Number(record_obj[fieldTotalReceivables_APPLY]["value"]);
                }, 0);

                // サブテーブルに申し込みレコードの情報一覧を転記
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
                    // サブテーブル部分
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
                                    [tableFieldInvoiceAmountCS] : {
                                        "value": record[fieldInvoiceAmount_APPLY]["value"]
                                    },
                                    [tableFieldMemberFeeCS] : {
                                        "value": record[fieldMemberFee_APPLY]["value"]
                                    },
                                    [tableFieldReceivableCS] : {
                                        "value": record[fieldTotalReceivables_APPLY]["value"]
                                    },
                                    [tableFieldPaymentTimingCS] : {
                                        "value": record[fieldPaymentTiming_APPLY]["value"]
                                    },
                                    [tableFieldPaymentDateCS]: {
                                        "value": record[fieldPaymentDate_APPLY]["value"]
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
        const resp = await client.record.addAllRecords(request_body);
        // 新規作成されたレコードID一覧を返す
        return resp.records.map((r) => r.id);
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
        // 申込みレコードに回収レコードのレコード番号を振る
        // 先ほど回収アプリに挿入したレコードのidを使って、そのまま回収アプリからGET
        const in_query = `("${  inserted_ids.join('","')  }")`;
        const body_new_collects = {
            "app": APP_ID_COLLECT,
            "fields": [fieldRecordId_COLLECT, fieldConstructionShopId_COLLECT, fieldClosingDate_COLLECT],
            "condition": `${fieldRecordId_COLLECT} in ${in_query}`
        };
        const inserted_collects = await client.record.getAllRecords(body_new_collects);

        // 申込みレコードがどの回収レコードに紐づいているかわかるように、回収IDフィールドに回収レコードのレコード番号をセットする
        const body_add_collect_id = {
            "app": APP_ID_APPLY,
            "records": applies.map((apply) => {
                // どの回収レコードにまとめられているかを特定
                const collect_dist_record = inserted_collects.find((collect) => {
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
        return client.record.updateAllRecords(body_add_collect_id);
    }
})();
