// @ts-check
"use strict";

// import { schema_apply as applyAppSchema } from "../../161/schema";
import { getApplyAppSchema, UnknownAppError } from "../../util/environments";
import { CLIENT } from "../../util/kintoneAPI";
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
        paymentTiming: {
            code: applyAppSchema.fields.properties.paymentTiming.code,
            usual: applyAppSchema.fields.properties.paymentTiming.options.通常払い.label,
        },
        service: {
            code: applyAppSchema.fields.properties.productName.code,
            names: [
                "ラグレス",
                "ダンドリペイメント",
                "リノベ不動産Payment",
                "ロジデリペイ",
            ],
        }
    },
};

export const AVAILABLE_VIEW = applyAppSchema.views.views["振込データ出力（その他L2GK）"].name;

/**
* @param {string} account - 支払元口座フィールドの値
* @param {string} targetDate - 支払日フィールドの値。YYYY-MM-DD
* @param {string[]} targetStatuses - 状態フィールドの値。
* @return {any}
*/
export const getKintoneRecords = (account, targetDate, targetStatuses) => {
    console.log(`申込レコード一覧から、CSVファイルへの出力対象レコードを取得する。対象口座：${account}`);

    const statusesQuery = targetStatuses.map((c) => `"${c}"`).join(",");

    const servicesQuery = applyApp.fields.service.names.map((c) => `"${c}"`).join(",");
    const isL2GKFactoring = `${applyApp.fields.service.code} in (${servicesQuery})`;

    // 債権譲渡登記の取得が必要な申込についてもCSV出力する。GMOあおぞらの振込であれば当日着金が可能なため。
    const request_body = {
        "app": applyApp.id,
        "condition": `(${applyApp.fields.status.code} in (${statusesQuery}))
            and (${applyApp.fields.paymentDate} = "${targetDate}")
            and (${applyApp.fields.paymentAccount} = "${account}")
            and (${applyApp.fields.paymentTiming.code} not in ("${applyApp.fields.paymentTiming.usual}"))
            and (${isL2GKFactoring})`
    };

    return CLIENT.record.getAllRecords(request_body);
};
