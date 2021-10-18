"use strict";

/**
* @summary 協力会費の差引テキストを返す。協力会費が存在しない商品名の場合は空配列を返す
* @param {"ラグレス"|"ダンドリペイメント"|"リノベ不動産Payment"|"ロジデリペイ"} productName - 工務店マスタに登録している商品名
* @param {string} memberFee - コンマ付きの金額
* @return {string[]}
*/
export const getNotationText = (productName, memberFee) => {
    const products = {
        "ラグレス": {
            memberFee: true,
        },
        "ダンドリペイメント": {
            memberFee: true,
        },
        "リノベ不動産Payment": {
            memberFee: true,
        },
        "ロジデリペイ": {
            memberFee: false,
        },
    };

    if (products[productName].memberFee) {
        return [
            "",
            // eslint-disable-next-line no-irregular-whitespace
            `差引額（協力会費・立替金等）②　-${memberFee}円`, //ゼロ円であっても -0円 表記
        ];
    }

    return [];
};
