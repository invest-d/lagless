"use strict";

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

/**
* @summary ファクタリングサービスそれ自体の手数料を示すテキストを返す
* @param {Object} param - description
* @param {"ラグレス"|"ダンドリペイメント"|"リノベ不動産Payment"|"ロジデリペイ"} param.productName
* @param {number} param.commissionPercentage
* @param {"未設定"|"早払い"|"通常払い"|"遅払い"} param.paymentTiming
* @param {string} param.commissionAmountComma - コンマで3桁区切りにした金額の文字列
* @param {boolean} param.shouldDiscountForFirst
* @return {string[]} Brief description of the returning value here.
*/
export const getServiceFeeText = ({
    productName,
    commissionPercentage,
    paymentTiming,
    commissionAmountComma,
    shouldDiscountForFirst
}) => {
    const lines = [];

    // 協力会費の差引が存在する場合はそもそもの債権金額が減少する
    const creditAmount = products[productName].memberFee
        ? "（①+②）"
        : "①";

    const feeSign = paymentTiming === "遅払い"
        ? "+"
        : "-";
    // eslint-disable-next-line no-irregular-whitespace
    lines.push(`${productName}　利用手数料【${creditAmount}×${commissionPercentage}％】　${feeSign}${commissionAmountComma}円`);
    if (shouldDiscountForFirst) {
        lines.push("※【初回申込限定】利用手数料半額キャンペーンが適用されました");
    }

    return lines;
};

/**
* @summary 協力会費の差引テキストを返す。協力会費が存在しない商品名の場合は空配列を返す
* @param {"ラグレス"|"ダンドリペイメント"|"リノベ不動産Payment"|"ロジデリペイ"} productName - 工務店マスタに登録している商品名
* @param {string} memberFee - コンマ付きの金額
* @return {string[]}
*/
export const getNotationText = (productName, memberFee) => {
    if (products[productName].memberFee) {
        return [
            "",
            // eslint-disable-next-line no-irregular-whitespace
            `差引額（協力会費・立替金等）②　-${memberFee}円`, //ゼロ円であっても -0円 表記
        ];
    }

    return [];
};
