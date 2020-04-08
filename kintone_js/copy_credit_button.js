/*
    Version 1
    審査アプリ(79)に記載されている与信枠を工務店マスタ(96)に転記するボタンを設置する。

    審査アプリと工務店マスタの対応付け
        審査Ver2.0側：取引企業管理No_審査対象企業（＝取引企業管理.レコード番号）
        工務店マスタ側：customerCode（＝取引企業管理.レコード番号）

        つまり、二つのアプリがどちらも参照している取引企業管理のレコード番号によって対応付ける。

    審査アプリの転記対象フィールドコード
        付与与信枠_決定金額_標準と高額

    取得条件
        同一企業に対して複数回の審査が存在することを想定。（毎月審査を更新の予定）
        同一の取引企業管理Noのレコードをまとめた中で、
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
    const fieldGetCreditNextTime_KOMUTEN = 'getCreditFacility';
    const statusGetCredit_KOMUTEN = '次回、与信枠を取得する';

    kintone.events.on('app.record.index.show', function(event) {
        if (needShowButton()) {
            let button = getCopyCreditButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function needShowButton() {
        // 現状は常にボタンを表示する。増殖バグだけ防止
        return document.getElementById('copyCredit') === null;
    }

    function getCopyCreditButton() {
        let copyCredit = document.createElement('button');
        copyCredit.id = 'copyCredit';
        copyCredit.innerText = '最新の与信枠を取得';
        copyCredit.addEventListener('click', clickCopyCredit);
        return copyCredit;
    }

    // ボタンクリック時の処理を定義
    function clickCopyCredit() {
        let clicked_ok = confirm('付与与信枠を最新の額に更新しますか？');
        if (!clicked_ok) {
            alert('処理は中断されました。');
            return;
        }

        // 審査内容が最新のレコードを取得。判定基準は審査完了日フィールド。
        getLatestJudgeRecords()
        .then((latest_judge_records) => {
            if (latest_judge_records.length <= 0) {
                throw new Error('与信枠が入力済みの企業はありませんでした。\nどの工務店の付与与信枠も更新されていません。');
            }

            return updateKomutenCredits(latest_judge_records);
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
                let request_body = {
                    'app': APP_ID_JUDGE,
                    'fields': [customerCode_JUDGE, creditAmount_JUDGE, judgedDay_JUDGE],
                    'query': `${judgedDay_JUDGE} != \"\" and ${creditAmount_JUDGE} >= 0`, // ヤバい取引企業は与信枠ゼロにして対応することもあるので、ゼロ円のレコードも取得
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
                    let request_body = {
                        'id': cursor_id
                    };

                    let records = [];

                    let remaining = true;
                    do {
                        let resp = await kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'GET', request_body);
                        records = records.concat(resp.records);
                        remaining = resp.next;
                    } while (remaining);

                    resolve(records);
                });
            })
            .then((all_judge_records) => {
                // 重複なしの取引企業Noを取得
                const customer_codes = all_judge_records
                .map((record) => record[customerCode_JUDGE]['value'])
                .filter((code, i, self) => self.indexOf(code) === i);

                const latest_judges = customer_codes.map((customer_code) => {
                    // 取引企業Noごとにfilterして処理する
                    const target_judges = all_judge_records.filter(record => record[customerCode_JUDGE]['value'] === customer_code);

                    // 日付だけの配列を作って、その中の最新の日付を取得する
                    const judge_dates = target_judges.map(record => getComparableDate(record[judgedDay_JUDGE]['value']));
                    const latest_date = new Date(Math.max.apply(null, judge_dates));

                    // kintone書式との一致を確認するためにyyyy-mm-ddにフォーマット
                    const latest_yyyy_mm_dd = [
                        latest_date.getFullYear(),
                        ('0' + String(latest_date.getMonth()+1)).slice(-2),
                        ('0' + String(latest_date.getDate())).slice(-2)
                    ].join('-');

                    // 審査レコードの中で、最新日付を持っているものを取得
                    const latest_judge = target_judges.find(record => record[judgedDay_JUDGE]['value'] === latest_yyyy_mm_dd);

                    return latest_judge;
                });

                resolve(latest_judges);
            });
        });
    }

    // YYYY-MM-DDの書式のままでは日付の比較ができないので、比較可能な値に変換する
    function getComparableDate(yyyy_mm_dd) {
        let date_info = String(yyyy_mm_dd).split('-');
        let date = new Date(Number(date_info[0]), Number(date_info[1]-1), Number(date_info[2]));
        return date.getTime();
    }

    function updateKomutenCredits(latest_judge_records) {
        return new kintone.Promise((resolve, reject) => {
            let get_komuten_info = new kintone.Promise((rslv, rjct) => {
                console.log('工務店マスタからレコードIDと取引企業Noの一覧を取得する');
                // カーソルを作成
                // 付与与信枠を取得したくない工務店は除外する
                let komuten_cursor = new kintone.Promise((resolve_post_cursor) => {
                    let post_cursor_body = {
                        'app': APP_ID_KOMUTEN,
                        'fields': [recordNo_KOMUTEN, customerCode_KOMUTEN],
                        'query': `${fieldGetCreditNextTime_KOMUTEN} in (\"${statusGetCredit_KOMUTEN}\")`,
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
                    let get_cursor_body = {
                        'id': cursor.id
                    };

                    let komuten_info = [];
                    let records_remaining = true;
                    do {
                        let resp = await kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'GET', get_cursor_body);
                        Array.prototype.push.apply(komuten_info, resp.records);
                        records_remaining = resp.next;
                    } while (records_remaining);

                    rslv(komuten_info);
                });
            });

            let process_record_ids = get_komuten_info.then((komuten_info) => {
                return new kintone.Promise((rslv) => {
                    // 各工務店レコードに、審査アプリから取得した与信枠をPUTするオブジェクトを作る。
                    let put_records = komuten_info.map((komuten) => {
                        // 審査レコードの中から、工務店レコードの取引企業Noフィールドと同じ取引企業Noのレコードを探してセット。
                        // 工務店レコード1件に対して審査レコードは1件のみなのでfind（n件あるのは逆の場合）
                        // 結果、匠和美健などの場合は一つの審査レコードの与信枠が複数の工務店レコードにセットされる。
                        const target_judge = latest_judge_records.find(record => record[customerCode_JUDGE]['value'] === komuten[customerCode_KOMUTEN]['value']);

                        // 審査されていない場合はnullセット
                        const credit = (target_judge === undefined)
                            ? null
                            : target_judge[creditAmount_JUDGE]['value'];

                        return {
                            'id': komuten[recordNo_KOMUTEN]['value'],
                            'record': {
                                [creditFacility_KOMUTEN]: {
                                    'value': credit
                                }
                            }
                        }
                    });

                    rslv(put_records);
                });
            });

            process_record_ids.then((put_records) => {
                console.log('審査アプリから取得した付与与信枠を工務店アプリのレコードに転記する');

                if (!put_records.length > 0) {
                    console.log('update targets are ');
                    console.log(latest_judge_records);
                    reject('工務店マスタの中で、審査が行われている企業はありませんでした。\nどの工務店の付与与信枠も更新されていません。');
                }

                let request_body = {
                    'app': APP_ID_KOMUTEN,
                    'records': put_records
                };

                console.log(request_body);

                kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', request_body, (resp) => {
                    resolve(resp.records.length);
                }, (err) => {
                    reject(err);
                });
            });
        });
    }

})();
