/*
    Version 1
    各協力会社の申し込み回数を更新するボタンを設置する。

    申し込み回数は、次の条件を満たしたレコード数をカウントしたものとする。
        状態が実行完了のレコード
        かつ 支払日が本日から1年以内

    申し込み回数の更新は、次のように行う。
        ①申込みレコード全体から、現状の申込み回数を協力会社ごとにカウントして更新
        ②1番の処理でカウントが【無かった】のに、現状の協力会社マスタでカウントが1回以上になっているレコードを0回に更新
        協力会社マスタには1000件以上のレコードがあり、同時に更新可能なレコード数は100件なので、一度に扱うレコード数をなるべく少なくしようとしたらこうなった
*/

(function (){
    "use strict";

    const APP_ID_APPLY = kintone.app.getId();
    const fieldKyoryokuId_APPLY = 'ルックアップ';
    const fieldStatus_APPLY = '状態';
    const statusPaid_APPLY = '実行完了';

    const APP_ID_KYORYOKU = 88; // 開発・本番とも共通のため固定
    const fieldKyoryokuId_KYORYOKU = '支払企業No_';
    const fieldNumberOfApplication_KYORYOKU = 'numberOfApplication';

    const kintoneRecord = new kintoneJSSDK.Record({connection: new kintoneJSSDK.Connection()});

    kintone.events.on('app.record.index.show', function(event) {
        if (needShowButton()) {
            const button = createCountAppliesButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function needShowButton() {
        // 当初はボタンの表示が必要なタイミングでのみ表示する予定だったが、常に表示するように仕様変更
        return document.getElementById('countApplies') === null;
    }

    function createCountAppliesButton() {
        let countApplies = document.createElement('button');
        countApplies.id = 'countApplies';
        countApplies.innerText = '直近一年間の申込み回数を更新';
        countApplies.addEventListener('click', clickCountApplies);
        return countApplies;
    }

    // ボタンクリック時の処理を定義
    function clickCountApplies() {
        getAppliesLastYear()
        .then((kintone_records) => {
            return countByKyoryokuId(kintone_records);
        })
        .then((counted_by_kyoryoku_id) => {
            return updateKyoryokuMaster(counted_by_kyoryoku_id);
        })
        .then((update_records_num) => {
            console.log(update_records_num + ' records updated.');
            alert(update_records_num + '件 の協力会社の申込み回数を更新しました。');
            alert('ページを更新します。');
            window.location.reload();
        });
    }

    function getAppliesLastYear() {
        return new kintone.Promise((resolve, reject) => {
            console.log('直近1年間に実行完了している申込レコードを全て取得する');

            // 過去1年間のレコードを取得するため、件数が多くなることを想定。seek: true
            const request_body = {
                'app': APP_ID_APPLY,
                'fields': [fieldKyoryokuId_APPLY],
                'query': `${fieldStatus_APPLY} in (\"${statusPaid_APPLY}\") and ${getQueryPaidInLastYear()}`,
                'seek': true
            };

            kintoneRecord.getAllRecordsByQuery(request_body).then((resp) => {
                resolve(resp.records);
            })
            .catch((err)=> {
                reject(err);
            });
        });
    }

    function countByKyoryokuId(kintone_records) {
        return new Promise((resolve) => {
            console.log('協力会社IDごとに回数をカウントする');
            // 想定する引数の値：[{"ルックアップ": {"type": "hoge", "value": "foo"}}, ...]
            // まず協力会社IDのvalueだけ抜き出す
            const kyoryoku_ids = kintone_records.map((field) => {
                return field[fieldKyoryokuId_APPLY]["value"];
            });

            // [id]: [回数]の辞書形式にしてそれぞれカウント
            let counts = {};
            for (const id of kyoryoku_ids) {
                counts[id] = counts.hasOwnProperty(id)
                    ? counts[id] + 1
                    : 1;
            }

            // 空白は不要なので消しておく
            delete counts[''];
            resolve(counts);
        })
    }

    function updateKyoryokuMaster(counted_by_kyoryoku_id) {
        return new kintone.Promise((resolve, reject) => {
            const update_process = new kintone.Promise((rslv) => {
                console.log('カウント結果をもとに協力会社マスタを更新する');

                const put_records = Object.entries(counted_by_kyoryoku_id).map(([id, count]) => {
                    return {
                        'updateKey': {
                            'field': fieldKyoryokuId_KYORYOKU,
                            'value': id
                        },
                        'record': {
                            [fieldNumberOfApplication_KYORYOKU]: {
                                'value': count
                            }
                        }
                    };
                });

                const request_body = {
                    'app': APP_ID_KYORYOKU,
                    'records': put_records
                };

                if (request_body['records'].length === 0) {
                    // 更新対象なしのままupdateしようとするとエラーになる
                    rslv(0);
                } else {
                    kintoneRecord.updateAllRecords(request_body).then((resp) => {
                        rslv(resp.results[0].records.length);
                    })
                    .catch((err) => {
                        reject(err);
                    });
                }
            });

            // 最後の「XX件更新しました」メッセージに使う変数
            let not_zero_updated_count = 0;

            update_process.then((updated_count) => {
                console.log('updated count is ' + String(updated_count));
                not_zero_updated_count = updated_count;

                // 前回の処理以降、申込み回数が1回以上からゼロ回になった協力会社を更新する。
                // ゼロ回になった協力会社 とは：
                //   先ほどのupdate処理に含まれていない協力会社である
                //   かつ 申込回数が1回以上になっている
                console.log('更新済みIDの一覧');
                console.log(Object.keys(counted_by_kyoryoku_id));
                return getZeroTargetIds(Object.keys(counted_by_kyoryoku_id));
            })
            .then((zero_target_ids) => {
                console.log('ゼロ回に更新すべき協力会社IDの一覧を取得完了');
                console.log(zero_target_ids);
                return updateToZeroCount(zero_target_ids);
            })
            .then((zero_updated_count) => {
                resolve(Number(not_zero_updated_count) + Number(zero_updated_count));
            });
        });
    }

    function getZeroTargetIds(updated_ids) {
        return new kintone.Promise((resolve) => {
            console.log('協力会社マスタから、updated_ids以外で申込み回数が1回以上の協力会社IDを取得する');

            // in条件に使用する文字列を取得する。 '("1", "87", "48", ...)'
            const in_query = '(\"' + updated_ids.join('\",\"') + '\")';

            const request_body = {
                'app': APP_ID_KYORYOKU,
                'fields': [fieldKyoryokuId_KYORYOKU],
                'query': `${fieldNumberOfApplication_KYORYOKU} > 0 and ${fieldKyoryokuId_KYORYOKU} not in ${in_query}`,
                'seek': true
            };

            kintoneRecord.getAllRecordsByQuery(request_body).then((resp) => {
                resolve(resp);
            });
        })
    }

    function updateToZeroCount(zero_target_ids) {
        return new kintone.Promise((resolve, reject) => {
            const request_body = {
                'app': APP_ID_KYORYOKU,
                'records': zero_target_ids.records.map((kyoryoku_id_obj) => {
                    return {
                        'updateKey': {
                            'field': fieldKyoryokuId_KYORYOKU,
                            'value': kyoryoku_id_obj[fieldKyoryokuId_KYORYOKU]['value']
                        },
                        'record': {
                            [fieldNumberOfApplication_KYORYOKU]: {
                                'value': 0
                            }
                        }
                    };
                })
            };

            if (request_body['records'].length === 0) {
                // 更新対象なしのままupdateしようとするとエラーになる
                resolve(0);
            } else {
                kintoneRecord.updateAllRecords(request_body).then((resp) => {
                    resolve(resp.results[0].records.length);
                })
                .catch((err) => {
                    alert('レコードの更新に失敗しました')
                    console.log(err);
                    reject(err);
                });
            }
        });
    }

    function getQueryPaidInLastYear() {
        // クエリに使う日付書式は"更新日時 > \"2012-02-03T09:00:00+0900\""で、ダブルクォートのエスケープが必要
        let target_date = new Date();
        target_date.setFullYear(target_date.getFullYear() - 1);
        target_date.setHours(0, 0, 0, 0);
        const a_year_ago_today = String(target_date.getFullYear())
            + '-' + ('0' + String(target_date.getMonth() + 1)).slice(-2)
            + '-' + ('0' + String(target_date.getDate())).slice(-2)
            + 'T'
            + ('0' + String(target_date.getHours())).slice(-2)
            + ':' + ('0' + String(target_date.getMinutes())).slice(-2)
            + ':' + ('0' + String(target_date.getSeconds())).slice(-2)
            + '+0900'; //タイムゾーン
        return `paymentDate >= \"${a_year_ago_today}\"`;
    }
})();
