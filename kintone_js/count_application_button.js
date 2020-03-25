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

    const APP_ID_APPLY = 159;
    const APP_ID_KYORYOKU = 88;

    kintone.events.on('app.record.index.show', function(event) {
        if (need_update_counts()) {
            var button = getCountAppliesButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function need_update_counts() {
        // 当初はボタンの表示が必要なタイミングでのみ表示する予定だったが、常に表示するように仕様変更
        return true;

        // 更新が必要なタイミングかどうかを判定する。下記の条件を満たすと更新すべきタイミング。
        //     実行完了 かつ 支払日が1年を超えて過去 かつ 申し込み回数に算入中 のレコードがある場合（現在表示中の回数より多いので、減らすよう更新すべき）
        //     もしくは
        //     実行完了 かつ 支払日が1年以内 かつ 申し込み回数に算入中でない のレコードが存在する場合（現在表示中の回数より少ないので、増やすよう更新すべき）
        // return (is_showing_too_many_count() || is_showing_too_few_count())
    }

    // function is_showing_too_many_count() {
    //     // 一度に取得可能なレコード数は500件だが、取得件数は少ないことを想定
    //     // 条件を満たすレコードが存在するかどうかだけを判定する
    //     var request_body = {
    //         'app': APP_ID_APPLY,
    //         'query': `状態 in ("実行完了") and paymentDate < ${get_today_query_format()} and counted in ("申込み回数に算入中")`,
    //         'totalCount': true
    //     }

    //     kintone.api(kintone.api.url('/k/v1/records', true), 'GET', request_body, (resp) => {
    //         if (typeof(resp.totalCount) === Number) {
    //             return resp.totalCount
    //         } else {
    //             return 0;
    //         }
    //     })
    // }

    function getCountAppliesButton() {
        var countApplies = document.createElement('button');
        countApplies.id = 'countApplies';
        countApplies.innerText = '直近一年間の申込み回数を更新';
        countApplies.addEventListener('click', clickCountApplies);
        return countApplies;
    }

    // ボタンクリック時の処理を定義
    function clickCountApplies() {
        get_applies_count()
        .then(record_count => {
            console.log('found ' + record_count + ' records.');
            return get_kyoryoku_id_array(record_count, APP_ID_APPLY);
        })
        .then((kyoryoku_id_array) => {
            console.log('協力会社IDの一覧を取得完了');
            console.log(kyoryoku_id_array);
            if (typeof(kyoryoku_id_array.length) !== undefined) {
                console.log(kyoryoku_id_array.length);
            }
            return count_by_kyoryoku_id(kyoryoku_id_array);
        })
        .then((kyoryoku_id_count) => {
            console.log(kyoryoku_id_count);
            return update_kyoryoku_master(kyoryoku_id_count);
        })
        .then((update_records_num) => {
            console.log(update_records_num + ' records updated.');
            alert('申込み回数の更新を完了しました。');
        });
    }

    function get_applies_count() {
        console.log('フォームからの申込みレコードを取得する');

        let body_cursor = {
            "app": APP_ID_APPLY,
            "fields": ["ルックアップ"],
            "query": `${get_state_query()} and ${get_payment_date_query()} order by レコード番号 asc`
        };

        return new kintone.Promise((resolve, reject) => {
            kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'POST', body_cursor
            , (resp) => {
                resolve(resp.totalCount);
            }, (err) => {
                console.log(err);
                reject(err);
            })
        });
    }

    function get_kyoryoku_id_array(total_count, app_id) {
        return new Promise((resolve) => {
            console.log('条件に合致するすべての協力会社IDを取得');
            // 一度に取得可能なレコード件数が500件なので、500件ずつ取得していく
            var kyoryoku_id_array = [];
            var offset = 0;
            var request_records = (total_count <= 500) //全件数が500件以内であれば、その全件数に合わせる
                ? total_count
                : 500;
            var remaining = total_count;
            var promises = [];

            var safety = 0;
            while (offset < total_count) {
                // 即時関数
                (function() {
                    var loop_promise = get_field_array(request_records, offset)
                        .then((field_array) => {
                            return new Promise((resolve) => {
                                kyoryoku_id_array = kyoryoku_id_array.concat(field_array);
                                resolve();
                            });
                        });
                    promises.push(loop_promise);
                })();

                remaining = Number(remaining) - Number(request_records);
                offset += Number(request_records);
                if (remaining < 500) {
                    request_records = remaining;
                }

                safety++;

                if (safety > 10) {
                    console.log('break while loop.');
                    break;
                }
            }

            Promise.all(promises).then(((arr) => {
                resolve(kyoryoku_id_array);
            }));
        });
    }

    function get_field_array(request_records, offset) {
        return new kintone.Promise((resolve, reject) => {
            var request_body = {
                'app': APP_ID_APPLY,
                'fields': ['ルックアップ'],
                'query': `${get_state_query()} and ${get_payment_date_query()} order by レコード番号 asc limit ${request_records} offset ${offset}`
            };
            console.log(request_body);

            kintone.api(kintone.api.url('/k/v1/records', true), 'GET', request_body
            , (resp) => {
                if(resp.records[0] !== null) {
                    console.log(resp.records);
                    resolve(resp.records);
                } else {
                    alert('レコードの取得に失敗しました');
                    console.log(resp);
                }
            }, (err) => {
                alert('レコードの取得に失敗しました')
                console.log(err);
                reject(err);
            });
        });
    }

    function count_by_kyoryoku_id(kyoryoku_id_array) {
        return new Promise((resolve) => {
            // 想定する引数の値：[{"ルックアップ": {"type": "hoge", "value": "foo"}}, ...]
            // まずvalueだけ抜き出す
            var values = [];
            kyoryoku_id_array.map((field) => {
                values.push(field["ルックアップ"]["value"]);
            })

            // それぞれカウント
            var counts = {};
            for(var i = 0; i < values.length; i++) {
                var key = values[i];
                counts[key] = (counts[key])
                    ? counts[key] + 1
                    : 1;
            }

            // 空白は不要なので消しておく
            delete counts[''];
            resolve(counts);
        })
    }

    function update_kyoryoku_master(kyoryoku_id_count) {
        return new kintone.Promise((resolve) => {
            var update_process = new kintone.Promise((rslv) => {
                console.log('カウント結果をもとに協力会社マスタを更新する');
                // 一度に更新できるレコード数は100件まで

                var request_body = {
                    "app": APP_ID_KYORYOKU,
                    "records": []
                };

                // 重複禁止フィールドをキーにしているのでレコード番号は不要
                Object.keys(kyoryoku_id_count).map((kyoryoku_id) => {
                    request_body.records.push(
                        {
                            "updateKey": {
                                "field": "支払企業No_",
                                "value": kyoryoku_id
                            },
                            "record": {
                                "numberOfApplication": {
                                    "value": kyoryoku_id_count[kyoryoku_id]
                                }
                            }
                        }
                    );
                });

                kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', request_body
                , (resp) => {
                    if(resp.records[0] !== null) {
                        console.log(resp.records);
                        rslv(resp.records.length);
                    } else {
                        alert('レコードの更新に失敗しました');
                        console.log(resp);
                        rslv(null);
                    }
                }, (err) => {
                    alert('レコードの更新に失敗しました')
                    console.log(err);
                    reject(err);
                });
            });

            var not_zero_update_count = 0;
            update_process.then((update_count) => {
                // 申込み回数がゼロ回になった協力会社を更新する。
                // ゼロ回になった協力会社 とは：
                //   先ほどのupdate処理に含まれていない協力会社である
                //   かつ 申込回数が1回以上になっている
                not_zero_update_count = update_count;

                var updated_ids = [];
                console.log('更新済みIDの一覧');
                Object.keys(kyoryoku_id_count).map((kyoryoku_id) => {
                    updated_ids.push(kyoryoku_id);
                });
                console.log(updated_ids);
                return get_zero_target_ids(updated_ids);
            })
            .then((zero_target_ids) => {
                console.log('ゼロ回に更新すべき協力会社IDの一覧を取得完了');
                console.log(zero_target_ids);
                return update_to_zero_count(zero_target_ids);
            })
            .then((zero_updated_count) => {
                resolve(Number(not_zero_update_count) + Number(zero_updated_count));
            });
        });
    }

    function get_zero_target_ids(updated_ids) {
        return new kintone.Promise((resolve) => {
            console.log('協力会社マスタから、updated_ids以外で申込み回数が1回以上の協力会社IDを取得する');

            // in条件に使用する文字列を取得する。 '("1", "87", "48", ...)'
            var updated_ids_format = '(';
            // ループ操作の最後を知る必要があるのでmapはやめとく
            for (var index = 0; index < updated_ids.length; index++) {
                var elem = '\"' + String(updated_ids[index]) + '\"';
                if (index !== updated_ids.length -1) {
                    // 最後の要素でない場合はカンマを追加
                    elem += ', ';
                }
                updated_ids_format += elem;
            }
            // 最後に閉じカッコ
            updated_ids_format += ')';

            var request_body = {
                'app': APP_ID_KYORYOKU,
                'fields': ['支払企業No_'],
                'query': 'numberOfApplication > 0 and 支払企業No_ not in ' + updated_ids_format
            };

            kintone.api(kintone.api.url('/k/v1/records', true), 'GET', request_body, (resp) => {
                resolve(resp);
            });
        })
    }

    function update_to_zero_count(zero_target_ids) {
        return new kintone.Promise((resolve) => {
            console.log('ゼロ回更新対象');
            console.log(zero_target_ids);
            var request_body = {
                "app": APP_ID_KYORYOKU,
                "records": []
            };

            zero_target_ids.records.map((kyoryoku_id_obj) => {
                request_body.records.push(
                    {
                        "updateKey": {
                            "field": "支払企業No_",
                            "value": kyoryoku_id_obj["支払企業No_"]["value"]
                        },
                        "record": {
                            "numberOfApplication": {
                                "value": 0
                            }
                        }
                    }
                );
            });

            kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', request_body
            , (resp) => {
                if(resp.records[0] !== null) {
                    console.log(resp.records);
                    resolve(resp.records.length);
                } else {
                    alert('レコードの更新に失敗しました');
                    console.log(resp);
                    resolve(null);
                }
            }, (err) => {
                alert('レコードの更新に失敗しました')
                console.log(err);
                reject(err);
            });
        });
    }

    function get_state_query() {
        // 状態が実行完了のレコードのみ取得
        return "状態 in (\"実行完了\")";
    }

    function get_payment_date_query() {
        // クエリに使う日付書式は"更新日時 > \"2012-02-03T09:00:00+0900\""で、ダブルクォートのエスケープが必要
        var target_date = new Date();
        target_date.setFullYear(target_date.getFullYear() - 1);
        target_date.setHours(0, 0, 0, 0);
        var a_year_ago_today = String(target_date.getFullYear())
            + "-" + ("0" + String(target_date.getMonth() + 1)).slice(-2)
            + "-" + ("0" + String(target_date.getDate())).slice(-2)
            + "T"
            + ("0" + String(target_date.getHours())).slice(-2)
            + ":" + ("0" + String(target_date.getMinutes())).slice(-2)
            + ":" + ("0" + String(target_date.getSeconds())).slice(-2)
            + "+0900"; //タイムゾーンは妥協
        return `paymentDate >= \"${a_year_ago_today}\"`
    }

})();
