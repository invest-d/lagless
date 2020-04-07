/*
    Version 1
    クラウドサイン却下になったレコードを削除するボタンをレコード詳細画面に設置する。
    回収アプリ上でのレコードを削除するとともに、申込アプリにおける回収IDの紐づけも解消する。
*/

(function () {
    "use strict";

    const APP_ID = ((app_id) => {
        switch(app_id) {
            // 開発版の回収アプリ
            case 160:
                return {
                    APPLY: 159,
                    COLLECT: 160
                };

            // 本番の回収アプリ
            case 162:
                return {
                    APPLY: 161,
                    COLLECT: 162
                };
            default:
                console.warn('Unknown app: ' + app_id);
        }
    })(kintone.app.getId());

    const APP_ID_COLLECT = APP_ID.COLLECT;
    const fieldRecordNo_COLLECT = 'レコード番号';
    const fieldStatus_COLLECT = 'collectStatus';
    const statusRejected_COLLECT = 'クラウドサイン却下・再作成待ち';

    const APP_ID_APPLY = APP_ID.APPLY;
    const fieldRecordNo_APPLY = 'レコード番号';
    const fieldCollectId_APPLY = 'collectId';

    kintone.events.on('app.record.detail.show', function(event) {
        if (needShowButton()) {
            let button = getRejectCollectRecordButton(event);
            kintone.app.record.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function needShowButton() {
        // 増殖バグ防止
        let not_displayed = document.getElementById('getCollectable') === null;

        return not_displayed;
    }

    function getRejectCollectRecordButton(event) {
        let getRejectCollect = document.createElement('button');
        getRejectCollect.id = 'rejectCollect';
        getRejectCollect.innerText = 'クラウドサイン再送信用にレコードを削除する';
        getRejectCollect.addEventListener('click', clickRejectCollectRecord.bind(null, event));
        return getRejectCollect;
    }

    // ボタンクリック時の処理を定義
    function clickRejectCollectRecord(event) {
        // 却下されたレコードでない場合は動作させない
        let rejected = (event.record[fieldStatus_COLLECT]['value'] === statusRejected_COLLECT);
        if (!rejected) {
            alert('削除するには、このレコードの状態を一度却下にして保存してからもう一度操作してください。');
            return;
        }

        let clicked_ok = confirm('申込レコードと回収レコードの結びつきを解除し、\n回収レコードを削除しますか？');
        if (!clicked_ok) {
            alert('処理は中断されました。');
            return;
        }

        getDetailApplies(event.record[fieldRecordNo_COLLECT]['value'])
        .then((detail_ids) => {
            return deleteCollectIdField(detail_ids);
        })
        .then(() => {
            return deleteCollectRecord(event.record[fieldRecordNo_COLLECT]['value']);
        })
        .then((result) => {
            console.log(result);

            alert('回収IDの紐づけを解除し、回収レコードを削除しました。\n不要な申込レコードを「保留中」にした後で、債権譲渡契約準備を開始ボタンを再び押してください。');
            alert('レコード一覧画面に戻ります。');
            window.location.href = `https://investdesign.cybozu.com/k/${APP_ID_COLLECT}/`;
        }, (err) => {
            alert(err.message);
        })
        .catch((err) => {
            console.log(err);
            alert(err);
        });
    }

    function getDetailApplies(collect_record_no) {
        return new kintone.Promise((resolve, reject) => {
            console.log('表示中の回収レコードの明細にあたる申込レコードを全て取得する');

            let request_body = {
                'app': APP_ID_APPLY,
                'fields': [fieldRecordNo_APPLY],
                'query': `${fieldCollectId_APPLY} = ${collect_record_no}`
            };

            kintone.api(kintone.api.url('/k/v1/records', true), 'GET', request_body, function(resp) {
                resolve(resp.records);
            }, function(err) {
                reject(err);
            });
        });
    }

    function deleteCollectIdField(detail_ids) {
        return new kintone.Promise((resolve, reject) => {
            console.log('クラウドサインの明細にあたるレコードの回収IDをブランクに戻す');

            let update_records = [];
            detail_ids.forEach((detail) => {
                update_records.push({
                    'id': detail[fieldRecordNo_APPLY]['value'],
                    'record': {
                        [fieldCollectId_APPLY]: {
                            'value': null
                        }
                    }
                });
            });

            let request_body = {
                'app': APP_ID_APPLY,
                records: update_records
            };

            kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', request_body, (resp) => {
                resolve();
            }, (err) => {
                reject(err);
            });
        });
    }

    function deleteCollectRecord(record_id) {
        return new kintone.Promise((resolve, reject) => {
            console.log('回収アプリから、今開いているレコードを削除する');

            let request_body = {
                'app': APP_ID_COLLECT,
                'ids': [record_id]
            };

            kintone.api(kintone.api.url('/k/v1/records', true), 'DELETE', request_body, (resp) => {
                resolve(resp);
            }, function(err) {
                reject(err);
            });
        });
    };
})();
