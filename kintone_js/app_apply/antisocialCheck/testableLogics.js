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

export const parsed = (csvString) => {
    // 最初の1行はsummary
    const summaryHeader = "最終更新年月日,総件数,分割番号,分割数";
    const summaryString =  `${summaryHeader}\n${csvString.split("\n")[0]}`;
    const summary = parse(summaryString, { columns: true });
    console.log(summary);

    // 2行目からがデータ
    // reference: https://www.houjin-bangou.nta.go.jp/documents/k-resource-dl.pdf
    const dataHeader = "連番,法人番号13桁,処理区分,訂正区分,更新年月日,変更年月日,称号又は名称,商号又は名称イメージID,法人種別,国内所在地_都道府県,国内所在地_市区町村,国内所在地_丁目番地等,国内所在地_イメージID,都道府県コード,市区町村コード,郵便番号,国外所在地,国外所在地イメージID,登記記録の閉鎖等年月日,登記記録の閉鎖等の事由,承継先法人番号,変更事由の詳細,法人番号指定年月日,最新履歴,商号又は名称_英語表記,国内所在地_都道府県_英語表記,国内所在地_市区町村丁目番地等_英語表記,国外所在地_英語表記,フリガナ,検索対象除外";
    const dataString = `${dataHeader}\n${csvString.split("\n").slice(1).join("\n")}`;
    const data = parse(dataString, { columns: true });
    console.log(data);
    return { summary, data };
};
