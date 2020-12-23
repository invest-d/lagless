import $ from "jquery";
import dayjs from "dayjs";
import "dayjs/locale/ja";
dayjs.locale("ja");
import {
    getTodayDate,
    get_terms_before_and_after
} from "./ke_ban";

$(() => {
    const today = getTodayDate();
    const terms = get_terms_before_and_after(today);

    // 現在の日付がどの申込期間に入っているかを判定して、申込可能な期間の一覧に加えていく
    const available_terms = [];
    // Object.keys(terms)を使いたいが、順番が保証されない(下記参照)ので手打ちでkeyの配列を定義する
    // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/keys#Using_Object.keys
    for (const term of ["prev", "now", "next"]) {
        if (today.isBetween(terms[term].apply.start, terms[term].apply.end, null, "[]")) {
            // 26日スタートの稼働期間は除外する
            if (terms[term].pay.start.date() === 26) {
                continue;
            }

            const dates = `${terms[term].pay.start.format("YYYY年MM月DD日(ddd)")}〜${terms[term].pay.end.format("YYYY年MM月DD日(ddd)")}稼働分`;
            const deadline = `申込締切：${terms[term].apply.end.format("YYYY年MM月DD日(ddd)")} 23:59まで`;
            available_terms.push(`${dates}\r\n${deadline}\r\n`);
        }
    }

    // ページ上に表示する
    if (available_terms.length > 0) {
        document.getElementById("available_term").innerText = `${available_terms.join("\r\n")}`;
    } else {
        document.getElementById("available_term").innerText = "現在お申込み頂ける稼働期間はございません。";
    }
});
