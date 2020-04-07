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
                console.warn('Unknown app: ' + app_id);
        }
    })(kintone.app.getId());

    const APP_ID_APPLY = APP_ID.APPLY;
    const fieldRecordId_APPLY = 'レコード番号';
    const fieldStatus_APPLY = '状態';
    const statusReady_APPLY = '支払予定明細送付済'
    const fieldConstructionShopId_APPLY = 'constructionShopId';
    const fieldClosingDay_APPLY = 'closingDay';
    const fieldApplicant_APPLY = '支払先正式名称';
    const fieldTotalReceivables_APPLY = 'totalReceivables';
    const fieldPaymentDate_APPLY = 'paymentDate';
    const fieldCollectId_APPLY = 'collectId';

    const APP_ID_COLLECT = APP_ID.COLLECT;
    const fieldRecordId_COLLECT = 'レコード番号';
    const fieldConstructionShopId_COLLECT = 'constructionShopId';
    const fieldClosingDate_COLLECT = 'closingDate';
    const fieldDeadline_COLLECT = 'deadline';
    const fieldStatus_COLLECT = 'collectStatus';
    const statusDefault_COLLECT = 'クラウドサイン送信待ち';
    const fieldScheduledCollectableAmount_COLLECT = 'scheduledCollectableAmount';

    const APP_ID_KOMUTEN = 96;
    const fieldConstructionShopId_KOMUTEN = 'id';
    const fieldOriginalPaymentDate_KOMUTEN = 'original';

    const kintoneRecord = new kintoneJSSDK.Record({connection: new kintoneJSSDK.Connection()});

    kintone.events.on('app.record.index.show', function(event) {
        if (needShowButton()) {
            const button = getInsertCollectRecordButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function needShowButton() {
        // 一旦は常にボタンを表示する。増殖バグだけ防止
        return document.getElementById('insertCollect') === null;
    }

    function getInsertCollectRecordButton() {
        let insertCollect = document.createElement('button');
        insertCollect.id = 'insertCollect';
        insertCollect.innerText = '債権譲渡契約準備を開始';
        insertCollect.addEventListener('click', clickInsertCollect);
        return insertCollect;
    }

    // ボタンクリック時の処理を定義
    function clickInsertCollect() {
        const clicked_ok = confirm('支払明細送付済みの申込みを、工務店と締日ごとにまとめ、回収アプリにレコード追加します。');
        if (!clicked_ok) {
            alert('処理は中断されました。');
            return;
        }

        let applies = [];

        // 対象となるレコードを申込みアプリから全件取得
        getAppliesReadyForCollect()
        .then((insert_targets_array) => {
            if (insert_targets_array.length <= 0) {
                throw new Error('状態が 支払予定明細送付済 かつ\n回収IDが 未入力 のレコードは存在しませんでした。\n回収アプリのレコードを作り直したい場合は、\n回収アプリのレコード詳細画面から\n「回収レコード削除」ボタンを押してください。');
            }

            // 取得した申込みレコードはあとで使うので保持しておく
            applies = insert_targets_array;

            // 取得したレコードを元に、回収アプリにレコードを追加する。
            return insertCollectRecords(insert_targets_array);
        })
        .then((inserted_ids) => {
            console.log('insert completed.');
            console.log(inserted_ids);

            // 回収アプリのレコード番号を、申込みレコードに紐付ける
            return assignCollectIdsToApplies(applies, inserted_ids);
        })
        .then((updated_apply_records) => {
            console.log('update completed.');
            console.log(updated_apply_records);

            alert(`${updated_apply_records.length}件 の申込みレコードを回収アプリに登録しました。`);
            alert('ページを更新します。');
            window.location.reload();
        }, (err) => {
            alert(err.message);
        });
    }

    function getAppliesReadyForCollect() {
        return new kintone.Promise((resolve, reject) => {
            console.log('申込みアプリの中で支払予定明細送付済 かつ 回収IDがブランクのレコードを全て取得する。');
            const request_body = {
                'app': APP_ID_APPLY,
                'fields': [
                    fieldRecordId_APPLY,
                    fieldConstructionShopId_APPLY,
                    fieldClosingDay_APPLY,
                    fieldApplicant_APPLY,
                    fieldTotalReceivables_APPLY,
                    fieldPaymentDate_APPLY
                ],
                'query': `${fieldStatus_APPLY} in (\"${statusReady_APPLY}\") and ${fieldCollectId_APPLY} = \"\"`, //回収IDブランク
                'seek': true
            };

            kintoneRecord.getAllRecordsByQuery(request_body).then((resp) => {
                const apply_records = resp.records;
                console.log('all target records are');
                console.log(apply_records);
                resolve(apply_records);
            });
        });
    }

    function insertCollectRecords(insert_targets_array) {
        return new kintone.Promise((resolve, reject) => {
            console.log('回収アプリにレコード挿入できる形にデータを加工する。');

            // 渡されてくるのは {constructionShopId: {…}, 支払先正式名称: {…}, totalReceivables: {…}, closingDay: {…}, paymentDate: {…}} のオブジェクトの配列
            // 各keyに対応するフィールド値へのアクセスは、array[0].constructionShopId.valueのようにする。

            // まず工務店IDと締日だけ全て抜き出す
            const key_pairs = insert_targets_array.map((obj) => {
                return {
                    [fieldConstructionShopId_APPLY]: obj[fieldConstructionShopId_APPLY]['value'],
                    [fieldClosingDay_APPLY]: obj[fieldClosingDay_APPLY]['value']
                };
            });

            // 抜き出した工務店IDと締日のペアについて、重複なしのリストを作る。
            // ロジックとしては、filterを利用するよく知られた重複削除のロジックと同じ。
            // 今回はオブジェクトの配列なので、インデックスを探す上でindexOfが使えない代わりにfindIndexを使っている。
            const not_duplicated_key_pairs = key_pairs.filter((key_pair1, key_pairs_index, self_arr) => {
                const target_index = self_arr.findIndex(((key_pair2) => {
                    // 工務店IDの一致
                    return (key_pair1[fieldConstructionShopId_APPLY] === key_pair2[fieldConstructionShopId_APPLY])
                    // 締日の一致
                    && (key_pair1[fieldClosingDay_APPLY] === key_pair2[fieldClosingDay_APPLY]);
                }));

                const not_dpl = (target_index === key_pairs_index);
                return not_dpl;
            });

            console.log('not_duplicated_key_pairs is');
            console.log(not_duplicated_key_pairs);

            // 工務店マスタから回収日の情報を取得
            new kintone.Promise(async (rslv) => {
                const body_komuten_payment_date = {
                    'app': APP_ID_KOMUTEN,
                    'fields': [fieldConstructionShopId_KOMUTEN, fieldOriginalPaymentDate_KOMUTEN],
                    'seek': true
                };

                const komuten = await kintoneRecord.getAllRecordsByQuery(body_komuten_payment_date);

                // {工務店ID: 通常支払日}のオブジェクトを作る
                let rslv_obj = {};
                komuten.records.forEach((komuten_record) => {
                    rslv_obj[komuten_record[fieldConstructionShopId_KOMUTEN]['value']] = komuten_record[fieldOriginalPaymentDate_KOMUTEN]['value'];
                });

                rslv(rslv_obj);
            })
            .then(async (komuten_info) => {
                // 申込レコード一覧の中から重複なしの工務店IDと締日のペアをキーに、INSERT用のレコードを作成。
                const request_body = {
                    'app': APP_ID_COLLECT,
                    'records': not_duplicated_key_pairs.map((key_pair) => {
                        // 工務店IDと締日が同じ申込みレコードを抽出
                        const target_records = insert_targets_array.filter((obj) => {
                            return (obj[fieldConstructionShopId_APPLY]['value'] === key_pair[fieldConstructionShopId_APPLY]
                            && obj[fieldClosingDay_APPLY]['value'] === key_pair[fieldClosingDay_APPLY]);
                        });

                        // 抽出した中から申込金額を合計
                        const totalAmount = target_records.reduce((total, record_obj) => {
                            return total + Number(record_obj[fieldTotalReceivables_APPLY]['value']);
                        }, 0);

                        // INSERTするレコードオブジェクトを生成して格納
                        return {
                            [fieldConstructionShopId_COLLECT]: {
                                'value': key_pair[fieldConstructionShopId_APPLY]
                            },
                            [fieldClosingDate_COLLECT]: {
                                'value': key_pair[fieldClosingDay_APPLY]
                            },
                            // 工務店マスタの入力内容から回収期限を計算。
                            [fieldDeadline_COLLECT]: {
                                'value': getDeadline(key_pair[fieldClosingDay_APPLY], komuten_info[String(key_pair[fieldConstructionShopId_APPLY])])
                            },
                            [fieldStatus_COLLECT]: {
                                'value': statusDefault_COLLECT
                            },
                            [fieldScheduledCollectableAmount_COLLECT]: {
                                'value': totalAmount
                            }
                        };
                    })
                };

                // INSERT実行
                console.log('insert request body is');
                console.log(request_body);
                const resp = await kintoneRecord.addAllRecords(request_body);
                resolve(resp.results[0].ids);
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    // YYYY-MM-DDの日付書式と'翌月15日'などの文字列から、締め日をYYYY-MM-DDにして返す
    function getDeadline(closingDay, original_payment_date_str) {
        // YYYY-MM-DDをDate型に変換
        const splitted = closingDay.split('-');
        const closing = new Date(Number(splitted[0]), Number(splitted[1])-1, Number(splitted[2]));

        // 工務店マスタの通常の支払日の入力書式は 翌(々|)月(末|\d{1,2}日) となる。
        // '翌'の数と'々'の数を合計して、何ヶ月後か判定する
        const months_later = (original_payment_date_str.match(/翌/g) || []).length + (original_payment_date_str.match(/々/g) || []).length;

        // 第二引数にはデフォルトでgetDate()の値が渡される。その時、30日までしかない月なのにgetDate()の返り値で31日の値が入ってきたりすると月が進んでしまうので、1を渡しておく。
        // この計算で年をまたいだ場合は、Yearも加算される。
        let deadline = closing;
        deadline.setMonth(deadline.getMonth() + Number(months_later), 1);

        // 日付を判定してセット。末日かそうでないかで場合分け
        if (original_payment_date_str.match(/末/)) {
            // 月の末日をセット。0を指定すると'前月の'最終日がセットされる。
            deadline.setMonth(deadline.getMonth() + 1);
            deadline.setDate(0);
        } else {
            // 数字だけ抜き出して日付とする
            const date = original_payment_date_str.replace(/[^0-9]/g, '');
            deadline.setDate(Number(date));
        }

        return [deadline.getFullYear(), deadline.getMonth()+1, deadline.getDate()].join('-');
    }

    function assignCollectIdsToApplies(applies, inserted_ids) {
        return new kintone.Promise((resolve, reject) => {
            new kintone.Promise((rslv) => {
                console.log('申込みレコードに回収レコードのレコード番号を振る');

                // 先ほど回収アプリに挿入したレコードのidを使って、そのまま回収アプリからGET。取得上限の500件は超えない想定
                const in_query = '(\"' + inserted_ids.join('\",\"') + '\")';
                const request_body = {
                    'app': APP_ID_COLLECT,
                    'fields': [fieldRecordId_COLLECT, fieldConstructionShopId_COLLECT, fieldClosingDate_COLLECT],
                    'query': `${fieldRecordId_COLLECT} in ${in_query}`
                };

                kintoneRecord.getAllRecordsByQuery(request_body).then((resp) => {
                    rslv(resp.records);
                }, (err) => {
                    console.log(err);
                    reject(err);
                });
            })
            .then((inserted_collects) => {
                // 申込みレコードがどの回収レコードに紐づいているかわかるように、回収IDフィールドに回収レコードのレコード番号をセットする
                const request_body = {
                    'app': APP_ID_APPLY,
                    'records': applies.map((apply) => {
                        // どの回収レコードにまとめられているかを特定
                        const collect_dist_record = inserted_collects.find((collect) => {
                            // 工務店IDの一致
                            return apply[fieldConstructionShopId_APPLY]['value'] === collect[fieldConstructionShopId_COLLECT]['value']
                            // 締日の一致
                            && apply[fieldClosingDay_APPLY]['value'] === collect[fieldClosingDate_COLLECT]['value'];
                        });

                        return {
                            'id': apply[fieldRecordId_APPLY]['value'],
                            'record': {
                                [fieldCollectId_APPLY]: {
                                    'value': collect_dist_record[fieldRecordId_COLLECT]['value']
                                }
                            }
                        };
                    })
                };

                kintoneRecord.updateAllRecords(request_body).then((resp) => {
                    resolve(resp.results[0].records);
                }, (err) => {
                    console.log(err);
                    reject(err);
                });
            });
        });
    }
})();
