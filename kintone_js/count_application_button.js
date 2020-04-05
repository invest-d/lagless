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

    const KINTONE_GET_MAX_SIZE = 500;

    const APP_ID_APPLY = kintone.app.getId();
    const fieldRecordNo_APPLY = 'レコード番号';
    const fieldKyoryokuId_APPLY = 'ルックアップ';
    const fieldStatus_APPLY = '状態';
    const statusPaid_APPLY = '実行完了';

    const APP_ID_KYORYOKU = 88; // 開発・本番とも共通のため固定
    const fieldKyoryokuId_KYORYOKU = '支払企業No_';
    const fieldNumberOfApplication_KYORYOKU = 'numberOfApplication';

    kintone.events.on('app.record.index.show', function(event) {
        if (needShowButton()) {
            let button = getCountAppliesButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function needShowButton() {
        // 当初はボタンの表示が必要なタイミングでのみ表示する予定だったが、常に表示するように仕様変更
        return document.getElementById('countApplies') === null;
    }

    function getCountAppliesButton() {
        let countApplies = document.createElement('button');
        countApplies.id = 'countApplies';
        countApplies.innerText = '直近一年間の申込み回数を更新';
        countApplies.addEventListener('click', clickCountApplies);
        return countApplies;
    }

    // ボタンクリック時の処理を定義
    function clickCountApplies() {
        getAppliesLastYear()
        .then((kyoryoku_id_array) => {
            return countByKyoryokuId(kyoryoku_id_array);
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
            new kintone.Promise((rslv) => {
                console.log('直近1年間に実行完了している申込レコードを全て取得する');
                console.log('カーソル作成');

                // 過去1年間のレコードを取得するため、件数が多くなることを想定
                let request_body = {
                    "app": APP_ID_APPLY,
                    "fields": [fieldKyoryokuId_APPLY],
                    "query": `${fieldStatus_APPLY} in (\"${statusPaid_APPLY}\") and ${getQueryPaidInLastYear()} order by ${fieldRecordNo_APPLY} asc`,
                    "size": KINTONE_GET_MAX_SIZE
                };

                kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'POST', request_body
                , (resp) => {
                    rslv(resp.id);
                }, (err) => {
                    console.log(err);
                    reject(err);
                })
            })
            .then(async (cursor_id) => {
                console.log('カーソル取得');
                let request_body = {
                    'id': cursor_id
                };

                let kyoryoku_records = [];
                let records_remaining = true;
                do {
                    let resp = await kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'GET', request_body);
                    kyoryoku_records = kyoryoku_records.concat(resp.records);
                    records_remaining = resp.next;
                } while (records_remaining);

                resolve(kyoryoku_records);
            })
            .catch((err)=> {
                reject(err);
            });
        });
    }

    function countByKyoryokuId(kyoryoku_id_array) {
        return new Promise((resolve) => {
            console.log('協力会社IDごとに回数をカウントする');
            // 想定する引数の値：[{"ルックアップ": {"type": "hoge", "value": "foo"}}, ...]
            // まずvalueだけ抜き出す
            let values = [];
            kyoryoku_id_array.forEach((field) => {
                values.push(field[fieldKyoryokuId_APPLY]["value"]);
            })

            // それぞれカウント
            let counts = {};
            for(let i = 0; i < values.length; i++) {
                let key = values[i];
                counts[key] = (counts[key])
                    ? counts[key] + 1
                    : 1;
            }

            // 空白は不要なので消しておく
            delete counts[''];
            resolve(counts);
        })
    }

    function updateKyoryokuMaster(counted_by_kyoryoku_id) {
        return new kintone.Promise((resolve) => {
            let update_process = new kintone.Promise((rslv) => {
                console.log('カウント結果をもとに協力会社マスタを更新する');

                let put_records = [];

                // 重複禁止フィールドをキーにしているのでレコード番号は不要
                Object.keys(counted_by_kyoryoku_id).forEach((kyoryoku_id) => {
                    put_records.push(
                        {
                            "updateKey": {
                                "field": fieldKyoryokuId_KYORYOKU,
                                "value": kyoryoku_id
                            },
                            "record": {
                                fieldNumberOfApplication_KYORYOKU: {
                                    "value": counted_by_kyoryoku_id[kyoryoku_id]
                                }
                            }
                        }
                    );
                });

                // 一度に更新できるレコード数は100件までなので、put_recordsを100件ごとに分割する
                let divided_records = arrayChunk(put_records, 100);
                let promises = [];
                divided_records.forEach((records) => {
                    let put_promise = new kintone.Promise((put_resolve) => {
                        let request_body = {
                            "app": APP_ID_KYORYOKU,
                            "records": records
                        };

                        kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', request_body
                        , (resp) => {
                            put_resolve(resp.records.length);
                        });
                    });
                    promises.push(put_promise);
                });

                kintone.Promise.all(promises).then((put_results) => {
                    let updated_count = 0;
                    put_results.forEach((result) => {
                        updated_count += Number(result);
                    });

                    rslv(updated_count);
                });
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
                let updated_ids = [];
                console.log('更新済みIDの一覧');
                Object.keys(counted_by_kyoryoku_id).forEach((kyoryoku_id) => {
                    updated_ids.push(kyoryoku_id);
                });
                console.log(updated_ids);
                return getZeroTargetIds(updated_ids);
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

    // ...arrayを分割して二次元配列にして返す。二次元配列内の各配列の要素数はsizeで指定した数になる。最後の配列の要素数はあまり。
    function arrayChunk([...array], size = 1) {
        return array.reduce((acc, value, index) => index % size ? acc : [...acc, array.slice(index, index + size)], []);
    }

    function getZeroTargetIds(updated_ids) {
        return new kintone.Promise((resolve) => {
            console.log('協力会社マスタから、updated_ids以外で申込み回数が1回以上の協力会社IDを取得する');

            // in条件に使用する文字列を取得する。 '("1", "87", "48", ...)'
            let in_query = '(\"' + updated_ids.join('\",\"') + '\")';

            let request_body = {
                'app': APP_ID_KYORYOKU,
                'fields': [fieldKyoryokuId_KYORYOKU],
                'query': `${fieldNumberOfApplication_KYORYOKU} > 0 and ${fieldKyoryokuId_KYORYOKU} not in ${in_query}`
            };

            kintone.api(kintone.api.url('/k/v1/records', true), 'GET', request_body, (resp) => {
                resolve(resp);
            });
        })
    }

    function updateToZeroCount(zero_target_ids) {
        return new kintone.Promise((resolve, reject) => {
            let request_body = {
                "app": APP_ID_KYORYOKU,
                "records": []
            };

            zero_target_ids.records.forEach((kyoryoku_id_obj) => {
                request_body.records.push(
                    {
                        "updateKey": {
                            "field": fieldKyoryokuId_KYORYOKU,
                            "value": kyoryoku_id_obj[fieldKyoryokuId_KYORYOKU]["value"]
                        },
                        "record": {
                            [fieldNumberOfApplication_KYORYOKU]: {
                                "value": 0
                            }
                        }
                    }
                );
            });

            kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', request_body
            , (resp) => {
                resolve(resp.records.length);
            }, (err) => {
                alert('レコードの更新に失敗しました')
                console.log(err);
                reject(err);
            });
        });
    }

    function getQueryPaidInLastYear() {
        // クエリに使う日付書式は"更新日時 > \"2012-02-03T09:00:00+0900\""で、ダブルクォートのエスケープが必要
        let target_date = new Date();
        target_date.setFullYear(target_date.getFullYear() - 1);
        target_date.setHours(0, 0, 0, 0);
        let a_year_ago_today = String(target_date.getFullYear())
            + "-" + ("0" + String(target_date.getMonth() + 1)).slice(-2)
            + "-" + ("0" + String(target_date.getDate())).slice(-2)
            + "T"
            + ("0" + String(target_date.getHours())).slice(-2)
            + ":" + ("0" + String(target_date.getMinutes())).slice(-2)
            + ":" + ("0" + String(target_date.getSeconds())).slice(-2)
            + "+0900"; //タイムゾーン
        return `paymentDate >= \"${a_year_ago_today}\"`
    }
})();
