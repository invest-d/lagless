/*
    Version 1
    回収アプリ(160)のレコードのうち、回収予定のレコードを取得し、
    取引企業Noごとに回収予定金額を合計し、工務店マスタ(96)の未回収金額にセットする。
*/

(function () {
    "use strict";

    const APP_ID_KOMUTEN = 96;
    const fieldConstructionShopId_KOMUTEN = 'id';
    const fieldCustomerCode_KOMUTEN = 'customerCode';
    const fieldUnpaidAmount_KOMUTEN = 'uncollectedAmount';

    const APP_ID_COLLECT = 160;
    const fieldConstructionShopId_COLLECT = 'constructionShopId';
    const fieldCustomerCode_COLLECT = 'customerCode';
    const fieldUnpaidAmount_COLLECT = 'scheduledCollectableAmount';
    const fieldStatus_COLLECT = 'collectStatus';
    const statusAlreadyPaid_COLLECT = '回収済み';
    const statusRejected_COLLECT = 'クラウドサイン却下・再作成待ち';

    kintone.events.on('app.record.index.show', function(event) {
        if (needShowButton()) {
            let button = getGetCollectableAmountButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function needShowButton() {
        // 一旦は常にボタンを表示する。増殖バグだけ防止
        return document.getElementById('getCollectable') === null;
    }

    function getGetCollectableAmountButton() {
        let getCollectable = document.createElement('button');
        getCollectable.id = 'getCollectable';
        getCollectable.innerText = '各工務店の未回収金額を更新';
        getCollectable.addEventListener('click', clickGetCollectableAmount);
        return getCollectable;
    }

    // ボタンクリック時の処理を定義
    function clickGetCollectableAmount() {
        let clicked_ok = confirm('回収アプリの未回収金額を合計して取得します。');
        if (!clicked_ok) {
            alert('処理は中断されました。');
            return;
        }

        // 対象となるレコードを回収アプリから全件取得
        getUnpaidRecords()
        .then((unpaid_records) => {
            console.log(unpaid_records);

            // 取引企業Noごとに未回収金額を合計
            return sumUnpaidAmountByCustomer(unpaid_records);
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
            // window.location.reload();
        }, (err) => {
            alert(err.message);
        });
    }

    function getUnpaidRecords() {
        return new kintone.Promise((resolve, reject) => {
            console.log('回収アプリの中でステータスが(回収済み||却下)以外の全てのレコードを取得する');

            let request_body = {
                'app': APP_ID_COLLECT,
                'fields': [
                    fieldConstructionShopId_COLLECT,
                    fieldCustomerCode_COLLECT,
                    fieldUnpaidAmount_COLLECT
                ],
                'query': `${fieldStatus_COLLECT} not in (\"${statusAlreadyPaid_COLLECT}\", \"${statusRejected_COLLECT}\") order by レコード番号 asc`
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

    function sumUnpaidAmountByCustomer(unpaid_records) {
        return new kintone.Promise((resolve, reject) => {
            console.log('取引企業Noごとに未回収金額を合計する。');

            // 取引企業Noの配列を作る
            let customer_codes_collect = [];
            unpaid_records.filter((unpaid_record) => {
                customer_codes_collect.push(unpaid_record[fieldCustomerCode_COLLECT]['value']);
            });

            // 取引企業Noの重複を削除する
            let not_dpl_customers = customer_codes_collect.filter((id, index, self) => {
                return self.indexOf(id) === index;
            });

            // このあとPUTするときに工務店IDが必要になるので、工務店IDと取引企業Noの組み合わせを取得
            getKomutenCustomerPairs(not_dpl_customers)
            .then((komuten_customer_pairs) => {
                // 各取引企業Noごとに金額を合計する
                let sum_result = [];
                not_dpl_customers.forEach((customer_code) => {
                    let unpaid_total = 0;
                    unpaid_records.forEach((unpaid_record) => {
                        if (unpaid_record[fieldCustomerCode_COLLECT]['value'] === customer_code) {
                            unpaid_total += Number(unpaid_record[fieldUnpaidAmount_COLLECT]['value']);
                        }
                    });

                    // sum_resultに工務店IDの情報を入力。
                    // 同一の取引企業Noを持つ工務店IDが複数ある場合は、全ての工務店IDに同じ金額を設定
                    komuten_customer_pairs.forEach((pair) => {
                        if (pair[fieldCustomerCode_KOMUTEN]['value'] === customer_code) {
                            sum_result.push({
                                [fieldConstructionShopId_COLLECT]: pair[fieldConstructionShopId_KOMUTEN]['value'],
                                [fieldUnpaidAmount_COLLECT]: unpaid_total
                            });
                        }
                    });
                });
                resolve(sum_result);
            });

        });
    }

    function getKomutenCustomerPairs(customer_codes_collect) {
        return new kintone.Promise((resolve) => {
            console.log('工務店IDと取引企業Noの組み合わせを取得。回収アプリの取引企業Noのみ');

            let in_query = '(\"' + customer_codes_collect.join('\",\"') + '\")';

            let request_body = {
                'app': APP_ID_KOMUTEN,
                'fields': [fieldConstructionShopId_KOMUTEN, fieldCustomerCode_KOMUTEN],
                'query': `${fieldCustomerCode_KOMUTEN} in ${in_query}`
            }

            kintone.api(kintone.api.url('/k/v1/records', true), 'GET', request_body
            , (resp) => {
                resolve(resp.records);
            });
        })
    }

    function updateKomutenTotalUnpaidAmount(sum_result) {
        return new kintone.Promise((resolve, reject) => {
            console.log('計算結果を工務店マスタにPUTする');

            // PUTするには一意のキーを指定する必要があるが、sum_resultは一意のキー（工務店ID）を持っていない。
            // 従って工務店IDを持たせたput_recordsを別途生成する。
            let put_records = [];
            sum_result.forEach((sum) => {
                put_records.push(
                    {
                        'updateKey': {
                            "field": fieldConstructionShopId_KOMUTEN,
                            "value": sum[fieldConstructionShopId_COLLECT]
                        },
                        'record': {
                            [fieldUnpaidAmount_KOMUTEN]: {
                                'value': sum[fieldUnpaidAmount_COLLECT]
                            }
                        }
                    }
                );
            });

            // PUT
            let request_body = {
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
