/*
    申込アプリにおいて、実行完了|取下げレコードを見た目上グレーアウトする
*/

import { getApplyAppSchema, UnknownAppError } from "../util/environments";
import { CLIENT } from "../util/kintoneAPI";

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
const recordNoApply = applyFields.レコード番号.code;
const statusApply = applyFields.状態.code;
const paidStatusApply = applyFields.状態.options.実行完了.label;
const cancelledStatusApply = applyFields.状態.options.取下げ.label;

const unhilightedColor = "#D6D6D6";
const unhilightStatuses = [
    paidStatusApply,
    cancelledStatusApply,
];

(function () {
    "use strict";
    kintone.events.on("app.record.index.show", async (event) => {
        // https://developer.cybozu.io/hc/ja/articles/201941964#step1
        if (event.viewType !== "list") return;
        if (event.records.length === 0) return;

        // viewに表示しているかどうかに関わらず、全てのfieldを取得できる。
        const fields = Object.keys(event.records[0]);

        // 取得できたelem＝表示しているelemだけ処理する。
        // getFieldElementsは列ごとに取得する。
        // 一方で本スクリプトは行ごとに処理したい。
        // そのため、列のelemのparentElemから行全体を取得して処理する。
        const rows = fields
            //とりあえず全フィールドの列elemの取得を試みる
            .map((fieldName) => kintone.app.getFieldElements(fieldName))
            //実際に存在する列elemだけをfilterで取得する
            .filter((column) => column)
            //存在する列elemから1列だけを取得する
            .shift()
            //列の各セルelemのparentから行全体を取得する
            .map((cell) => cell.parentElement.children)
            .map((cells) => {
                // 各行の第1セルはレコード詳細画面へのURLを持つ。
                // ここからレコード番号を取得する。
                const url = cells[0].firstElementChild.href;
                const recordId = url.match(/#record=(\d{1,})&/)[1];
                return { cells, recordId };
            });

        // viewからstatusを取得できるとは限らない。
        // 従ってrest apiからレコードのstatusを確実に取得する。
        // in条件でも良いが、queryをシンプルにしたいのでrecordIdのmax, minで指定する
        const { minId, maxId } = rows
            .map((r) => Number(r.recordId))
            .reduce(({ minId, maxId }, now) => {
                return { minId: Math.min(minId, now), maxId: Math.max(maxId, now) };
            }, { minId: Number.MAX_VALUE, maxId: Number.MIN_VALUE });
        const resp = await CLIENT.record.getAllRecords({
            app: kintone.app.getId(),
            fields: [recordNoApply, statusApply],
            condition: `${recordNoApply} >= ${minId} and ${recordNoApply} <= ${maxId}`
        });
        // 辞書形式にしておいて、参照しやすくする
        const records = {};
        for (const r of resp) {
            records[r[recordNoApply]["value"]] = r[statusApply]["value"];
        }

        // rowの背景色を設定する
        for (const row of rows) {
            if (!unhilightStatuses.includes(records[row.recordId])) continue;

            for (const cell of row.cells) {
                cell.style.backgroundColor = unhilightedColor;
            }
        }
    });
})();
