/*
    Version 1
    審査アプリ(79)に記載されている与信枠を工務店マスタ(96)に転記するボタンを設置する。

    審査アプリと工務店マスタの対応付け
        審査Ver2.0.取引企業管理No_審査対象企業（＝取引企業管理.レコード番号）

        工務店マスタ.customerCode（＝取引企業管理.レコード番号）

    審査アプリの対象フィールドコード
        付与与信枠_決定金額_標準と高額

    取得条件
        同一企業に対して複数回の審査が存在することを想定。（毎月審査を更新の予定）
        同一の取引企業管理No.のレコードをまとめた中で、
        審査完了日が最も新しいレコードを採用する。
*/

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

(function (){
    "use strict";

    kintone.events.on('app.record.index.show', function(event) {
        if (need_update_counts()) {
            var button = getCopyCreditButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });
})();

function need_update_counts() {
    // 一旦は常にボタンを表示する
    return true;
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

    // 審査が毎月行われていることを信じ、審査完了日が先月中のレコードのみ取得。
    getJudgeRecordsInLastMonth()
    .then((update_targets_array) => {
        if (update_targets_array.length <= 0) {
            throw new Error('新たに審査された企業はありませんでした。\nどの工務店の付与与信枠も更新されていません。');
        }
        // 1カ月以内に複数回審査する可能性は想定しない。
        // 取引企業Noと与信枠が1:1対応になっているパターンのみ想定。
        // 1カ月以内に審査が行われていない場合、工務店マスタの付与与信枠は更新されない。
        return updateKomutenCredits(update_targets_array);
    })
    .then((updated_count) => {
        alert(`更新が完了しました。\n更新されたのは ${updated_count}件 です。\n1ヵ月以内に審査が行われていない企業は更新されていません。`);
        alert('ページを更新します');
        location.reload();
    }, (err) => {
        alert(err.message);
    });
}

function getJudgeRecordsInLastMonth() {
    return new kintone.Promise((resolve, reject) => {
        console.log('審査アプリの中で審査完了日が先月中～今日までのレコードをすべて取得する。');

        var request_body = {
            'app': APP_ID_JUDGE,
            'fields': [customerCode_JUDGE, creditAmount_JUDGE],
            'query': `(${judgedDay_JUDGE} = LAST_MONTH() or ${judgedDay_JUDGE} = THIS_MONTH()) and ${creditAmount_JUDGE} > 0`
        };

        kintone.api(kintone.api.url('/k/v1/records', true), 'GET', request_body, (resp) => {
            resolve(resp.records);
        }, (err) => {
            reject(err);
        });
    });
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
                reject('工務店マスタの中で、1カ月以内に審査が行われた企業はありませんでした。\nどの工務店の付与与信枠も更新されていません。');
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
