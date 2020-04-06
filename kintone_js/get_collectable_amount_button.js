/*
    Version 1
    回収アプリのレコードのうち、回収予定のレコードを取得し、
    取引企業Noごとに回収予定金額を合計し、工務店マスタの未回収金額にセットする。
*/

(function () {
    "use strict";

    const APP_ID_KOMUTEN = 96;
    const fieldConstructionShopId_KOMUTEN = 'id';
    const fieldCustomerCode_KOMUTEN = 'customerCode';
    const fieldUnpaidAmount_KOMUTEN = 'uncollectedAmount';

    const APP_ID_COLLECT = kintone.app.getId();
    const fieldConstructionShopId_COLLECT = 'constructionShopId';
    const fieldCustomerCode_COLLECT = 'customerCode';
    const fieldUnpaidAmount_COLLECT = 'scheduledCollectableAmount';
    const fieldStatus_COLLECT = 'collectStatus';
    const statusAlreadyPaid_COLLECT = '回収済み';
    const statusRejected_COLLECT = 'クラウドサイン却下・再作成待ち';

    kintone.events.on('app.record.index.show', function(event) {
        if (needShowButton()) {
            const button = getGetCollectableAmountButton();
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
        const clicked_ok = confirm('回収アプリの未回収金額を合計して取得します。');
        if (!clicked_ok) {
            alert('処理は中断されました。');
            return;
        }

        // 対象となるレコードを回収アプリから全件取得
        let updated_count = 0;
        getUnpaidRecords()
        .then((unpaid_records) => {
            console.log('unpaid records');
            console.log(unpaid_records);

            // 取引企業Noごとに未回収金額を合計
            return sumUnpaidAmountByCustomer(unpaid_records);
        })
        .then((sum_result) => {
            console.log('sum result');
            console.log(sum_result);

            // 工務店マスタに未回収金額をPUT
            return updateKomutenTotalUnpaidAmount(sum_result)
        })
        .then((updated_ids) => {
            console.log('unpaid updated record ids');
            console.log(updated_ids);
            updated_count += updated_ids.length;

            // 未回収金額がゼロになった工務店レコードを更新
            return updateKomutenUnpaidZero(updated_ids);
        })
        .then((updated) => {
            console.log('zero updated record ids');
            console.log(updated);
            updated_count += updated.length;

            alert(`${updated_count}件 の工務店の未回収金額を更新しました。`);
            alert('ページを更新します。');
            window.location.reload();
        }, (err) => {
            alert(err.message);
        });
    }

    function getUnpaidRecords() {
        return new kintone.Promise((resolve, reject) => {
            console.log('回収アプリの中でステータスが(回収済み||却下)以外の全てのレコードを取得する');

            const request_body = {
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
            const customer_codes_collect = unpaid_records.map((unpaid_record) => {
                return unpaid_record[fieldCustomerCode_COLLECT]['value'];
            });

            // 取引企業Noの重複を削除する
            const not_dpl_customers = customer_codes_collect.filter((id, index, self) => {
                return self.indexOf(id) === index;
            });

            // 工務店ID、取引企業Noごとの未回収金額の合計、という2つの情報を持つオブジェクトを作っていく。
            // まず各取引企業Noごとに、{取引企業No: 合計金額}のオブジェクトを作る。
            let sum_by_customers = {};
            for (const customer_code of not_dpl_customers) {
                const unpaid_total = unpaid_records.reduce((total, record) => {
                    if (record[fieldCustomerCode_COLLECT]['value'] === customer_code) {
                        return total + Number(record[fieldUnpaidAmount_COLLECT]['value']);
                    }
                    else {
                        return total + 0;
                    }
                }, 0);

                sum_by_customers[customer_code] = unpaid_total;
            }

            // 次に、取引企業Noに対応する工務店IDの組み合わせを取得する。
            getKomutenCustomerPairs(not_dpl_customers)
            .then((komuten_customer_pairs) => {
                // 最後に、sum_by_customersの取引企業Noの値を、対応する工務店IDで記述したオブジェクトを作成する。
                // 取引企業Noと工務店IDは1:n対応なので、対応する工務店IDが複数ある場合は、同じ未回収金額のオブジェクトを複数作成する。
                const sum_by_constructors = komuten_customer_pairs.map((pair) => {
                    return {
                        [fieldConstructionShopId_COLLECT]: pair[fieldConstructionShopId_KOMUTEN]['value'],
                        [fieldUnpaidAmount_COLLECT]: sum_by_customers[pair[fieldCustomerCode_KOMUTEN]['value']]
                    };
                });

                resolve(sum_by_constructors);
            });
        });
    }

    function getKomutenCustomerPairs(customer_codes_collect) {
        return new kintone.Promise((resolve) => {
            console.log('工務店IDと取引企業Noの組み合わせを取得。回収アプリの取引企業Noのみ');

            const in_query = '(\"' + customer_codes_collect.join('\",\"') + '\")';

            const request_body = {
                'app': APP_ID_KOMUTEN,
                'fields': [fieldConstructionShopId_KOMUTEN, fieldCustomerCode_KOMUTEN],
                'query': `${fieldCustomerCode_KOMUTEN} in ${in_query}`
            }

            kintone.api(kintone.api.url('/k/v1/records', true), 'GET', request_body
            , (resp) => {
                resolve(resp.records);
            });
        });
    }

    function updateKomutenTotalUnpaidAmount(sum_result) {
        return new kintone.Promise((resolve, reject) => {
            console.log('計算結果を工務店マスタにPUTする');

            const request_body = {
                'app': APP_ID_KOMUTEN,
                'records': sum_result.map((sum) => {
                    return {
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
                })
            };

            kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', request_body
            , (resp) => {
                const updated_ids = resp.records.map((record) => record['id']);
                resolve(updated_ids);
            }, (err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    function updateKomutenUnpaidZero(updated_record_ids) {
        return new kintone.Promise((resolve, reject) => {
            console.log('未回収金額がゼロになった工務店の金額をゼロに更新する');

            // updated_idsに含まれていないのに、未回収金額が1円以上の工務店IDを取得。
            const in_query = '(\"' + updated_record_ids.join('\",\"') + '\")';
            const request_body = {
                'app': APP_ID_KOMUTEN,
                'fields': [fieldConstructionShopId_KOMUTEN],
                'query': `$id not in ${in_query} and ${fieldUnpaidAmount_KOMUTEN} > 0`
            };

            new kintone.Promise((rslv) => {
                kintone.api(kintone.api.url('/k/v1/records', true), 'GET', request_body
                , (resp) => {
                    rslv(resp.records);
                }, (err) => {
                    console.log(err);
                    reject(err);
                })
            })
            .then((komuten_records) => {
                const request_body = {
                    'app': APP_ID_KOMUTEN,
                    'records': komuten_records.map((record) => {
                        return {
                            'updateKey': {
                                'field': fieldConstructionShopId_KOMUTEN,
                                'value': record[fieldConstructionShopId_KOMUTEN]['value']
                            },
                            'record': {
                                [fieldUnpaidAmount_KOMUTEN]: {
                                    'value': 0
                                }
                            }
                        };
                    })
                };

                kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', request_body
                , (resp) => {
                    resolve(resp.records);
                }, (err) => {
                    console.log(err);
                    reject(err);
                });
            });
        });
    }
})();
