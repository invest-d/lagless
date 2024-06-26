/*
    回収アプリで回収期限日が間近のレコードの回収期限フィールドに色を付ける。
*/

// 1週間以内に回収期限が来る：黄色
const bg_within_one_week = "#ffff99";
// 明日～今日回収期限が来る：ピンク
const bg_within_one_day = "#f5a9f2";
// 回収期限日を過ぎている：赤
const bg_passed_deadline = "#ea5549";

import { getCollectAppSchema } from "../util/environments";
// import { schema_collect } from "../162/schema";
const schema_collect = getCollectAppSchema(kintone.app.getId());
if (!schema_collect) throw new Error();
const fieldDeadline     = schema_collect.fields.properties.deadline.code;
const fieldStatus       = schema_collect.fields.properties.collectStatus.code;
const statusCollected   = schema_collect.fields.properties.collectStatus.options.回収済み.label;
const statusRejected    = schema_collect.fields.properties.collectStatus.options["クラウドサイン却下・再作成待ち"].label;

const today = new Date();
today.setHours(0, 0, 0, 0); //深夜0時で揃えて比較する

// YYYY-MM-DDからDateを取得。時分秒は深夜0時とする
function createDateFromYMD(yyyy_mm_dd) {
    const num_ymd = yyyy_mm_dd.split("-").map((elem) => Number(elem));
    // monthIndexだけ1を引く
    return new Date(num_ymd[0], num_ymd[1]-1, num_ymd[2]);
}

// 営業日（平日）ベースでの日数の差を計算する。to - from。現状はtoが未来の場合の日数の計算が出来ればよいので、toの方が過去の場合はエラーとする
function getWeekdayDiff(date_from, date_to) {
    const day_millisec = 86400000;

    // 単純に日数差を計算
    const diff_days = (date_to - date_from) / day_millisec;

    if (diff_days < 0) {
        throw new Error(`date_fromよりも過去の日付がdate_toに渡されています。\ndate_from：${date_from}\ndate_to：${date_to}`);
    }

    // 翌日(i = 1)から一日ずつ曜日を確認し、平日の場合に加算
    let diff_weekdays = 0;
    for (let i = 1; i <= diff_days; i++) {
        const target_date = new Date(date_from.getFullYear(), date_from.getMonth(), date_from.getDate()+i);

        if ([1, 2, 3, 4, 5].includes(target_date.getDay())) {
            diff_weekdays++;
        }
    }

    return diff_weekdays;
}

export const colorDeadlineCells = (event) => {
    const target_cells = kintone.app.getFieldElements(fieldDeadline);
    const records = event.records;

    records.forEach((record, i) => {
        // 回収対象外のレコードは何もしない
        if (record[fieldStatus]["value"] === statusCollected
        || record[fieldStatus]["value"] === statusRejected) {
            return;
        }

        const deadline = createDateFromYMD(record[fieldDeadline]["value"]);

        // 回収対象なのに回収期限日を過ぎている場合
        if (deadline < today) {
            target_cells[i].style.backgroundColor = bg_passed_deadline;
            return;
        }

        // 回収期限日が（土日を除いて）今日もしくは明日に迫っている場合
        if (getWeekdayDiff(today, deadline) <= 1) {
            target_cells[i].style.backgroundColor = bg_within_one_day;
            return;
        }

        // 回収期限日が今日から1週間以内に迫っている場合。単純に7日後で計算
        const one_week_after = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
        if (deadline >= today && deadline <= one_week_after) {
            target_cells[i].style.backgroundColor = bg_within_one_week;
            return;
        }
    });
};
