import $ from "jquery";
import dayjs from "dayjs";
import "dayjs/locale/ja";
dayjs.locale("ja");
import {
    getTodayDate,
    get_pay_term_start_date,
    get_pay_term_end_date,
    get_next_business_date
} from "./ke_ban";

$(() => {
    const today = getTodayDate();

    // 申込可能な稼働日の期間を設定する
    const start_date = get_pay_term_start_date(today);
    if (start_date.date() === 26) {
        // 26日〜末日の期間は現状申込不可
        document.getElementById("available_term").innerText = "現在お申込み頂ける稼働期間はございません。";

        document.getElementById("apply_deadline").innerText = "";
    } else {
        document.getElementById("available_term").innerText = `${get_pay_term_start_date(today).format("YYYY年MM月DD日(ddd)")}〜${get_pay_term_end_date(today).format("YYYY年MM月DD日(ddd)")}稼働分`;

        // 申込締切日を設定する
        document.getElementById("apply_deadline").innerText = `申込締切：${get_next_business_date(get_pay_term_end_date(today)).format("YYYY年MM月DD日(ddd)")} 23:59まで`;
    }
});
