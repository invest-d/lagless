import { schema_28 } from "../../28/schema";
const payerCompany = schema_28.fields.properties.取引区分.options.支払企業.label;
const assignorCompany = schema_28.fields.properties.取引区分.options.譲渡企業.label;

import { isKeban } from "../../96/common";

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
