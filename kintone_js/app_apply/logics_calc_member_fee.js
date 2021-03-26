/*
    Version 1
    申込レコードについて、「会費等の差し引き額」フィールドを自動計算する。
    https://takadaid.backlog.com/view/LAGLESS-244
*/

"use strict";

import { isGigConstructorID } from "../util/gig_utils";

const client = new KintoneRestAPIClient({baseUrl: "https://investdesign.cybozu.com"});

const APP_ID_APPLY                  = kintone.app.getId();
const commonRecordId                = "$id";
const fieldConstructorID_APPLY      = "constructionShopId";
const fieldApplicationAmount_APPLY  = "applicationAmount";
const fieldCollectID_APPLY          = "collectId";
const fieldStatus_APPLY             = "状態";
const statusUnprocessed_APPLY       = "未処理";
const statusIdConfirmed_APPLY       = "ID確認済";
const fieldMemberFee_APPLY          = "membership_fee";

export const confirmBeforeExec = () => {
    const target = "回収IDが空欄 かつ 工務店IDを入力済 かつ 状態が未処理もしくはID確認済";
    const before_process = `${target}の各レコードについて、会費等の差引額を計算しますか？`;
    return window.confirm(before_process);
};

export const getTargetRecords = () => {
    const target_statuses = [
        statusUnprocessed_APPLY,
        statusIdConfirmed_APPLY,
    ].map((s) => `"${s}"`)
        .join(",");

    const request_body = {
        "app": APP_ID_APPLY,
        "fields":[
            commonRecordId,
            fieldConstructorID_APPLY,
            fieldApplicationAmount_APPLY,
        ],
        "condition": `${fieldCollectID_APPLY} = ""
            and ${fieldConstructorID_APPLY} != ""
            and ${fieldStatus_APPLY} in (${target_statuses})`
    };

    return client.record.getAllRecords(request_body);
};

export const calcMemberFees = (records) => {
    const calced = [];
    const failed = [];

    for (const record of records) {
        const fee = ((constructor_id, application_amount) => {
            try {
                return calcMemberFee(constructor_id, application_amount);
            } catch (err) {
                if (err instanceof UnknownRuleConstructorError) {
                    failed.push({
                        "record_id": record[commonRecordId]["value"],
                        "constructor_id": constructor_id
                    });

                    return undefined;
                }
                throw err;
            }
        })(record[fieldConstructorID_APPLY]["value"],
            record[fieldApplicationAmount_APPLY]["value"]);

        if (fee) {
            calced.push({
                "id": record[commonRecordId]["value"],
                "fee": fee
            });
        }
    }

    return {
        "calced_records": calced,
        "failed_records": failed
    };
};

const calcMemberFee = (constructor_id, application_amount) => {
    if (typeof application_amount === "string") {
        application_amount = Number(application_amount);
    }

    // data source: https://docs.google.com/spreadsheets/d/1QBJc6XPTCZFf0ARcs1Q6glcWYSbnrVDrAntg-hg257w/edit#gid=1318157710
    // and https://app.box.com/file/714224987744
    const zero_fee_constructors = [
        "100",
        "101",
        "102",
        "201",
        "202",
        "203",
        "300",
        "204",
        "104",
        "105",
        "206",
        "303",
        "304",
        "209",
        "107",
        "211",
        "212",
        "219",
        "218",
        "214",
        "216",
        "220",
        "221",
    ];

    if (zero_fee_constructors.includes(constructor_id)
        || isGigConstructorID(constructor_id)) {
        return 0;
    }

    if (constructor_id === "207") {
        return application_amount * 0.001;
    }

    if (constructor_id === "210") {
        return ((amount) => {
            const price1 =  100000;
            const price2 =  200000;
            const price3 =  500000;
            const price4 = 1000000;
            const price5 = 2000000;

            if (amount < price1)                     return     0;
            if (amount >= price1 && amount < price2) return  2000;
            if (amount >= price2 && amount < price3) return  3000;
            if (amount >= price3 && amount < price4) return  5000;
            if (amount >= price4 && amount < price5) return 10000;
            if (amount >= price5)                    return 20000;
        })(application_amount);
    }

    if (constructor_id === "213") {
        return application_amount * 0.01;
    }

    throw new UnknownRuleConstructorError(constructor_id);
};

// https://qiita.com/necojackarc/items/c77cf3b5368b9d33601b#%E3%82%AB%E3%82%B9%E3%82%BF%E3%83%A0%E4%BE%8B%E5%A4%96%E3%82%92%E5%88%A9%E7%94%A8%E3%81%99%E3%82%8B
class UnknownRuleConstructorError extends Error {
    constructor(...args) {
        super(...args);

        // this.name = this.constructor.name; でも問題ないが、
        // enumerable を false にしたほうがビルトインエラーに近づく、
        Object.defineProperty(this, "name", {
            configurable: true,
            enumerable: false,
            value: this.constructor.name,
            writable: true,
        });

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnknownRuleConstructorError);
        }
    }
}

export const updateRecords = (objects) => {
    const request_body = {
        "app": APP_ID_APPLY,
        "records": objects.map((o) => {
            return {
                "id": o.id,
                "record": {
                    [fieldMemberFee_APPLY]: {
                        "value": o.fee
                    }
                }
            };
        }),
    };

    return client.record.updateAllRecords(request_body);
};
