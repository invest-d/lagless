export function formatYMD(yyyy_mm_dd) {
    // Numberでキャストしてゼロ埋めされているのを取り除く
    const date = String(yyyy_mm_dd).split("-");
    return `${String(Number(date[0]))}年${String(Number(date[1]))}月${String(Number(date[2]))}日`;
}

export function addComma(num) {
    // 数字に3桁区切りのコンマを挿入した文字列を返す。整数のみ考慮
    return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
}

export function get_contractor_name(account, days_later) {
    let version = "";
    if (Number.isInteger(days_later) && Number(days_later) > 0) {
        version = "V2";
    } else {
        version = "V1";
    }

    return {
        "ID": {
            "V1": "インベストデザイン株式会社",
            "V2": "ラグレス2合同会社"
        },
        "LAGLESS": {
            "V1": "ラグレス合同会社",
            "V2": "ラグレス合同会社"
        }
    }[account][version];
}

export function get_display_payment_timing(timing_value) {
    if (timing_value === "遅払い") {
        return timing_value;
    } else {
        return "早払い";
    }
}
