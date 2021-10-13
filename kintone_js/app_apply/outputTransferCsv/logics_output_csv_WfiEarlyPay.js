"use strict";

import { CLIENT } from "../../util/kintoneAPI";
import { getApplyAppSchema, UnknownAppError } from "../../util/choiceApplyAppSchema";
const applyAppSchema = (() => {
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
if (!applyAppSchema) throw new Error();
const applyApp = {
    id: applyAppSchema.id.appId,
    fields: {
        status: {
            code: applyAppSchema.fields.properties.状態.code,
        },
        constructorId: applyAppSchema.fields.properties.constructionShopId.code,
        paymentDate: applyAppSchema.fields.properties.paymentDate.code,
        paymentAccount: applyAppSchema.fields.properties.paymentAccount.code,
    },
};

export const AVAILABLE_VIEW = applyAppSchema.views.views["振込データ出力（WFI早払い）"].name;

export const AVAILABLE_CONSTRUCTORS = {
    CLOSING_05: {
        ID: "400",
        NAME: "株式会社ワールドフォースインターナショナル",
    },
    CLOSING_10: {
        ID: "401",
        NAME: "株式会社ワールドフォースインターナショナル",
    },
    CLOSING_15: {
        ID: "402",
        NAME: "株式会社ワールドフォースインターナショナル",
    },
    CLOSING_20: {
        ID: "403",
        NAME: "株式会社ワールドフォースインターナショナル",
    },
    CLOSING_25: {
        ID: "404",
        NAME: "株式会社ワールドフォースインターナショナル",
    },
};

export const getKintoneRecords = (account, target_date, conditions) => {
    const in_query = conditions.map((c) => `"${c}"`).join(", ");

    const constructors = Object.values(AVAILABLE_CONSTRUCTORS).map((c) => `"${c.ID}"`).join(", ");

    // 債権譲渡登記の取得が必要な申込についてもCSV出力する。GMOあおぞらの振込であれば当日着金が可能なため。
    const request_body = {
        "app": applyApp.id,
        "condition": `
                ${applyApp.fields.status.code} in (${in_query})
                and ${applyApp.fields.constructorId} in (${constructors})
                and ${applyApp.fields.paymentDate} = "${target_date}"
                and ${applyApp.fields.paymentAccount} = "${account}"
            `
    };

    return CLIENT.record.getAllRecords(request_body);
};
