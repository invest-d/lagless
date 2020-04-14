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
    const fieldPaymentDate = 'paymentDate';

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
    async function clickCountApplies() {
        try {
            const target = await getAppliesLastYear()
            .catch((err) => {
                console.log(err);
                throw new Error('申込みレコードの取得中にエラーが発生しました。');
            });

            const count_result = countByKyoryokuId(target.records);

            const update_records_num = await updateKyoryokuMaster(count_result)
            .catch((err) => {
                console.log(err);
                throw new Error('申込み回数の更新中にエラーが発生しました。');
            });

            console.log(update_records_num + ' records updated.');
            alert(update_records_num + '件 の協力会社の申込み回数を更新しました。');
            alert('ページを更新します。');
            window.location.reload();
        } catch(err) {
            alert(err);
        }
    }

    function getAppliesLastYear() {
        console.log('直近1年間に実行完了している申込レコードを全て取得する');

        // 過去1年間のレコードを取得するため、件数が多くなることを想定。seek: true
        const request_body = {
            'app': APP_ID_APPLY,
            'fields': [fieldKyoryokuId_APPLY],
            'query': `${fieldStatus_APPLY} in (\"${statusPaid_APPLY}\") and ${fieldPaymentDate} >= ${getFormattedDate(getOneYearAgoToday())}`,
            'seek': true
        };

        return kintoneRecord.getAllRecordsByQuery(request_body);
    }

    function countByKyoryokuId(kintone_records) {
        console.log(kintone_records);
        console.log('協力会社IDごとに回数をカウントする');
        // 想定する引数の値：[{"ルックアップ": {"type": "hoge", "value": "foo"}}, ...]
        // filterして協力会社IDが入力済みの申込レコードだけをカウント
        let counts = {};
        kintone_records.filter(record => record[fieldKyoryokuId_APPLY]['value'] !== '').forEach(record => {
            // { [id]: [回数], ... }の辞書形式にしてそれぞれカウント
            const id = record[fieldKyoryokuId_APPLY]['value'];
            counts[id] = counts.hasOwnProperty(id)
                ? counts[id] + 1
                : 1;
        });

        return counts;
    }

    async function updateKyoryokuMaster(counted_by_kyoryoku_id) {
        console.log('カウント結果をもとに協力会社マスタを更新する');

        const request_body = {
            'app': APP_ID_KYORYOKU,
            'records': Object.entries(counted_by_kyoryoku_id).map(([id, count]) => {
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
            })
        };

        let kyoroku_count_last_year = 0;
        if (request_body['records'].length !== 0) {
            // 直近1年間に申込があった場合だけupdateする
            const update_resp = await kintoneRecord.updateAllRecords(request_body);
            kyoroku_count_last_year = update_resp.results[0].records.length;
        }

        // 最後の「XX件更新しました」メッセージに使う変数
        console.log(`直近1年間に申し込みのあった${kyoroku_count_last_year}社の協力会社について更新しました。`);

        // 前回の処理以降、申込み回数が1回以上からゼロ回になった協力会社を更新する。
        // ゼロ回になった協力会社 とは：
        //   先ほどのupdate処理に含まれていない協力会社である
        //   かつ 申込回数が1回以上になっている
        console.log('更新済みIDの一覧');
        console.log(Object.keys(counted_by_kyoryoku_id));
        const zero_target_records = await getZeroTargetRecords(Object.keys(counted_by_kyoryoku_id));

        console.log('ゼロ回に更新すべき協力会社IDの一覧を取得完了');
        console.log(zero_target_records);
        const zero_updated_count = await updateToZeroCount(zero_target_records);
        return kyoroku_count_last_year + zero_updated_count;
    }

    function getZeroTargetRecords(updated_ids) {
        console.log('協力会社マスタから、updated_ids以外で申込み回数が1回以上の協力会社レコードを取得する');

        // in条件に使用する文字列を取得する。 '("1", "87", "48", ...)'
        const in_query = '(\"' + updated_ids.join('\",\"') + '\")';

        const request_body = {
            'app': APP_ID_KYORYOKU,
            'fields': [fieldKyoryokuId_KYORYOKU],
            'query': `${fieldNumberOfApplication_KYORYOKU} > 0 and ${fieldKyoryokuId_KYORYOKU} not in ${in_query}`,
            'seek': true
        };

        return kintoneRecord.getAllRecordsByQuery(request_body);
    }

    async function updateToZeroCount(zero_target_records) {
        const request_body = {
            'app': APP_ID_KYORYOKU,
            'records': zero_target_records.records.map((record) => {
                return {
                    'updateKey': {
                        'field': fieldKyoryokuId_KYORYOKU,
                        'value': record[fieldKyoryokuId_KYORYOKU]['value']
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
            return 0;
        } else {
            try {
                const update_resp = await kintoneRecord.updateAllRecords(request_body);
                return update_resp.results[0].records.length;
            } catch(err) {
                // 更新対象なし以外のエラーは上位でハンドリング
                throw new Error(err);
            }
        }
    }

    function getOneYearAgoToday() {
        // 今日の1年前の日付をDate型で取得する。時刻はAM0時0分0秒で固定。
        let target_date = new Date();
        target_date.setFullYear(target_date.getFullYear() - 1);
        target_date.setHours(0, 0, 0, 0);
        return target_date;
    }

    function getFormattedDate(input_date) {
        // Date型をクエリ用の日付書式に変換する。
        // 日付フィールドに対するクエリの例： "更新日時 > \"2012-02-03T09:00:00+0900\""（ダブルクォートのエスケープが必要）
        const formatted_date = '\"'
            + String(input_date.getFullYear())
            + '-' + ('0' + String(input_date.getMonth() + 1)).slice(-2)
            + '-' + ('0' + String(input_date.getDate())).slice(-2)
            + 'T'
            + ('0' + String(input_date.getHours())).slice(-2)
            + ':' + ('0' + String(input_date.getMinutes())).slice(-2)
            + ':' + ('0' + String(input_date.getSeconds())).slice(-2)
            + '+0900' //タイムゾーン
            + '\"';
        return formatted_date;
    }
})();
