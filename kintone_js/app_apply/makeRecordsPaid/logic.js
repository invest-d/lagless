"use strict";
import { KE_BAN_CONSTRUCTORS } from "../../96/common";
/**
 * @typedef {Object} ConfirmParam
 * @property {number} targetNum - 処理対象レコードの件数
 * @property {string} targetState - 処理対象レコードの状態フィールドの値。メッセージに表示する
 * @property {string} newState - 処理対象レコードの更新後の状態フィールドの値。メッセージに表示する
*/
/**
 * @summary 処理前の確認メッセージを表示する。
 * @param {ConfirmParam} param
 * @return {boolean} 処理を継続する場合はtrue。処理対象の件数が0の場合はconfirm()なしでfalseを返す。
*/
export const confirmBeforeExec = ({ targetNum, targetState, newState }) => {
    const restrictedNotation = "\n\n※現状はWFI案件の申込レコードのみを処理します";

    if (!targetNum) {
        alert(`処理対象となるレコードはありませんでした。${restrictedNotation}`);
        return false;
    }

    const message = `状態が${targetState}のレコードを`
        + `全て${newState}に更新してもよろしいですか？`
        + `\n更新対象のレコード数: ${targetNum}件${restrictedNotation}`;
    return confirm(message);
};

export const getBody = ({
    app,
    statusFieldCode,
    targetStatuses,
    constructorIdFieldCode,
}) => {
    const statuses = targetStatuses.map((s) => `"${s}"`).join(",");
    const kebans = KE_BAN_CONSTRUCTORS.map((s) => `"${s}"`).join(",");
    const wfi = `${constructorIdFieldCode} in (${kebans})`;
    return {
        app,
        condition: `(${statusFieldCode} in (${statuses})) and (${wfi})`
    };
};

export const putBody = ({
    app,
    targetRecords,
    idFieldCode,
    statusFieldCode,
    newStatusValue
}) => {
    const records = targetRecords
        .map((r) => {
            return {
                id: r[idFieldCode].value,
                record: { [statusFieldCode]: { value: newStatusValue } },
            };
        });
    return {
        app,
        records
    };
};
