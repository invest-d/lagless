/*
    Version 1.1
    LAGLESS-52において仕様変更
    https://takadaid.backlog.com/view/LAGLESS-52
    カウントのロジックを変更し、その協力会社の「次回申込期限の1年前以降 ～ 本日以前」という範囲で、請求書の締日を基準にカウントするようになった。

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
    const fieldKyoryokuId_APPLY = "ルックアップ";
    const fieldConstructionShopId_APPLY = "constructionShopId";
    const fieldClosingDay_APPLY = "closingDay";
    const fieldStatus_APPLY = "状態";
    const statusPaid_APPLY = "実行完了";
    const fieldPaymentDate = "paymentDate";

    const APP_ID_KYORYOKU = 88; // 開発・本番とも共通のため固定
    const fieldKyoryokuId_KYORYOKU = "支払企業No_";
    const fieldNumberOfApplication_KYORYOKU = "numberOfApplication";
    const fieldUpdatedDate_KYORYOKU = "updatedDate";

    const APP_ID_CONSTRUCTION = 96;
    const fieldId_CONSTRUCTION = "id";
    const fieldPattern_CONSTRUCTION = "pattern";

    const APP_ID_PATTERN = 95;
    const fieldPattern_PATTERN = "pattern";
    const fieldDeadline_PATTERN = "deadline";

    const kintoneRecord = new kintoneJSSDK.Record({connection: new kintoneJSSDK.Connection()});

    kintone.events.on("app.record.index.show", (event) => {
        if (needShowButton()) {
            const button = createCountAppliesButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function needShowButton() {
        // 当初はボタンの表示が必要なタイミングでのみ表示する予定だったが、常に表示するように仕様変更
        return document.getElementById("countApplies") === null;
    }

    function createCountAppliesButton() {
        const countApplies = document.createElement("button");
        countApplies.id = "countApplies";
        countApplies.innerText = "直近一年間の申込み回数を更新";
        countApplies.addEventListener("click", clickCountApplies);
        return countApplies;
    }

    // ボタンクリック時の処理を定義
    async function clickCountApplies() {
        try {
            // まずざっくりと直近1年間に支払実行した申込を全て取得
            const target_applies = await getAppliesLastYear()
                .catch((err) => {
                    console.error(err);
                    throw new Error("申込みレコードの取得中にエラーが発生しました。");
                });

            // カウントするために工務店の情報が必要になるので取得
            const construction_shop_ids = Array.from(new Set(target_applies.records.map((record) => record[fieldConstructionShopId_APPLY]["value"])));
            const construction_shops = await getConstructionShops(construction_shop_ids)
                .catch((err) => {
                    console.error(err);
                    throw new Error("工務店情報の取得中にエラーが発生しました。");
                });

            // 支払パターンの情報も必要になるので取得
            const target_patterns = Array.from(new Set(construction_shops.records.map((rec) => rec[fieldPattern_CONSTRUCTION]["value"])));
            const patterns = await getPaymentPatterns(target_patterns)
                .catch((err) => {
                    console.error(err);
                    throw new Error("支払パターンの取得中にエラーが発生しました。");
                });

            // 協力会社ごとにカウント条件に当てはまる申込だけをカウント
            const count_result = await countByKyoryokuId(target_applies.records, construction_shops.records, patterns.records);

            const update_records_num = await updateKyoryokuMaster(count_result)
                .catch((err) => {
                    console.error(err);
                    throw new Error("申込み回数の更新中にエラーが発生しました。");
                });

            console.log(`${update_records_num  } records updated.`);
            alert(`${update_records_num  }件 の協力会社の申込み回数を更新しました。`);
            alert("ページを更新します。");
            window.location.reload();
        } catch(err) {
            alert(err);
        }
    }

    function getAppliesLastYear() {
        console.log("直近1年間に実行完了している申込レコードを全て取得する");

        // 過去1年間のレコードを取得するため、件数が多くなることを想定。seek: true
        const request_body = {
            "app": APP_ID_APPLY,
            "fields": [
                fieldKyoryokuId_APPLY,
                fieldConstructionShopId_APPLY,
                fieldClosingDay_APPLY
            ],
            "query": `${fieldKyoryokuId_APPLY} != "" and ${fieldStatus_APPLY} in ("${statusPaid_APPLY}") and ${fieldPaymentDate} >= "${getFormattedDate(getOneYearAgoToday())}"`,
            "seek": true
        };

        return kintoneRecord.getAllRecordsByQuery(request_body);
    }

    function getConstructionShops(ids) {
        console.log("申し込みのあった協力会社の工務店を取得する");

        const request_body = {
            "app": APP_ID_CONSTRUCTION,
            "fields": [
                fieldId_CONSTRUCTION,
                fieldPattern_CONSTRUCTION
            ],
            "query": `${fieldId_CONSTRUCTION} in ("${ids.join("\",\"")}")`
        };

        return kintoneRecord.getAllRecordsByQuery(request_body);
    }

    function getPaymentPatterns(target_patterns) {
        console.log("支払パターンを取得する");

        // 申込期限が今日以降の支払パターンを取得
        const request_body = {
            "app": APP_ID_PATTERN,
            "fields": [
                fieldPattern_PATTERN,
                fieldDeadline_PATTERN
            ],
            "query": `${fieldDeadline_PATTERN} >= TODAY() and ${fieldPattern_PATTERN} in ("${target_patterns.join("\",\"")}")`
        };

        return kintoneRecord.getAllRecordsByQuery(request_body);
    }

    async function countByKyoryokuId(target_applies, construction_shops, patterns) {
        // カウント条件：
        // カウント日をTo、カウント日の次の申込期限の1年前の日付をFrom、とした期間の中に、請求書の締日を含んでいること
        console.log(target_applies);
        console.log("協力会社IDごとに回数をカウントする");

        const counts = {};
        // 協力会社IDごとにループ
        const kyoryoku_ids = new Set(target_applies.map((rec) => rec[fieldKyoryokuId_APPLY]["value"]));
        for (const kyoryoku_id of kyoryoku_ids) {
            // 協力会社に対応する工務店を取得
            const construction_id = target_applies.find((rec) => rec[fieldKyoryokuId_APPLY]["value"] === kyoryoku_id)[fieldConstructionShopId_APPLY]["value"];
            const construction_shop = construction_shops.find((rec) => rec[fieldId_CONSTRUCTION]["value"] === construction_id);

            // 工務店に対応する直近の支払パターンを取得
            const pattern = patterns
                .filter((rec) => rec[fieldPattern_PATTERN]["value"] === construction_shop[fieldPattern_CONSTRUCTION]["value"])
                .reduce((provisional, current) => {
                    // 支払パターンフィールドの値が同じレコードの中で、申込期限が最も過去のもの
                    const prov_date = getDateFromYYYYMMDD(provisional[fieldDeadline_PATTERN]["value"]);
                    const curr_date = getDateFromYYYYMMDD(current[fieldDeadline_PATTERN]["value"]);

                    return (prov_date < curr_date)
                        ? provisional
                        : current;
                });

            // 直近の支払パターンの申込期限の1年前をFromとする
            const last_year = Number(pattern[fieldDeadline_PATTERN]["value"].split("-")[0]) - 1;
            const from_date = new Date(getDateFromYYYYMMDD(pattern[fieldDeadline_PATTERN]["value"]).setFullYear(last_year));

            const to_date = new Date();

            // 申込レコードの中から、協力会社IDと請求書の締日でfilter。そのレコード数が申込期限
            const count = target_applies
                .filter((rec) => {
                    const closing_date = getDateFromYYYYMMDD(rec[fieldClosingDay_APPLY]["value"]);

                    return rec[fieldKyoryokuId_APPLY]["value"] === kyoryoku_id
                    && closing_date >= from_date
                    && closing_date <= to_date;
                })
                .length;

            counts[kyoryoku_id] = count;
        }

        return counts;
    }

    function getDateFromYYYYMMDD(yyyy_mm_dd) {
        const ymd_arr = yyyy_mm_dd.split("-").map((num) => Number(num));
        ymd_arr[1] = ymd_arr[1] - 1;
        return new Date(...ymd_arr);
    }

    async function updateKyoryokuMaster(counted_by_kyoryoku_id) {
        // 大きく2種類の更新操作を行う。
        // 1: 申込のあったidに対して申込の回数を更新
        // 2: 申込のなかったidに対して申込の回数をゼロ回に更新
        let updated_date = "";
        if (Object.keys(counted_by_kyoryoku_id).length === 0) {
            console.log("昨年1年間は1件も申込なし");
        } else {
            console.log("カウント結果をもとに協力会社マスタを更新する");

            // あとで更新日時を使うのでリクエストボディに更新日時を設定したいが、仕様上不可
            const request_body = {
                "app": APP_ID_KYORYOKU,
                "records": Object.entries(counted_by_kyoryoku_id).map(([id, count]) => {
                    return {
                        "updateKey": {
                            "field": fieldKyoryokuId_KYORYOKU,
                            "value": id
                        },
                        "record": {
                            [fieldNumberOfApplication_KYORYOKU]: {
                                "value": count
                            }
                        }
                    };
                })
            };

            const update_resp = await kintoneRecord.updateAllRecords(request_body);
            console.log(`直近1年間に申し込みのあった${update_resp.results[0].records.length}社の協力会社について更新完了。`);
            console.log("更新済みIDの一覧");
            console.log(Object.keys(counted_by_kyoryoku_id));

            // 前回の処理以降、申込み回数が1回以上からゼロ回になった協力会社を更新する。
            // ゼロ回になった協力会社 の抽出条件：
            //   直前の更新対象に含まれていない協力会社である
            //   かつ 申込回数が1回以上になっている
            // 直前の更新対象かどうかは、協力会社マスタの更新日時フィールドで判定する。

            // 更新日時を知るため、先ほど更新した協力会社IDのレコードを全件取得。その中で最も更新日時が古いものを採用。
            const updated = await kintoneRecord.getAllRecordsByQuery({
                "app": APP_ID_KYORYOKU,
                "query": `${fieldKyoryokuId_KYORYOKU} in ("${Object.keys(counted_by_kyoryoku_id).join("\",\"")}") order by ${fieldUpdatedDate_KYORYOKU} asc`,
                "fields": [fieldUpdatedDate_KYORYOKU]
            });

            updated_date = updated.records[0][fieldUpdatedDate_KYORYOKU]["value"];
        }

        const zero_target_records = await getZeroTargetRecords(updated_date);

        console.log("ゼロ回に更新すべき協力会社IDの一覧を取得完了");
        console.log(zero_target_records);

        const zero_updated_count = await updateToZeroCount(zero_target_records);
        return Object.keys(counted_by_kyoryoku_id).length + zero_updated_count;
    }

    function getZeroTargetRecords(updated_date) {
        console.log("直前に更新されていないのに申込み回数が1回以上の協力会社レコードを取得する");

        // 1年間に1件も申込がない場合はupdated_dateは無い
        const query = (updated_date)
            ? `${fieldNumberOfApplication_KYORYOKU} > 0 and ${fieldUpdatedDate_KYORYOKU} < "${updated_date}"`
            : `${fieldNumberOfApplication_KYORYOKU} > 0`;

        const request_body = {
            "app": APP_ID_KYORYOKU,
            "fields": [fieldKyoryokuId_KYORYOKU, fieldUpdatedDate_KYORYOKU],
            "query": query,
            "seek": true
        };

        return kintoneRecord.getAllRecordsByQuery(request_body);
    }

    async function updateToZeroCount(zero_target_records) {
        if (zero_target_records.records.length === 0) {
            // 更新対象なしのままupdateしようとするとエラーになる
            return 0;
        }

        const request_body = {
            "app": APP_ID_KYORYOKU,
            "records": zero_target_records.records.map((record) => {
                return {
                    "updateKey": {
                        "field": fieldKyoryokuId_KYORYOKU,
                        "value": record[fieldKyoryokuId_KYORYOKU]["value"]
                    },
                    "record": {
                        [fieldNumberOfApplication_KYORYOKU]: {
                            "value": 0
                        }
                    }
                };
            })
        };

        const update_resp = await kintoneRecord.updateAllRecords(request_body);
        return update_resp.results[0].records.length;
    }

    function getOneYearAgoToday() {
        // 今日の1年前の日付をDate型で取得する。時刻はAM0時0分0秒で固定。
        const target_date = new Date();
        target_date.setFullYear(target_date.getFullYear() - 1);
        target_date.setHours(0, 0, 0, 0);
        return target_date;
    }

    function getFormattedDate(input_date) {
        // Date型をクエリ用の日付書式に変換する。
        // 日付フィールドに対するクエリの例： "更新日時 > \"2012-02-03T09:00:00+0900\""
        const year = String(input_date.getFullYear());
        const month = `0${String(input_date.getMonth() + 1)}`.slice(-2);
        const date = `0${String(input_date.getDate())}`.slice(-2);
        const hours = `0${String(input_date.getHours())}`.slice(-2);
        const minutes = `0${String(input_date.getMinutes())}`.slice(-2);
        const seconds = `0${String(input_date.getSeconds())}`.slice(-2);

        return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}+0900`;
    }
})();
