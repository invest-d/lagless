// @ts-check
"use strict";

import { CLIENT } from "../../util/kintoneAPI";
// import { schema_apply as applyAppSchema } from "../../161/schema";
import { getApplyAppSchema, UnknownAppError } from "../../util/choiceApplyAppSchema";
const applyAppSchema = (() => {
    try {
        // @ts-ignore
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
if (!applyAppSchema) throw new Error();

const applyApp = {
    id: applyAppSchema.id.appId,
    fields: {
        status: {
            code: applyAppSchema.fields.properties.状態.code,
        },
        paymentDate: applyAppSchema.fields.properties.paymentDate.code,
        paymentAccount: applyAppSchema.fields.properties.paymentAccount.code,
        service: {
            code: applyAppSchema.fields.properties.productName.code,
            name: "Workship前払い",
        }
    },
};

export const AVAILABLE_VIEW = applyAppSchema.views.views["振込データ出力（Workship前払い）"].name;

/**
* @param {string} account - 支払元口座フィールドの値
* @param {string} targetDate - 支払日フィールドの値。YYYY-MM-DD
* @param {string[]} targetStatuses - 状態フィールドの値。
* @return {any}
*/
export const getKintoneRecords = (account, targetDate, targetStatuses) => {
    console.log(`申込レコード一覧から、CSVファイルへの出力対象レコードを取得する。対象口座：${account}`);

    const statusesQuery = targetStatuses.map((c) => `"${c}"`).join(",");

    // 可能であれば工務店IDフィールドで縛りをかけたいが、それはできない。
    // Workship案件の工務店IDは5\d{2,3}で表現されるが、kintoneのqueryに正規表現は利用できないため。
    // その代わり、商品名が全て同じになるようにフィールド値を人力で揃えている。従って商品名フィールドによる縛りを使う。
    const isWorkshipFactoring = `${applyApp.fields.service.code} = "${applyApp.fields.service.name}"`;

    // 債権譲渡登記の取得が必要な申込についてもCSV出力する。GMOあおぞらの振込であれば当日着金が可能なため。
    const request_body = {
        "app": applyApp.id,
        "condition": `(${applyApp.fields.status.code} in (${statusesQuery}))
            and (${applyApp.fields.paymentDate} = "${targetDate}")
            and (${applyApp.fields.paymentAccount} = "${account}")
            and (${isWorkshipFactoring})`
    };

    return CLIENT.record.getAllRecords(request_body);
};
