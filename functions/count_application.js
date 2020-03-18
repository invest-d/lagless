const functions = require('firebase-functions');
const axios = require('axios');
const dateformat = require('dateformat');

const APP_ID_APPLY = "159";
const API_TOKEN_APPLY = "0cHzTCRQCAmDOvdl6Rvx36MjoMVjHpnIoghszkC3";

const APPLY_TABLE_REQUEST_HEADER_GET = {
    "Host": "investdesign.cybozu.com:" + APP_ID_APPLY,
    "X-Cybozu-API-Token": API_TOKEN_APPLY,
    "Authorization": "Basic " + API_TOKEN_APPLY
};

const APPLY_TABLE_REQUEST_HEADER_POST = {
    "Host": "investdesign.cybozu.com:" + APP_ID_APPLY,
    "X-Cybozu-API-Token": API_TOKEN_APPLY,
    "Authorization": "Basic " + API_TOKEN_APPLY,
    "Content-Type": "application/json"
};

const APP_ID_KYORYOKU = "88";
const API_TOKEN_KYORYOKU = "UIRiUQyq7cz4MsY7bYXNTTsWi55qJqbZnlPzkJCe";

const KYORYOKU_MASTER_REQUEST_HEADER = {
    "Host": "investdesign.cybozu.com:" + APP_ID_KYORYOKU,
    "X-Cybozu-API-Token": API_TOKEN_KYORYOKU,
    "Authorization": "Basic " + API_TOKEN_KYORYOKU,
    "Content-Type": "application/json"
};

// 各協力会社からの申込みが直近1年間に何度あったかをカウントし、協力会社マスタの所定のフィールドにセットする
exports.count_application = functions.https.onRequest(async (req, res) => {
    // アプリに格納されているレコード全体を対象にする時、1回の取得件数に上限があるため、一度に全レコードをGETすることはできない。
    // 従って、最初に「全体でレコードがいくつあるか」を把握してから、1回の上限件数に気をつけて何度もこまめにGETしていく。
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
        res.status(200).send('ok');
    });
});

function get_applies_count() {
    console.log('フォームからの申込みレコードを取得する');

    let body_cursor = {
        "app": APP_ID_APPLY,
        "fields": ["ルックアップ"],
        "query": `${get_state_query()} and ${get_payment_date_query()} order by レコード番号 asc`
    };

    return get_all_record_num(APPLY_TABLE_REQUEST_HEADER_POST, body_cursor);
}

function get_all_record_num(headers_cursor, body_cursor) {
    let url_cursor = 'https://investdesign.cybozu.com/k/v1/records/cursor.json';

    return axios({
        method: "POST",
        url: url_cursor,
        headers: headers_cursor,
        data: body_cursor
    })
    .then((response) => {
        console.log(response);
        return get_count_num(response, headers_cursor);
    });
}

function get_count_num(response, headers_cursor) {
    // カーソルは件数だけ取得できればもう必要ないので削除
    let url_cursor = 'https://investdesign.cybozu.com/k/v1/records/cursor.json';
    axios({
        method: "DELETE",
        url: url_cursor,
        headers: headers_cursor,
        data: {"id": response.data.id}
    });

    return new Promise((resolve) => {
        resolve(Number(response.data.totalCount));
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

        while (offset < total_count) {
            var params = `?app=${app_id}&query=`
                + encodeURIComponent(get_state_query() + ' and ' + get_payment_date_query() + ` order by レコード番号 asc limit ${request_records} offset ${offset}`)
                + '&fields[0]=' + encodeURIComponent('ルックアップ');
            let url_params = 'https://investdesign.cybozu.com/k/v1/records.json' + params;

            // 即時関数
            (function(url_params) {
                var loop_promise = get_field_array(url_params, APPLY_TABLE_REQUEST_HEADER_GET)
                    .then((field_array) => {
                        return new Promise((resolve) => {
                            kyoryoku_id_array = kyoryoku_id_array.concat(field_array);
                            resolve();
                        });
                    });
                promises.push(loop_promise);
            })(url_params);

            remaining = remaining - request_records;
            offset += request_records;
            if (remaining < 500) {
                request_records = remaining;
            }
        }

        Promise.all(promises).then(((arr) => {
            resolve(kyoryoku_id_array);
        }));
    });
}

function get_field_array(url_params, headers_params) {
    return axios({
        method: 'GET',
        url: url_params,
        headers: headers_params
    })
    .then(response => {
        return new Promise((resolve) => {
            console.log('fields response received.');
            if (typeof(response.data.records.length) !== undefined) {
                console.log(response.data.records.length + 'fields responsed.');
            }

            resolve(response.data.records);
        });
    })
    .catch(err => {
        console.log(err.response.data);
    });
}

function count_by_kyoryoku_id(kyoryoku_id_array) {
    return new Promise((resolve) => {
        // [{"ルックアップ": {"type": "hoge", "value": "foo"}}, ...]
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
    return new Promise((resolve) => {
        var update_process = new Promise((rslv) => {
            console.log('カウント結果をもとに協力会社マスタを更新する');
            // 一度に更新できるレコード数は100件まで

            var url_records = 'https://investdesign.cybozu.com/k/v1/records.json';
            var body_records = {
                "app": APP_ID_KYORYOKU,
                "records": []
            };

            // 重複禁止フィールドをキーにしているのでレコード番号は不要
            Object.keys(kyoryoku_id_count).map((kyoryoku_id) => {
                body_records.records.push(
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

            axios({
                method: "PUT",
                url: url_records,
                headers: KYORYOKU_MASTER_REQUEST_HEADER,
                data: body_records
            })
            .then((response) => {
                var update_records_num = (response.data.records.length)
                    ? response.data.records.length
                    : 0;
                rslv(update_records_num);
            })
            .catch(err => {
                console.log(err);
                res.status(500).send(err.response.data);
                rslv();
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
    return new Promise((resolve) => {
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

        var url_records = 'https://investdesign.cybozu.com/k/v1/records.json';

        axios({
            method: "GET",
            url: url_records,
            headers: KYORYOKU_MASTER_REQUEST_HEADER,
            data: request_body
        })
        .then((response) => {
            resolve(response.data);
        });
    })
}

function update_to_zero_count(zero_target_ids) {
    return new Promise((resolve) => {
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

        var url_records = 'https://investdesign.cybozu.com/k/v1/records.json';

        axios({
            method: "PUT",
            url: url_records,
            headers: KYORYOKU_MASTER_REQUEST_HEADER,
            data: request_body
        })
        .then((response) => {
            if(response.data.records[0] !== null) {
                console.log(response.data.records);
                resolve(response.data.records.length);
            } else {
                alert('レコードの更新に失敗しました');
                console.log(response);
                resolve(null);
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err.response.data);
        });
    });
}

function get_payment_date_query() {
    // 条件は支払日が本日から1年前以降
    // クエリに使う日付書式は"更新日時 > \"2012-02-03T09:00:00+0900\""で、ダブルクォートのエスケープが必要
    var target_date = new Date(); //UTCで取得
    target_date.setFullYear(target_date.getFullYear() - 1);
    target_date.setHours(0, 0, 0, 0);
    var a_year_ago_today = dateformat(target_date, 'yyyy-mm-dd') + 'T' + dateformat(target_date, 'HH:MM:ss') + '+0900';
    return `paymentDate >= \"${a_year_ago_today}\"`
}

function get_state_query() {
    // 状態が実行完了のレコードのみ取得
    return "状態 in (\"実行完了\")";
}
