import $ from "jquery";
import dayjs from "dayjs";
import "dayjs/locale/ja";
dayjs.locale("ja");
import {
    TODAY,
    get_terms_prev_now_next,
    get_available_terms
} from "./ke_ban";

$(() => {
    const terms = get_terms_prev_now_next(TODAY);

    // 現在の日付がどの申込期間に入っているかを判定して、申込可能な期間の一覧に加えていく
    const display_terms = [];
    for (const term of get_available_terms(terms, TODAY)) {
        const dates = `${term.pay.start.format("YYYY年MM月DD日(ddd)")}〜${term.pay.end.format("YYYY年MM月DD日(ddd)")}稼働分`;
        const deadline = `申込締切：${term.apply.end.format("YYYY年MM月DD日(ddd)")} 23:59まで`;
        display_terms.push(`${dates}\r\n${deadline}\r\n`);
    }

    // ページ上に表示する
    if (display_terms.length > 0) {
        document.getElementById("available_term").innerText = `${display_terms.join("\r\n")}`;
    } else {
        document.getElementById("available_term").innerText = "現在お申込み頂ける稼働期間はございません。";
    }
});
