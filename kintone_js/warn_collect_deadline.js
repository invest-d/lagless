/*
    回収アプリで回収期限日が間近のレコードの回収期限フィールドに色を付ける。
*/

(function() {
    "use strict";
    // 1週間以内に回収期限が来る：黄色
    const bg_within_one_week = "#ffff99";
    // 明日～今日回収期限が来る：ピンク
    const bg_within_one_day = "#f5a9f2";
    // 回収期限日を過ぎている：赤
    const bg_passed_deadline = "#ea5549";

    const fieldDeadline = "deadline";
    const fieldStatus = "collectStatus";
    const statusCollected = "回収済み";
    const statusRejected = "クラウドサイン却下・再作成待ち";

    const today = new Date();
    today.setHours(0, 0, 0, 0); //深夜0時で揃えて比較する

    kintone.events.on("app.record.index.show", (event) => {
        const target_cells = kintone.app.getFieldElements(fieldDeadline);
        const records = event.records;

        records.forEach((record, i) => {
            // 回収対象外のレコードは何もしない
            if (record[fieldStatus]["value"] === statusCollected
            || record[fieldStatus]["value"] === statusRejected) {
                return;
            }

            const deadline = getDateFromYMD(record[fieldDeadline]["value"]);

            // 回収対象なのに回収期限日を過ぎている場合
            if (deadline < today) {
                target_cells[i].style.backgroundColor = bg_passed_deadline;
                return;
            }

            // 回収期限日が（土日を除いて）今日もしくは明日に迫っている場合
            if (isWithinOneWeekday(deadline)) {
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
    });

    // YYYY-MM-DDからDateを取得。時分秒は深夜0時とする
    function getDateFromYMD(yyyy_mm_dd) {
        const num_ymd = yyyy_mm_dd.split("-").map((elem) => Number(elem));
        // monthIndexだけ1を引く
        num_ymd[1] = num_ymd[1] - 1;
        return new Date(...num_ymd);
    }

    // target_dateが今日もしくは1日後の場合にTrueを返す。ただし日数を計算するにあたって土日を除く。（target_dateが月曜の場合、月曜当日とその前の金曜がTrueになる）
    // 本当は祝日も除ければベストだけど、判定が大変になってしまうので妥協してOK
    function isWithinOneWeekday(target_date) {
        // まず今日と同じ日付ならtrue
        if (target_date.getTime() === today.getTime()) {
            return true;
        } else {
            // 土曜日でも日曜日でもなくなるまで、再帰的に1日ずつ遡る
            const last_weekday = getLastWeekDay(target_date);

            // 遡った結果の日が今日と同じ日付ならtrue
            return last_weekday.getTime() === today.getTime();
        }
    }

    function getLastWeekDay(target_date) {
        // 1日前を取得
        const last_day = new Date(
            target_date.getFullYear(),
            target_date.getMonth(),
            target_date.getDate() - 1
        );

        // 曜日が日曜(0)でも土曜(6)でもなくなるまで再帰的に取得
        if (last_day.getDay() === 0 || last_day.getDay() === 6) {
            return getLastWeekDay(last_day);
        } else {
            return last_day;
        }
    }
})();
