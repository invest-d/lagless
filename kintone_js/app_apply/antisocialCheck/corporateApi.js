"use strict";
import { parsed } from "./testableLogics";

/**
 * @typedef {Object} Conds - https://www.houjin-bangou.nta.go.jp/documents/k-web-api-kinou-gaiyo.pdf page25
 * @property {string} id - userId
 * @property {string} name - 商号または法人名
 * @property {"01"|"02"|"12"} type - 01: S-JIS CSV, 02: Unicode CSV, 12: Unicode XML
 * @property {"1"|"2"} [mode="1"] - 1: 前方一致, 2: 部分一致
 * @property {"1"|"2"|"3"} [target="1"] - 1: あいまい検索, 2: 完全一致検索, 3: 英語表記登録情報検索
 * @property {"string"} [address] - JISX0401単体か、JISX0401とJISX0402を結合した文字列か、国外を示す"99"。JIS規格番号の詳細については https://www.jisc.go.jp/app/jis/general/GnrJISSearch.html で確認可能。
 * @property {"01"|"02"|"03"|"04"} [kind] - 01: 国の機関, 02: 地方公共団体, 03: 設立登記法人, 04: 外国会社等・その他, 未指定の場合は全て検索
 * @property {"0"|"1"} [change="0"] - 0: 変更履歴を含めない, 1: 変更履歴を含める
 * @property {"0"|"1"} [close="1"] - 0: 登記記録の閉鎖等を含めない, 1: 登記記録の閉鎖等を含める
 * @property {string} [from] - YYYY-MM-DD 法人番号指定年月日
 * @property {string} [to] - YYYY-MM-DD 法人番号指定年月日
 * @property {string} [divide="1"] - 1 - 99999 分割番号
 */

/**
* @summary 法人番号等検索サービスに法人情報を問い合わせる
* @param {Conds} conds
*/
export const request = async (conds) => {
    const api = "https://us-central1-lagless.cloudfunctions.net/searchCorporateByName";
    const resp = await fetch(api, {
        method: "POST",
        body: JSON.stringify({ conds }),
    });
    const csvString = await resp.json();
    console.log("retrieved");
    console.log(csvString);

    return parsed(csvString);
};
