/*
    Version 1
    回収アプリ(160)のレコードのうち、回収予定のレコードを取得し、
    工務店IDごとに回収予定金額を合計し、工務店マスタ(96)の未回収金額にセットする。
*/

(function () {
    "use strict";

    const APP_ID_KOMUTEN = 96;
    const constructionShopId_KOMUTEN = 'id';
    const unpaidAmount_KOMUTEN = 'uncollectedAmount';

    const APP_ID_COLLECT = 160;
    const constructionShopId_COLLECT = 'constructionShopId';
    const unpaidAmount_COLLECT = 'scheduledCollectableAmount';
    const statusField_COLLECT = 'collectStatus';
    const statusAlreadyPaid_COLLECT = '回収済み';
    const statusRejected_COLLECT = 'クラウドサイン却下・再作成待ち';

    kintone.events.on('app.record.index.show', function(event) {
        if (need_display_button()) {
            var button = getGetCollectableAmountButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function need_display_button() {
        // 一旦は常にボタンを表示する。増殖バグだけ防止
        return document.getElementById('getCollectable') === null;
    }

    function getGetCollectableAmountButton() {
        var getCollectable = document.createElement('button');
        getCollectable.id = 'getCollectable';
        getCollectable.innerText = '各工務店の未回収金額を更新';
        getCollectable.addEventListener('click', clickGetCollectableAmount);
        return getCollectable;
    }

    // ボタンクリック時の処理を定義
    function clickGetCollectableAmount() {
        var clicked_ok = confirm('回収アプリの未回収金額を合計して取得します。');
        if (!clicked_ok) {
            alert('処理は中断されました。');
            return;
        }

        // 対象となるレコードを回収アプリから全件取得
        getUnpaidRecords()
        .then((unpaid_records) => {
            console.log(unpaid_records);

            // 工務店IDごとに未回収金額を合計
            return sumUnpaidAmountByKomuten(unpaid_records);
        })
        .then((sum_result) => {
            console.log(sum_result);

            // 工務店マスタに未回収金額をPUT
            return updateKomutenTotalUnpaidAmount(sum_result)
        })
        .then((updated_count) => {
            console.log(updated_count);

            alert(`${updated_count}つ の工務店の未回収金額を更新しました。`);
            alert('ページを更新します。');
            window.location.reload();
        }, (err) => {
            alert(err.message);
        });
    }

    function getUnpaidRecords() {
        return new kintone.Promise((resolve, reject) => {
            console.log('回収アプリの中でステータスが回収済み・却下以外の全てのレコードを取得する');

            var request_body = {
                'app': APP_ID_COLLECT,
                'fields': [
                    constructionShopId_COLLECT,
                    unpaidAmount_COLLECT
                ],
                'query': `${statusField_COLLECT} not in (\"${statusAlreadyPaid_COLLECT}\", \"${statusRejected_COLLECT}\") order by レコード番号 asc`
            };

            kintone.api(kintone.api.url('/k/v1/records', true), 'GET', request_body, (resp) => {
                console.log(resp.records);
                resolve(resp.records);
            }, (err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    function sumUnpaidAmountByKomuten(unpaid_records) {
        return new kintone.Promise((resolve, reject) => {
            console.log('工務店IDごとに未回収金額を合計する。');

            // 工務店IDだけの配列を作って重複削除する
            var komuten_ids = [];
            unpaid_records.filter((unpaid_record) => {
                komuten_ids.push(unpaid_record[constructionShopId_COLLECT]['value']);
            });

            komuten_ids = komuten_ids.filter((id, index, self) => {
                return self.indexOf(id) === index;
            });

            // 各工務店IDごとに金額を合計する
            var sum_result = [];
            komuten_ids.map((komuten_id) => {
                var unpaid_total = 0;
                unpaid_records.map((unpaid_record) => {
                    if (unpaid_record[constructionShopId_COLLECT]['value'] === komuten_id) {
                        unpaid_total += Number(unpaid_record[unpaidAmount_COLLECT]['value']);
                    }
                });

                sum_result.push({
                    [constructionShopId_COLLECT]: komuten_id,
                    [unpaidAmount_COLLECT]: unpaid_total
                })
            });

            resolve(sum_result);
        });
    }

    function updateKomutenTotalUnpaidAmount(sum_result) {
        return new kintone.Promise((resolve, reject) => {
            console.log('計算結果を工務店マスタにUPDATEする');

            // 計算結果をPUTメソッド用に加工する
            var put_records = [];
            sum_result.map((sum) => {
                put_records.push(
                    {
                        'updateKey': {
                            "field": constructionShopId_KOMUTEN,
                            "value": sum[constructionShopId_COLLECT]
                        },
                        'record': {
                            [unpaidAmount_KOMUTEN]: {
                                'value': sum[unpaidAmount_COLLECT]
                            }
                        }
                    }
                );
            });

            // UPDATE
            var request_body = {
                'app': APP_ID_KOMUTEN,
                'records': put_records
            };
            kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', request_body
            , (resp) => {
                resolve(resp.records.length);
            }, (err) => {
                console.log(err);
                reject(err);
            });
        });
    }
})();
