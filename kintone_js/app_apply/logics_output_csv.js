"use strict";

export const CLIENT = new KintoneRestAPIClient({baseUrl: "https://investdesign.cybozu.com"});

import { schema_apply as schema_apply_dev } from "../159/schema";
import { schema_apply as schema_apply_prod } from "../161/schema";
import { zenkakuToHankaku } from "../util/characterWidth";

export const APP_ID_APPLY = kintone.app.getId();

export const schema_apply = ((app_id) => {
    if (app_id === 159) {
        return schema_apply_dev;
    } else if (app_id === 161) {
        return schema_apply_prod;
    } else {
        throw new Error(`Invalid app: ${app_id}`);
    }
})(APP_ID_APPLY);

export const fieldRecordId_APPLY            = schema_apply.fields.properties.レコード番号.code;
export const fieldBankCode_APPLY            = schema_apply.fields.properties.bankCode.code;
export const fieldBranchCode_APPLY          = schema_apply.fields.properties.branchCode.code;
export const fieldDepositType_APPLY         = schema_apply.fields.properties.deposit.code;
export const fieldAccountNumber_APPLY       = schema_apply.fields.properties.accountNumber.code;
export const fieldAccountName_APPLY         = schema_apply.fields.properties.accountName.code;
export const fieldTotalReceivables_APPLY    = schema_apply.fields.properties.totalReceivables.code;
export const fieldTransferAmount_APPLY      = schema_apply.fields.properties.transferAmount.code;
export const fieldStatus_APPLY              = schema_apply.fields.properties.状態.code;
const statusReady_APPLY                     = schema_apply.fields.properties.状態.options.振込前確認完了.label;
const statusDone_APPLY                      = schema_apply.fields.properties.状態.options.振込データ出力済.label;
export const fieldPaymentDate_APPLY         = schema_apply.fields.properties.paymentDate.code;
export const fieldPaymentAccount_APPLY      = schema_apply.fields.properties.paymentAccount.code;
export const fieldPaymentTiming_APPLY       = schema_apply.fields.properties.paymentTiming.code;
export const fieldConstructionShopId_APPLY  = schema_apply.fields.properties.constructionShopId.code;
export const fieldKyoryokuId_APPLY          = schema_apply.fields.properties.ルックアップ.code;

export const needToShow = (event, button_name, view_name) => {
    // 一覧機能で特定の一覧を選んでいる場合のみ表示
    const is_selected_available_list = event.viewName === view_name;

    // 同一ボタンの重複作成防止
    const not_displayed = document.getElementById(button_name) === null;

    return is_selected_available_list && not_displayed;
};

export const confirmBeforeExec = () => {
    const message = "振込用のcsvデータをダウンロードします。よろしいですか？\n\n"
        + "※このあとに支払日を指定し、\n"
        + "未出力のものだけ出力 OR 出力済みも含めて全て出力 のどちらかを選択できます。";
    return confirm(message);
};

export const inputPaymentDate = () => {
    return prompt("YYYY-MM-DDの形式で支払日を入力してください。\n例：2020-01-23");
};

export const getTargetConditions = () => {
    const message = "未出力の振込データだけを出力しますか？\n"
        + "OK：未出力のものは出力し、出力済みのものは出力しない\n"
        + "キャンセル：未出力のものも、出力済みのものも、全て出力する";
    const only_undownloaded = confirm(message);

    const conditions = [
        statusReady_APPLY
    ];

    if (!only_undownloaded) {
        conditions.push(statusDone_APPLY);
    }

    return conditions;
};

export const generateCsvData = (applies) => {
    // 申込レコード1つを1行のCSV文字列に変換
    const csv_rows = applies.map((apply) =>
        getAozoraCsvRow(apply, apply.transfer_amount)
    );
    // CSV文字列それぞれをCRLFで結合し、最終行の最後にもCRLFを追加して返す
    return `${csv_rows.join("\r\n")}\r\n`;
};

export const getEarlyPaymentAmount = (record) => {
    return record[fieldTransferAmount_APPLY]["value"];
};

const getAozoraCsvRow = (record, transfer_amount) => {
    // 仕様： https://gmo-aozora.com/support/guide/tranfer-upload.pdf 5/10ページ
    const fields = [];

    // 先にレコードのデータをゼロ埋めした値で上書きしておく
    record[fieldBankCode_APPLY]["value"]        = (`0000${record[fieldBankCode_APPLY]["value"]}`).slice(-4);
    record[fieldBranchCode_APPLY]["value"]      = (`000${record[fieldBranchCode_APPLY]["value"]}`).slice(-3);
    record[fieldAccountNumber_APPLY]["value"]   = (`0000000${record[fieldAccountNumber_APPLY]["value"]}`).slice(-7);

    fields.push(record[fieldBankCode_APPLY]["value"]);
    fields.push(record[fieldBranchCode_APPLY]["value"]);
    const deposit_type = (record[fieldDepositType_APPLY]["value"] === "普通")
        ? "1"
        : "2";
    fields.push(deposit_type);
    fields.push(record[fieldAccountNumber_APPLY]["value"]);
    fields.push(zenkakuToHankaku(record[fieldAccountName_APPLY]["value"]));
    fields.push(transfer_amount);
    fields.push(record[fieldKyoryokuId_APPLY]["value"]); // 顧客情報フィールド。任意入力フィールドであり、協力会社IDを記入する。
    fields.push(" "); // 識別表示フィールド。不使用

    return fields.join(",");
};

export const updateToDone = (outputted_records) => {
    const request_body = {
        "app": APP_ID_APPLY,
        "records": outputted_records.map((record) => {
            return {
                "id": record[fieldRecordId_APPLY]["value"],
                "record": {
                    [fieldStatus_APPLY]: {
                        "value": statusDone_APPLY
                    }
                }
            };
        })
    };

    return kintone.api(kintone.api.url("/k/v1/records", true), "PUT", request_body);
};
