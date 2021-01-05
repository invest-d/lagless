"use strict";

import * as common_logics from "./logics_output_csv";

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
        "app": common_logics.APP_ID_APPLY,
        "fields": [
            common_logics.fieldPaymentTiming_APPLY,
            common_logics.fieldRecordId_APPLY,
            common_logics.fieldBankCode_APPLY,
            common_logics.fieldBranchCode_APPLY,
            common_logics.fieldDepositType_APPLY,
            common_logics.fieldAccountNumber_APPLY,
            common_logics.fieldAccountName_APPLY,
            common_logics.fieldTransferAmount_APPLY,
            common_logics.fieldTotalReceivables_APPLY,
            common_logics.fieldConstructionShopId_APPLY,
            common_logics.fieldKyoryokuId_APPLY
        ],
        "condition": `${common_logics.fieldStatus_APPLY} in (${in_query})
                and ${common_logics.fieldPaymentDate_APPLY} = "${target_date}"
                and ${common_logics.fieldPaymentAccount_APPLY} = "${account}"
                and ${common_logics.fieldConstructionShopId_APPLY} in (${test_constructors})`
    };

    return common_logics.CLIENT.record.getAllRecords(request_body);
};

export const getOriginalPaymentAmount = (record) => {
    // 通常払いの場合、下記のように特殊な金額計算を行う。
    // ①サービス利用手数料を差し引かない（対象債権金額をそのまま利用する）
    // ②工務店が支払する場合と同額の振込手数料を差し引く
    const receiver_account = {
        bank_code: record[common_logics.fieldBankCode_APPLY]["value"],
        branch_code: record[common_logics.fieldBranchCode_APPLY]["value"],
    };
    const receivable_amount = Number(record[common_logics.fieldTotalReceivables_APPLY]["value"]);

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
