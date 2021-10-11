"use strict";
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
    if (!targetNum) {
        alert("処理対象となるレコードはありませんでした。");
        return false;
    }

    const message = `振込予約が${targetState}のレコードについて、`
        + `全て電子確定日付を${newState}に更新してもよろしいですか？`
        + `\n更新対象のレコード数: ${targetNum}件`;
    return confirm(message);
};

export const getBody = ({
    app,
    statusFieldCode,
    targetStatus,
}) => {
    return {
        app,
        condition: `${statusFieldCode} in ("${targetStatus}")`
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
