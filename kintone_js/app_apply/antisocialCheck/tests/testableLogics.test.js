import {
    getTransactionType,
    getSearchQuery,
    parsed,
    cleansedPref,
} from "../testableLogics";

test("WFIの場合に支払企業を返す", () => {
    for (const id of ["400", "401", "402", "403", "404"]) {
        const applicant = {
            constructorId: id,
        };
        expect(getTransactionType(applicant)).toBe("支払企業");
    }
});

test("その他の場合に譲渡企業を返す", () => {
    for (const id of ["100", "201", "303", "500", "501", "5001", "606"]) {
        const applicant = {
            constructorId: id,
        };
        expect(getTransactionType(applicant)).toBe("譲渡企業");
    }
});

test("単一条件クエリ", () => {
    expect(getSearchQuery({
        name: "テストカンパニー",
    })).toBe('(法人名・屋号 = "テストカンパニー")');
});

test("複数条件クエリ", () => {
    expect(getSearchQuery({
        name: "テストカンパニー",
        phone: "090-1234-5678",
    })).toBe('(法人名・屋号 = "テストカンパニー") or (TEL_本店 = "090-1234-5678")');
});

test("parse csv", () => {
    const sampleCsvString = `2021-10-06,1,1,1
1,3010001211261,01,0,2020-08-04,2020-08-04,"インベストデザイン株式会社",,301,"東京都","千代田区","神田神保町３丁目５番地住友不動産九段下ビル７Ｆ",,13,101,1010051,,,,,,,2020-08-04,1,,,,,"インベストデザイン",0`;
    expect(parsed(sampleCsvString).data[0]).toEqual({
        連番: "1",
        法人番号13桁: "3010001211261",
        処理区分: "01",
        訂正区分: "0",
        更新年月日: "2020-08-04",
        変更年月日: "2020-08-04",
        称号又は名称: "インベストデザイン株式会社",
        商号又は名称イメージID: "",
        法人種別: "301",
        国内所在地_都道府県: "東京都",
        国内所在地_市区町村: "千代田区",
        国内所在地_丁目番地等: "神田神保町３丁目５番地住友不動産九段下ビル７Ｆ",
        国内所在地_イメージID: "",
        都道府県コード: "13",
        市区町村コード: "101",
        郵便番号: "1010051",
        国外所在地: "",
        国外所在地イメージID: "",
        登記記録の閉鎖等年月日: "",
        登記記録の閉鎖等の事由: "",
        承継先法人番号: "",
        変更事由の詳細: "",
        法人番号指定年月日: "2020-08-04",
        最新履歴: "1",
        商号又は名称_英語表記: "",
        国内所在地_都道府県_英語表記: "",
        国内所在地_市区町村丁目番地等_英語表記: "",
        国外所在地_英語表記: "",
        フリガナ: "インベストデザイン",
        検索対象除外: "0",
    });
});

test("都道府県クレンジング", () => {
    for (const rawPref of ["群馬県", "東京都", "京都府", "北海道"]) {
        expect(cleansedPref(rawPref)).toBe(rawPref.slice(0, rawPref.length-1));
    }
});
