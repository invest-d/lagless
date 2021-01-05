"use strict";

import * as common_logics from "./logics_output_csv";

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

export const AVAILABLE_VIEW = common_logics.schema_apply.views.views["振込データ出力（WFI早払い）"].name;

export const getKintoneRecords = (account, target_date, conditions) => {
    const in_query = conditions.map((c) => `"${c}"`).join(", ");

    const constructors = Object.values(AVAILABLE_CONSTRUCTORS).map((c) => `"${c.ID}"`).join(", ");

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
        "condition": `
                ${common_logics.fieldStatus_APPLY} in (${in_query})
                and ${common_logics.fieldConstructionShopId_APPLY} in (${constructors})
                and ${common_logics.fieldPaymentDate_APPLY} = "${target_date}"
                and ${common_logics.fieldPaymentAccount_APPLY} = "${account}"
            `
    };

    return common_logics.CLIENT.record.getAllRecords(request_body);
};
