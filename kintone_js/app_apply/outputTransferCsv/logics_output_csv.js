// @ts-check
"use strict";

import { zenkakuToHankaku } from "../../util/characterWidth";
import { getApplyAppSchema, UnknownAppError } from "../../util/choiceApplyAppSchema";
import {
    downloadFile, encodeToSjis
} from "../../util/output_csv";
import * as realtor from "./logics_output_csv_RealtorOriginalPay";
import * as keban from "./logics_output_csv_WfiEarlyPay";
import * as workship from "./logicsAdvanceWorkship";
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
        recordId: applyAppSchema.fields.properties.レコード番号.code,
        bankCode: applyAppSchema.fields.properties.bankCode.code,
        branchCode: applyAppSchema.fields.properties.branchCode.code,
        depositType: applyAppSchema.fields.properties.deposit.code,
        accountNumber: applyAppSchema.fields.properties.accountNumber.code,
        accountName: applyAppSchema.fields.properties.accountName.code,
        status: {
            code: applyAppSchema.fields.properties.状態.code,
            options: {
                ready: applyAppSchema.fields.properties.状態.options.振込前確認完了.label,
                done: applyAppSchema.fields.properties.状態.options.振込データ出力済.label
            },
        },
        kyoryokuId: applyAppSchema.fields.properties.ルックアップ.code,
        transferAmount: applyAppSchema.fields.properties.transferAmount.code,
    }
};

const getEarlyPaymentAmount = (record) => {
    return record[applyApp.fields.transferAmount]["value"];
};

/**
 * @typedef {"usualRealtor"|"advanceKeban"|"advanceWorkship"} TransferType
*/

/**
 * @typedef {Object} ButtonParams
 * @property {string} id
 * @property {string} innerText
*/

/**
 * @typedef {Object} TransferParameters
 * @property {ButtonParams} button
 * @property {Function} getRecords - 申込アプリから対象レコードを取得する
 * @property {Function} getAmount - 申込アプリのレコードに対して振込金額を算出する
 * @property {Function} getFileName - 出力するCSVファイルのファイル名を得る
 * @property {string} completedMessage - 処理終了時に表示する文字列
*/

/**
* @typedef {Object} Transfer
* @property {TransferParameters} usualRealtor
* @property {TransferParameters} advanceKeban
* @property {TransferParameters} advanceWorkship
*/

/** @type {Transfer} */
const TRANSFER = {
    usualRealtor: {
        button: {
            id: "outputRealtorCsv",
            innerText: "総合振込データ（リライト通常払い）",
        },
        getRecords: realtor.getKintoneRecords,
        getAmount: realtor.getOriginalPaymentAmount,
        getFileName: (/** @type {string} */ payment_date, /** @type {string} */ account) => `リライト通常払い振込データ（支払日：${payment_date}、振込元：${account}）.csv`,
        completedMessage: "リライト通常払い用振込データのダウンロードを完了しました。",
    },
    advanceKeban: {
        button: {
            id: "outputWfiEarlyCsv",
            innerText: "総合振込データ（WFI早払い）",
        },
        getRecords: keban.getKintoneRecords,
        getAmount: getEarlyPaymentAmount,
        getFileName: (/** @type {string} */ payment_date, /** @type {string} */ account) => `軽バン.com早払い振込データ（支払日：${payment_date}、振込元：${account}）.csv`,
        completedMessage: "軽バン.com早払い用振込データのダウンロードを完了しました。",
    },
    advanceWorkship: {
        button: {
            id: "outputAdvanceWorkshipCsv",
            innerText: "総合振込データ（Workship早払い）",
        },
        getRecords: workship.getKintoneRecords,
        getAmount: getEarlyPaymentAmount,
        getFileName: (/** @type {string} */ payment_date, /** @type {string} */ account) => `Workship前払い振込データ（支払日：${payment_date}、振込元：${account}）.csv`,
        completedMessage: "Workship前払い用振込データのダウンロードを完了しました。",
    },
};

/**
* @summary クリックすると総合振込用のCSVファイルをダウンロードできるbuttonエレメントを返す
* @param {any} event
* @param {TransferType} transferType
* @param {string} view_name
* @return {boolean}
*/
export const needToShow = (event, transferType, view_name) => {
    // 一覧機能で特定の一覧を選んでいる場合のみ表示
    const is_selected_available_list = event.viewName === view_name;

    // 同一ボタンの重複作成防止
    const not_displayed =
        document.getElementById(TRANSFER[transferType].button.id) === null;

    return is_selected_available_list && not_displayed;
};

/**
* @summary クリックすると総合振込用のCSVファイルをダウンロードできるbuttonエレメントを返す
* @param {Object} params
* @param {TransferType} params.transferType
* @return {HTMLButtonElement}
*/
export const createButton = ({ transferType }) => {
    const button = document.createElement("button");
    button.id = TRANSFER[transferType].button.id;
    button.innerText = TRANSFER[transferType].button.innerText;
    const eventListener = clickButtonFunc(transferType);
    // @ts-ignore
    button.addEventListener("click", eventListener);
    return button;
};

const confirmBeforeExec = () => {
    const message = "振込用のcsvデータをダウンロードします。よろしいですか？\n\n"
        + "※このあとに支払日を指定し、\n"
        + "未出力のものだけ出力 OR 出力済みも含めて全て出力 のどちらかを選択できます。";
    return confirm(message);
};

/**
* @param {TransferType} transferType - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @return {Function}
*/
const clickButtonFunc = (transferType) => {
    return async () => {
        const do_download = confirmBeforeExec();
        if (!do_download) {
            alert("処理は中断されました。");
            return;
        }

        const payment_date = inputPaymentDate();
        const pattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!pattern.test(payment_date)) {
            alert(`入力形式が正しくありませんでした。\n入力した値：${payment_date}`);
            return;
        }

        const target_conditions = getTargetConditions();
        alert(`${applyApp.fields.status.code}フィールドが${target_conditions.join(", ")}のレコードを対象に処理します。`);

        const account = "ID"; // GMOあおぞらから振込できるのはIDの口座のみ
        const target_records = await TRANSFER[transferType].getRecords(account, payment_date, target_conditions)
            .catch((err) => {
                alert(`支払元口座：${account}のデータを取得中にエラーが発生しました。\n${err.message}`);
                throw new Error(err);
            });

        if (target_records && target_records.length === 0) {
            alert(`支払日：${payment_date}、振込元：${account}で、状態が${target_conditions.join(", ")}のレコードはありませんでした。`);
            return;
        }

        try {
            const applies_fixed_amount = target_records.map((r) => {
                r.transfer_amount = TRANSFER[transferType].getAmount(r);
                return r;
            });
            const csv_data = generateCsvData(applies_fixed_amount);
            const sjis_list = encodeToSjis(csv_data);

            downloadFile(sjis_list, TRANSFER[transferType].getFileName(payment_date, account));

            await updateToDone(target_records);

            alert(TRANSFER[transferType].completedMessage);
        } catch (err) {
            console.error(err);
            alert(err);
        }
    };
};

const inputPaymentDate = () => {
    return prompt("YYYY-MM-DDの形式で支払日を入力してください。\n例：2020-01-23");
};

const getTargetConditions = () => {
    const message = "未出力の振込データだけを出力しますか？\n"
        + "OK：未出力のものは出力し、出力済みのものは出力しない\n"
        + "キャンセル：未出力のものも、出力済みのものも、全て出力する";
    const only_undownloaded = confirm(message);

    const conditions = [
        applyApp.fields.status.options.ready
    ];

    if (!only_undownloaded) {
        conditions.push(applyApp.fields.status.options.done);
    }

    return conditions;
};

const generateCsvData = (applies) => {
    // 申込レコード1つを1行のCSV文字列に変換
    const csv_rows = applies.map((apply) =>
        getAozoraCsvRow(apply, apply.transfer_amount)
    );
    // CSV文字列それぞれをCRLFで結合し、最終行の最後にもCRLFを追加して返す
    return `${csv_rows.join("\r\n")}\r\n`;
};

const getAozoraCsvRow = (record, transfer_amount) => {
    // 仕様： https://gmo-aozora.com/support/guide/tranfer-upload.pdf 5/10ページ
    const fields = [];

    // 先にレコードのデータをゼロ埋めした値で上書きしておく
    record[applyApp.fields.bankCode]["value"] = (`0000${record[applyApp.fields.bankCode]["value"]}`).slice(-4);
    record[applyApp.fields.branchCode]["value"] = (`000${record[applyApp.fields.branchCode]["value"]}`).slice(-3);
    record[applyApp.fields.accountNumber]["value"] = (`0000000${record[applyApp.fields.accountNumber]["value"]}`).slice(-7);

    fields.push(record[applyApp.fields.bankCode]["value"]);
    fields.push(record[applyApp.fields.branchCode]["value"]);
    const deposit_type = (record[applyApp.fields.depositType]["value"] === "普通")
        ? "1"
        : "2";
    fields.push(deposit_type);
    fields.push(record[applyApp.fields.accountNumber]["value"]);
    fields.push(zenkakuToHankaku(record[applyApp.fields.accountName]["value"]));
    fields.push(transfer_amount);
    fields.push(record[applyApp.fields.kyoryokuId]["value"]); // 顧客情報フィールド。任意入力フィールドであり、協力会社IDを記入する。
    fields.push(" "); // 識別表示フィールド。不使用

    return fields.join(",");
};

const updateToDone = (outputted_records) => {
    const request_body = {
        "app": applyApp.id,
        "records": outputted_records.map((record) => {
            return {
                "id": record[applyApp.fields.recordId]["value"],
                "record": {
                    [applyApp.fields.status.code]: {
                        "value": applyApp.fields.status.options.done
                    }
                }
            };
        })
    };

    // @ts-ignore
    return kintone.api(kintone.api.url("/k/v1/records", true), "PUT", request_body);
};
