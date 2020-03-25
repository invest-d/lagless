/*
    Version 1
    審査アプリ(79)に記載されている与信枠を工務店マスタ(96)に転記するボタンを設置する。

    審査アプリと工務店マスタの対応付け
        審査Ver2.0側：取引企業管理No_審査対象企業（＝取引企業管理.レコード番号）
        工務店マスタ側：customerCode（＝取引企業管理.レコード番号）

        つまり、二つのアプリがどちらも参照している取引企業Noによって対応付ける。

    審査アプリの転記対象フィールドコード
        付与与信枠_決定金額_標準と高額

    取得条件
        同一企業に対して複数回の審査が存在することを想定。（毎月審査を更新の予定）
        同一の取引企業管理No.のレコードをまとめた中で、
        審査完了日が最も新しいレコードを採用する。
*/

(function (){
    "use strict";

    const KINTONE_GET_MAX_SIZE = 500;

    const APP_ID_JUDGE = 79;
    // フィールドコード
    const customerCode_JUDGE = '取引企業管理No_審査対象企業';
    const creditAmount_JUDGE = '付与与信枠_決定金額_標準と高額';
    const judgedDay_JUDGE = '審査完了日';

    const APP_ID_KOMUTEN = 96;
    const recordNo_KOMUTEN = 'レコード番号';
    const customerCode_KOMUTEN = 'customerCode';
    const creditFacility_KOMUTEN = 'creditFacility';

    kintone.events.on('app.record.index.show', function(event) {
        if (need_update_counts()) {
            var button = getCopyCreditButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function need_update_counts() {
        // 現状は常にボタンを表示する。増殖バグだけ防止
        return document.getElementById('copyCredit') === null;
    }

    function getCopyCreditButton() {
        var copyCredit = document.createElement('button');
        copyCredit.id = 'copyCredit';
        copyCredit.innerText = '最新の与信枠を取得';
        copyCredit.addEventListener('click', clickCopyCredit);
        return copyCredit;
    }

    // ボタンクリック時の処理を定義
    function clickCopyCredit() {
        var clicked_ok = confirm('付与与信枠を最新の額に更新しますか？');
        if (!clicked_ok) {
            alert('処理は中断されました。');
            return;
        }

        // 審査内容が最新のレコードを取得。判定基準は審査完了日フィールド。
        getLatestJudgeRecords()
        .then((update_targets_array) => {
            if (update_targets_array.length <= 0) {
                throw new Error('与信枠が入力済みの企業はありませんでした。\nどの工務店の付与与信枠も更新されていません。');
            }

            return updateKomutenCredits(update_targets_array);
        })
        .then((updated_count) => {
            alert(`更新が完了しました。\n更新されたのは ${updated_count}件 です。`);
            alert('ページを更新します');
            location.reload();
        }, (err) => {
            alert(err.message);
        });
    }

    function getLatestJudgeRecords() {
        return new kintone.Promise((resolve, reject) => {
            new kintone.Promise((rslv) => {
                console.log('審査アプリの中で審査完了日が最新のレコードを取引企業Noごとにすべて取得する。');

                // 全件取得してから、取引企業Noごとの最新レコードを抜き出す
                var request_body = {
                    'app': APP_ID_JUDGE,
                    'fields': [customerCode_JUDGE, creditAmount_JUDGE, judgedDay_JUDGE],
                    'query': `${creditAmount_JUDGE} >= 0`, // ヤバい取引企業は与信枠ゼロにして対応することもある
                    'size': KINTONE_GET_MAX_SIZE
                };

                kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'POST', request_body, (resp) => {
                    rslv(resp.id);
                }, (err) => {
                    reject(err);
                });
            })
            .then((cursor_id) => {
                return new kintone.Promise(async (resolve) => {
                    var request_body = {
                        'id': cursor_id
                    };

                    var records = [];

                    var remaining = true;
                    do {
                        var resp = await kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'GET', request_body);
                        records = records.concat(resp.records);
                        remaining = resp.next;
                    } while (remaining);

                    resolve(records);
                });
            })
            .then((all_judge_records) => {
                // それぞれの取引企業Noについて、審査完了日が最新のものだけを抽出する
                var key_pair = {};

                // key_pairに、取引企業Noごとに最新の審査完了日を持つレコードを保持しておく。
                all_judge_records.map((judge_record) => {
                    var customer_code = judge_record[customerCode_JUDGE]['value'];
                    var judge_day = judge_record[judgedDay_JUDGE]['value'];

                    // 保持している審査完了日よりも新しいものを発見したら、それを新しく保持
                    if (!(customer_code in key_pair)) {
                        key_pair[customer_code] = judge_record;
                    }
                    else if (getComparableDate(judge_day) > getComparableDate(key_pair[customer_code][judgedDay_JUDGE]['value'])) {
                        key_pair[customer_code] = judge_record;
                    }
                });

                // 最後にkey_pairを配列にして返す
                resolve(Object.values(key_pair));
            });
        });
    }

    function getComparableDate(kintone_formatted_date) {
        var date_info = String(kintone_formatted_date).split('-');
        var date = new Date(Number(date_info[0]), Number(date_info[1]), Number(date_info[2]));
        return date.getTime();
    }

    function updateKomutenCredits(update_targets_array) {
        return new kintone.Promise((resolve, reject) => {
            var get_komuten_info = new kintone.Promise((rslv, rjct) => {
                console.log('工務店マスタからレコードIDと取引企業Noの一覧を取得する');
                // カーソルを作成
                var komuten_cursor = new kintone.Promise((resolve_post_cursor) => {
                    var post_cursor_body = {
                        'app': APP_ID_KOMUTEN,
                        'fields': [recordNo_KOMUTEN, customerCode_KOMUTEN],
                        'size': KINTONE_GET_MAX_SIZE
                    };

                    kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'POST', post_cursor_body, (resp) => {
                        resolve_post_cursor(resp);
                    }, (err) => {
                        reject(err);
                    });
                });

                // カーソルから工務店全件取得
                komuten_cursor.then(async (cursor) => {
                    var get_cursor_body = {
                        'id': cursor.id
                    };

                    var promises = [];
                    var komuten_info = [];
                    var records_remaining = true;
                    do {
                        var resp = await kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'GET', get_cursor_body);
                        Array.prototype.push.apply(komuten_info, resp.records);
                        records_remaining = resp.next;
                    } while (records_remaining);

                    rslv(komuten_info);
                });
            });

            var process_record_ids = get_komuten_info.then((komuten_info) => {
                return new kintone.Promise((rslv) => {
                    // 工務店情報と審査情報を組み合わせて、付与与信枠と工務店マスタのレコードIDを関連付ける。
                    let put_records = [];
                    update_targets_array.map((judge) => {
                        var customer_code = judge[customerCode_JUDGE]['value'];
                        let put_obj = {};
                        // 審査アプリの取引企業Noを工務店マスタの中から探す
                        komuten_info.map((komuten) => {
                            if (komuten[customerCode_KOMUTEN]['value'] === customer_code) {
                                put_obj['id'] = komuten[recordNo_KOMUTEN]['value'];
                                put_obj['record'] = {};
                                put_obj['record'][creditFacility_KOMUTEN] = {};
                                put_obj['record'][creditFacility_KOMUTEN]['value'] = judge[creditAmount_JUDGE]['value'];
                                put_records.push(put_obj);
                            }
                        });
                    });

                    rslv(put_records);
                });
            });

            process_record_ids.then((put_records) => {
                console.log('審査アプリから取得した付与与信枠を工務店アプリのレコードに転記する');

                if (!put_records.length > 0) {
                    console.log('update targets are ' + update_targets_array);
                    reject('工務店マスタの中で、審査が行われている企業はありませんでした。\nどの工務店の付与与信枠も更新されていません。');
                }

                var request_body = {
                    'app': APP_ID_KOMUTEN,
                    'records': put_records
                };

                kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', request_body, (resp) => {
                    resolve(resp.records.length);
                }, (err) => {
                    reject(err);
                });
            });
        });
    }

})();
