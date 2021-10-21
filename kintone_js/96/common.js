import { isGigConstructorID } from "../util/gig_utils";

export const KE_BAN_CONSTRUCTORS = [
    "400",
    "401",
    "402",
    "403",
    "404",
];

export const KE_BAN_PRODUCT_NAME = "軽バン.com";

export const isKeban = (constructorId) => KE_BAN_CONSTRUCTORS.includes(constructorId);

export const SHOWA_CONSTRUCTORS = [
    "201",
    "202",
    "203",
];

export const FROM_KOBE_CONSTRUCTORS = [
    "800",
    "801",
];

export const normalizedConstructorId = (constructorId) => {
    if (KE_BAN_CONSTRUCTORS.includes(constructorId)) {
        return "400";
    } else if (FROM_KOBE_CONSTRUCTORS.includes(constructorId)) {
        return "800";
    } else if (isGigConstructorID(constructorId)) {
        return "500";
    } else {
        return constructorId;
    }
};

// FIXME: 工務店マスタと協力会社マスタで商品名の表記揺れが起きている。kintone側を修正するべき。
export const productNameMap = {
    fromKyoryoku: {
        "Workship": "Workship前払い",
        "ダンドリペイメント": "ダンドリペイメント",
        "テスト商品": "テスト商品",
        "ラグレス": "ラグレス",
        "リノベ不動産Payment": "リノベ不動産Payment",
        "軽バン.com": "軽バン.com",
        "ロジデリペイ": "ロジデリペイ",
    },
    fromKomuten: {
        "Workship前払い": "Workship",
        "ダンドリペイメント": "ダンドリペイメント",
        "テスト商品": "テスト商品",
        "ラグレス": "ラグレス",
        "リノベ不動産Payment": "リノベ不動産Payment",
        "軽バン.com": "軽バン.com",
        "ロジデリペイ": "ロジデリペイ",
    }
};
