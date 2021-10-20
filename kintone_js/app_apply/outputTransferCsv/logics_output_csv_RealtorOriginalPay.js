"use strict";

import { getApplyAppSchema, UnknownAppError } from "../../util/environments";
import { CLIENT } from "../../util/kintoneAPI";
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
        paymentDate: applyAppSchema.fields.properties.paymentDate.code,
        paymentAccount: applyAppSchema.fields.properties.paymentAccount.code,
        constructorId: applyAppSchema.fields.properties.constructionShopId.code,
        bankCode: applyAppSchema.fields.properties.bankCode.code,
        branchCode: applyAppSchema.fields.properties.branchCode.code,
        totalReceivables: applyAppSchema.fields.properties.totalReceivables.code,
    },
};

export const AVAILABLE_VIEW = applyAppSchema.views.views["振込データ出力（リライト通常払い）"].name;

export const AVAILABLE_CONSTRUCTORS = {
    REALTOR_SOLUTIONS: {
        ID: "100",
        NAME: "株式会社RealtorSolutions",
        BANK_CODE: "0157",
        BRANCH_CODE: "261"
    }
};

export const getKintoneRecords = (account, target_date, conditions) => {
    console.log(`申込レコード一覧から、CSVファイルへの出力対象レコードを取得する。対象口座：${account}`);

    const in_query = conditions.map((c) => `"${c}"`).join(",");

    const test_constructors = Object.values(AVAILABLE_CONSTRUCTORS).map((c) => `"${c.ID}"`).join(", ");

    // 債権譲渡登記の取得が必要な申込についてもCSV出力する。GMOあおぞらの振込であれば当日着金が可能なため。
    const request_body = {
        "app": applyApp.id,
        "condition": `${applyApp.fields.status.code} in (${in_query})
                and ${applyApp.fields.paymentDate} = "${target_date}"
                and ${applyApp.fields.paymentAccount} = "${account}"
                and ${applyApp.fields.constructorId} in (${test_constructors})`
    };

    return CLIENT.record.getAllRecords(request_body);
};

export const getOriginalPaymentAmount = (record) => {
    // 通常払いの場合、下記のように特殊な金額計算を行う。
    // ①サービス利用手数料を差し引かない（対象債権金額をそのまま利用する）
    // ②工務店が支払する場合と同額の振込手数料を差し引く
    const receiver_account = {
        // ゼロ埋めして比較する
        bank_code: (`0000${record[applyApp.fields.bankCode]["value"]}`).slice(-4),
        branch_code: (`000${record[applyApp.fields.branchCode]["value"]}`).slice(-3),
    };
    const receivable_amount = Number(record[applyApp.fields.totalReceivables]["value"]);

    const transfer_fee_original = ((receiver_account, transfer_amount) => {
        const LOWER_FEE_BORDER = 30000;

        if ((receiver_account.bank_code === AVAILABLE_CONSTRUCTORS.REALTOR_SOLUTIONS.BANK_CODE)
        && (receiver_account.branch_code === AVAILABLE_CONSTRUCTORS.REALTOR_SOLUTIONS.BRANCH_CODE)) {
            // 同一店内
            return 0;
        } else if ((receiver_account.bank_code === AVAILABLE_CONSTRUCTORS.REALTOR_SOLUTIONS.BANK_CODE)
        && (receiver_account.branch_code !== AVAILABLE_CONSTRUCTORS.REALTOR_SOLUTIONS.BRANCH_CODE)) {
            // 同一銀行内・別の本支店
            if (transfer_amount < LOWER_FEE_BORDER) {
                return 55;
            } else {
                return 220;
            }
        } else {
            // 他行宛
            if (transfer_amount < LOWER_FEE_BORDER) {
                return 330;
            } else {
                return 550;
            }
        }
    })(receiver_account, receivable_amount);
    // (請求書金額 - 協力会費) - (インベストが関わらない場合を想定した本来の振込手数料)を返す。
    // (請求書金額 - 協力会費)の金額は対象債権合計金額と同じ
    return receivable_amount - transfer_fee_original;
};
