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
