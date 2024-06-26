"use strict";

/**
* @summary 特定の工務店IDの協力会社レコードを初めて登録する際に、新規協力会社IDを取得する
* @param {string[]} laboIds - マスタに存在する全ての協力会社ID（テスト用レコードを除く）
* @return {string} 5桁の協力会社ID
*/
export const getNewLaborId = (laborIds) => {
    const first2Digits = laborIds
        .map((laborId) => laborId.substring(0, 2))
        .map((first2Digit) => Number(first2Digit));

    if (first2Digits.length > 0) {
        const maxDigit = Math.max(...first2Digits);
        return `${String(maxDigit + 1)}000`;
    } else {
        // 本当に何もレコードが登録されていない場合は最初の番号として10000を返す
        return "10000";
    }
};
