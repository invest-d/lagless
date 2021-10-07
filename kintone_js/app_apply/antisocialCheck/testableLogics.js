import parse from "csv-parse/lib/sync";
import { schema_28 } from "../../28/schema";
import { isKeban } from "../../96/common";

const payerCompany = schema_28.fields.properties.取引区分.options.支払企業.label;
const assignorCompany = schema_28.fields.properties.取引区分.options.譲渡企業.label;
const companyName_COMPANY = schema_28.fields.properties["法人名・屋号"].code;
const representative_COMPANY = schema_28.fields.properties.代表者名.code;
const phoneNumber_COMPANY = schema_28.fields.properties.TEL_本店.code;
const email_COMPANY = schema_28.fields.properties.メールアドレス_会社.code;
const address_COMPANY = schema_28.fields.properties.住所_本店.code;


/**
 * @typedef {Object} Applicant
 * @property {string} constructorId
 */

/**
* @summary 申込アプリの情報を元にして、申込をした企業がインベストにとって債権の譲渡者なのか支払者なのかを判定して返す
* @param {Applicant} applicant - 申込者の情報
* @return {"譲渡企業"|"支払企業"} - 固定文字列を返す。schemaに則った値を返すので、schemaを更新すれば文字列の値も変わる。
*/
export const /** @type {"譲渡企業"|"支払企業"} */ getTransactionType = (applicant) => {
    // WFI案件の申込者→支払企業
    // それ以外の申込者→譲渡企業
    return isKeban(applicant.constructorId)
        ? payerCompany
        : assignorCompany;
};

export const getSearchQuery = ({
    name,
    representative,
    phone,
    email,
    address,
}) => {
    const queries = [];
    if (name) queries.push(`${companyName_COMPANY} = "${name}"`);
    if (representative) queries.push(`${representative_COMPANY} = "${representative}"`);
    if (phone) queries.push(`${phoneNumber_COMPANY} = "${phone}"`);
    if (email) queries.push(`${email_COMPANY} = "${email}"`);
    if (address) queries.push(`${address_COMPANY} = "${address}"`);
    return queries.map((q) => `(${q})`).join(" or ");
};

/**
 * @typedef {Object} Summary
 * @property {string} 最終更新年月日 - YYYY-MM-DD
 * @property {string} 総件数
 * @property {string} 分割番号
 * @property {string} 分割数
 */

/**
 * @typedef {Object} Data
 * @property {string} 連番
 * @property {string} 法人番号13桁
 * @property {string} 処理区分
 * @property {string} 訂正区分
 * @property {string} 更新年月日
 * @property {string} 変更年月日
 * @property {string} 商号又は名称
 * @property {string} 商号又は名称イメージID
 * @property {string} 法人種別
 * @property {string} 国内所在地_都道府県
 * @property {string} 国内所在地_市区町村
 * @property {string} 国内所在地_丁目番地等
 * @property {string} 国内所在地_イメージID
 * @property {string} 都道府県コード
 * @property {string} 市区町村コード
 * @property {string} 郵便番号
 * @property {string} 国外所在地
 * @property {string} 国外所在地イメージID
 * @property {string} 登記記録の閉鎖等年月日
 * @property {string} 登記記録の閉鎖等の事由
 * @property {string} 承継先法人番号
 * @property {string} 変更事由の詳細
 * @property {string} 法人番号指定年月日
 * @property {string} 最新履歴
 * @property {string} 商号又は名称_英語表記
 * @property {string} 国内所在地_都道府県_英語表記
 * @property {string} 国内所在地_市区町村丁目番地等_英語表記
 * @property {string} 国外所在地_英語表記
 * @property {string} フリガナ
 * @property {string} 検索対象除外
 */

export const parsed = (csvString) => {
    // 最初の1行はsummary
    const summaryHeader = "最終更新年月日,総件数,分割番号,分割数";
    const summaryString =  `${summaryHeader}\n${csvString.split("\n")[0]}`;
    /** @type {Summary} */
    const summary = parse(summaryString, { columns: true })[0];
    console.log(summary);

    // 2行目からがデータ
    // reference: https://www.houjin-bangou.nta.go.jp/documents/k-resource-dl.pdf
    const dataHeader = "連番,法人番号13桁,処理区分,訂正区分,更新年月日,変更年月日,商号又は名称,商号又は名称イメージID,法人種別,国内所在地_都道府県,国内所在地_市区町村,国内所在地_丁目番地等,国内所在地_イメージID,都道府県コード,市区町村コード,郵便番号,国外所在地,国外所在地イメージID,登記記録の閉鎖等年月日,登記記録の閉鎖等の事由,承継先法人番号,変更事由の詳細,法人番号指定年月日,最新履歴,商号又は名称_英語表記,国内所在地_都道府県_英語表記,国内所在地_市区町村丁目番地等_英語表記,国外所在地_英語表記,フリガナ,検索対象除外";
    const dataString = `${dataHeader}\n${csvString.split("\n").slice(1).join("\n")}`;
    /** @type {Data[]} */
    const data = parse(dataString, { columns: true });
    console.log(data);
    return { summary, data };
};

export const reprData = (/** @type {Data} */ data) => {
    const corporateTypes = {
        "101": "国の機関",
        "201": "地方公共団体",
        "301": "株式会社",
        "302": "有限会社",
        "303": "合名会社",
        "304": "合資会社",
        "305": "合同会社",
        "399": "その他の設立登記法人",
        "401": "外国会社等",
        "499": "その他",
    };
    const corporateType = ((t) => {
        if (corporateTypes[t]) return corporateTypes[t];
        return `不明(コード: ${t})`;
    })(data.法人種別);

    return `-----結果番号: ${data.連番}----------
会社名: ${data.商号又は名称}
法人種別: ${corporateType}
所在地: ${data.国内所在地_都道府県}${data.国内所在地_市区町村}`;
};

export const cleansedPref = (/** @type {string} */ rawPref) => {
    if (!rawPref) return "";

    return rawPref.replace(/都$|道$|府$|県$/g, "");
};
