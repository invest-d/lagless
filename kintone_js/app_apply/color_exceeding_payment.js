/*
    申込アプリにおいて、支払日を過ぎているレコードに色を付ける
*/

import dayjs, { extend, locale } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
extend(isSameOrAfter);
locale("ja");

import { getApplyAppSchema, UnknownAppError } from "../util/choiceApplyAppSchema";
const schema = (() => {
    try {
        return getApplyAppSchema(kintone.app.getId());
    } catch (e) {
        if (e instanceof UnknownAppError) {
            alert("不明なアプリです。申込アプリで実行してください。");
        } else {
            console.error(e);
            const additional_info = e.message ?? JSON.stringify(e);
            alert("途中で処理に失敗しました。システム管理者に連絡してください。"
                + "\n追加の情報: "
                + `\n${additional_info}`);
        }
    }
})();
if (!schema) throw new Error();
const applyFields = schema.fields.properties;
const paymentDateApply = applyFields.paymentDate.code;
const statusApply = applyFields.状態.code;
const paidStatusApply = applyFields.状態.options.実行完了.label;
const cancelledStatusApply = applyFields.状態.options.取下げ.label;

(function () {
    "use strict";
    kintone.events.on("app.record.index.show", (event) => {
        // https://developer.cybozu.io/hc/ja/articles/201941964#step1
        if (event.viewType !== "list") return;

        const exceeding_color = "#f5a9f2";

        const records = event.records;

        // https://developer.cybozu.io/hc/ja/articles/201942004#step3
        // viewに目的のフィールドを含んでいない場合、getFieldElementsはnullを返す
        const date_elements = kintone.app.getFieldElements(paymentDateApply);
        if (!date_elements) return;

        const today = dayjs();

        date_elements.forEach((element, index) => {
            // 実行済もしくは実行不要のレコードには色をつけない
            if ([paidStatusApply, cancelledStatusApply].includes(records[index][statusApply]["value"])) {
                return;
            }

            // 今日の日付と支払日列の値を比較し、今日 >= 支払日の場合に色を付ける
            if (records[index][paymentDateApply]["value"] && // 列に値が入力されている場合のみ
                today.isSameOrAfter(dayjs(records[index][paymentDateApply]["value"]))) {
                element.style.backgroundColor = exceeding_color;
            }
        });
    });
})();
