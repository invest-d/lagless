// @ts-check
/*
    Version 1
    WFIの軽バン.com案件の早払い用CSVデータを出力する。
*/

import {
    downloadFile, encodeToSjis
} from "../util/output_csv";
import * as common_logics from "./outputTransferCsv/logics_output_csv";
import * as wfi_logics from "./outputTransferCsv/logics_output_csv_WfiEarlyPay";

/** @type { import("./outputTransferCsv/logics_output_csv").TransFerType } */
export const transferType = "advanceKeban";

const exec_target_message = "本機能は軽バン.comの早払い専用です。\n"
    + `従って、工務店IDが${Object.values(wfi_logics.AVAILABLE_CONSTRUCTORS).map((c) => c.ID).join(", ")}のいずれかの申込レコードのみを対象とします。`;

const getRecords = wfi_logics.getKintoneRecords;
const getAmount = common_logics.getEarlyPaymentAmount;

/**
* @param {string} payment_date
* @param {string} account
* @return {string}
*/
const getFileName = (payment_date, account) =>
    `軽バン.com早払い振込データ（支払日：${payment_date}、振込元：${account}）.csv`;

const completedMessage = "軽バン.com早払い用振込データのダウンロードを完了しました。";

export const createButton = () => {
    return common_logics.createButton({
        transferType,
        eventListener: clickButton,
    });
};

const clickButton = async () => {
    const do_download = common_logics.confirmBeforeExec();
    if (!do_download) {
        alert("処理は中断されました。");
        return;
    }

    const payment_date = common_logics.inputPaymentDate();
    const pattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!pattern.test(payment_date)) {
        alert(`入力形式が正しくありませんでした。\n入力した値：${payment_date}`);
        return;
    }

    const target_conditions = common_logics.getTargetConditions();
    alert(`${common_logics.fieldStatus_APPLY}フィールドが${target_conditions.join(", ")}のレコードを対象に処理します。`);

    alert(exec_target_message);

    const account = "ID"; // GMOあおぞらから振込できるのはIDの口座のみ
    const target_records = await getRecords(account, payment_date, target_conditions)
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
            r.transfer_amount = getAmount(r);
            return r;
        });
        const csv_data = common_logics.generateCsvData(applies_fixed_amount);
        const sjis_list = encodeToSjis(csv_data);

        downloadFile(sjis_list, getFileName(payment_date, account));

        await common_logics.updateToDone(target_records);

        alert(completedMessage);
    } catch (err) {
        alert(err);
    }
};
