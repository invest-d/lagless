import dayjs from "dayjs";
import "dayjs/locale/ja";
import $ from "jquery";
import "../public/rollbar/rollbar";
import { defineIncludesPolyfill } from "./defineIncludesPolyfill";
import {
    getUrlParam
} from "./logics/common";
import {
    get_available_terms, get_terms_prev_now_next, SERVICE_START_DATE, TODAY
} from "./logics/ke_ban";

dayjs.locale("ja");


defineIncludesPolyfill();

const isCampaign = (today) => {
    const CAMPAIGN_START = dayjs("2021-12-01");
    const CAMPAIGN_END = dayjs("2021-12-31");

    const debugFlag = getUrlParam("campaign");
    if (debugFlag && debugFlag.startsWith("t")) {
        // expect "true"
        return true;
    } else if (debugFlag && debugFlag.startsWith("f")) {
        // expect "false";
        return false;
    }

    return today.isValid() && today.isBetween(CAMPAIGN_START, CAMPAIGN_END, null, "[]");
};

$(() => {
    const terms = get_terms_prev_now_next(TODAY);

    // 現在の日付がどの申込期間に入っているかを判定して、申込可能な期間の一覧に加えていく
    const display_terms = [];
    for (const term of get_available_terms(terms, TODAY)) {
        const dates = `${term.pay.start.format("YYYY年MM月DD日(ddd)")}〜${term.pay.end.format("YYYY年MM月DD日(ddd)")}稼働分`;
        const deadline = `申込締切：${term.apply.end.format("YYYY年MM月DD日(ddd)")} 23:59まで`;
        display_terms.push(`${dates}\r\n${deadline}\r\n`);
    }

    // 1. 申込対象外の期間だけがドロップダウンに表示される場合
    // 2. START_DATEよりも前の日時の場合
    // 上記いずれかに当てはまる場合、「現在お申込み頂ける稼働期間はございません。」と表示。
    const exist_available_terms = display_terms.length === 0;
    if (exist_available_terms || TODAY.isBefore(SERVICE_START_DATE)) {
        let message = "現在お申込み頂ける稼働期間はございません。";
        // サービス開始前の場合は1月スタートである旨を補足
        if (TODAY.isBefore(SERVICE_START_DATE)) {
            message += "\r\n※2021年01月01日から本サービスをご利用頂けます";
        }
        document.getElementById("available_term").innerText = message;
    } else {
        document.getElementById("available_term").innerText = `${display_terms.join("\r\n")}`;
    }

    // キャンペーン期間かどうかに応じて、対応する要素の表示を切り替える
    if (isCampaign(TODAY)) {
        console.log("campaign goes on");
        $(".usual").hide();
        $(".campaign").show();
    } else {
        console.log("no campaigns");
        $(".usual").show();
        $(".campaign").hide();
    }
});


console.log("TODAY:", TODAY.format("YYYY-MM-DD"));
console.log("isCampaign:", isCampaign(TODAY));

