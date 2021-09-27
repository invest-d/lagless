/*
    申込アプリにおいて、支払日を過ぎているレコードに色を付ける
*/

import dayjs, { extend, locale } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
extend(isSameOrAfter);
locale("ja");

(function() {
    "use strict";
    kintone.events.on("app.record.index.show", (event) => {
        // https://developer.cybozu.io/hc/ja/articles/201941964#step1
        if (event.viewType !== "list") return;

        const exceeding_color = "#f5a9f2";

        const records = event.records;
        const date_elements = kintone.app.getFieldElements("paymentDate");

        const today = dayjs();

        date_elements.forEach((element, index) => {
            // 実行済もしくは実行不要のレコードには色をつけない
            if (["実行完了", "取下げ"].includes(records[index]["状態"]["value"])) {
                return;
            }

            // 今日の日付と支払日列の値を比較し、今日 >= 支払日の場合に色を付ける
            if (records[index]["paymentDate"] && // そもそも列が表示されている場合のみ
                records[index]["paymentDate"]["value"] && // 列に値が入力されている場合のみ
                today.isSameOrAfter(dayjs(records[index]["paymentDate"]["value"]))) {
                element.style.backgroundColor = exceeding_color;
            }
        });
    });
})();
