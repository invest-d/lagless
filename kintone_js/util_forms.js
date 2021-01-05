export function formatYMD(yyyy_mm_dd) {
    // Numberでキャストしてゼロ埋めされているのを取り除く
    const date = String(yyyy_mm_dd).split("-");
    return `${String(Number(date[0]))}年${String(Number(date[1]))}月${String(Number(date[2]))}日`;
}

export function addComma(num) {
    // 数字に3桁区切りのコンマを挿入した文字列を返す。整数のみ考慮
    return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
}

export function get_contractor_name(account, days_later, counstructor_id) {
    const is_available_late_payment = Number.isInteger(Number(days_later)) && Number(days_later) > 0;

    // 遅払いの提供がまだ開始していない状態であっても、V2として扱うべき工務店が例外的に存在する
    const exceptional_v2_constructors = {
        "100": "株式会社RealtorSolutions",
        "103": "古川製材株式会社",
        "105": "株式会社メガステップ",
        "201": "株式会社匠和美建",
        "202": "株式会社匠和美建",
        "203": "株式会社匠和美建",
        "204": "株式会社ハウジング重兵衛",
        "212": "株式会社エムアールエスブレイン",
        "213": "株式会社リガード",
        "301": "ウスクラ建設（株）",
        "400": "株式会社ワールドフォースインターナショナル",
        "401": "株式会社ワールドフォースインターナショナル",
        "402": "株式会社ワールドフォースインターナショナル",
        "403": "株式会社ワールドフォースインターナショナル",
        "404": "株式会社ワールドフォースインターナショナル",
        "dev100": "株式会社リライトテスト用"
        // 下記もV2扱いだが、工務店マスタが未作成。作成次第対応
        // "ファストハウス株式会社",
        // "株式会社住まいず",
        // "駒商株式会社",
    };

    let version = "";
    if (is_available_late_payment || counstructor_id in exceptional_v2_constructors) {
        version = "V2";
    } else {
        version = "V1";
    }

    return {
        "ID": {
            "V1": "株式会社NID",
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
