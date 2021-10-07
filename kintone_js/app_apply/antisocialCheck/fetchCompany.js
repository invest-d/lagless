"use strict";

import { schema_apply } from "../../161/schema";
import { schema_28 } from "../../28/schema";
import { CLIENT } from "../../util/kintoneAPI";
import { replaceFullWidthNumbers } from "../../util/manipulations";

const applicantName_APPLY = schema_apply.fields.properties.company.code;
const applicantRepresentative_APPLY = schema_apply.fields.properties.representative.code;
const applicantPhone_APPLY = schema_apply.fields.properties.phone.code;
const applicantEmail_APPLY = schema_apply.fields.properties.mail.code;
const applicantPref_APPLY = schema_apply.fields.properties.prefecture.code;
const applicantAddr_APPLY = schema_apply.fields.properties.address.code;
const applicantSt_APPLY = schema_apply.fields.properties.streetAddress.code;
const applicantZipcode_APPLY = schema_apply.fields.properties.postalCode.code;
const constructorId_APPLY = schema_apply.fields.properties.constructionShopId.code;

const recordNo_COMPANY = schema_28.fields.properties.レコード番号.code;
const companyName_COMPANY = schema_28.fields.properties["法人名・屋号"].code;
const representative_COMPANY = schema_28.fields.properties.代表者名.code;
const phoneNumber_COMPANY = schema_28.fields.properties.TEL_本店.code;
const email_COMPANY = schema_28.fields.properties.メールアドレス_会社.code;
const address_COMPANY = schema_28.fields.properties.住所_本店.code;
const addressAuto_COMPANY = schema_28.fields.properties.住所_HubSpotより.code;
const transactionType_COMPANY = schema_28.fields.properties.取引区分.code;
const companyType_COMPANY = schema_28.fields.properties.企業形態.code;
const type_person_COMPANY = schema_28.fields.properties.企業形態.options.個人企業.label;
const zipcodeNormal_COMPANY = schema_28.fields.properties.郵便番号_本店.code;
const zipcodeAuto_COMPANY = schema_28.fields.properties.郵便番号_HubSpotより.code;

import { getTransactionType } from "./testableLogics";

export const getFullAddress = (applyRecord) =>
    applyRecord[applicantPref_APPLY]["value"]
    + applyRecord[applicantAddr_APPLY]["value"]
    + applyRecord[applicantSt_APPLY]["value"];

export const searchCompanyRecord = (query) => {
    const body = {
        app: schema_28.id.appId,
        query,
    };
    return CLIENT.record.getRecords(body);
};

export const getOrCreateCompanyId = async (companyRecord, applyRecord) => {
    if (companyRecord && companyRecord.records.length) {
        return selectCompanyRecordNumber(companyRecord);
    } else {
        alert("レコードが見つからなかったため、新規作成します。");
        return await createCompanyRecord(applyRecord);
    }
};

export const selectCompanyRecordNumber = (companyRecord) => {
    // companyRecordが存在する場合。nullもしくは数値のレコード番号を返す
    const returnAsNumber = (input) => Number(replaceFullWidthNumbers(input));
    const recordRepr = (record) => `レコードNo: ${record[recordNo_COMPANY]["value"]}, `
        + `会社名: ${record[companyName_COMPANY]["value"]}, `
        + `所在地: ${record[address_COMPANY]["value"]}`;

    if (companyRecord.records.length === 1) {
        const num = companyRecord.records[0][recordNo_COMPANY]["value"];
        const message = "レコードが見つかりました。"
            + `\n${recordRepr(companyRecord.records[0])}`
            + "\nこのレコードを使って進めますか？";

        if (confirm(message)) return Number(num);

        const input = prompt("使用するレコード番号を手入力してください");
        if (input) return returnAsNumber(input);

        return null;
    } else {
        const reprs = companyRecord.records.map((r) => recordRepr(r)).join("\n");
        const message = `複数のレコードが見つかりました。\n${reprs}`
            + "\nどのレコード番号で進めますか？";
        const input = prompt(message);
        if (input) return returnAsNumber(input);
        return null;
    }
};

const createCompanyRecord = async (apply) => {
    const /** @type {"譲渡企業"|"支払企業"} */ transactionType = getTransactionType({
        constructorId: apply[constructorId_APPLY]["value"],
    });
    const new_record = {
        [companyName_COMPANY]: apply[applicantName_APPLY]["value"],
        [transactionType_COMPANY]: [transactionType],
        [companyType_COMPANY]: type_person_COMPANY,
        [representative_COMPANY]: apply[applicantRepresentative_APPLY]["value"],
        [zipcodeNormal_COMPANY]: apply[applicantZipcode_APPLY]["value"],
        [zipcodeAuto_COMPANY]: apply[applicantZipcode_APPLY]["value"],
        [address_COMPANY]: getFullAddress(apply),
        [addressAuto_COMPANY]: getFullAddress(apply),
        [phoneNumber_COMPANY]: apply[applicantPhone_APPLY]["value"],
        [email_COMPANY]: apply[applicantEmail_APPLY]["value"]
    };
    Object.keys(new_record).forEach((k) => new_record[k] = { value: new_record[k] });
    const body = {
        app: schema_28.id.appId,
        record: new_record
    };
    const result = await CLIENT.record.addRecord(body);
    alert(`レコード(${result.id})を新規作成しました。`
        + "個人企業扱いで登録しています。法人企業の場合はレコード内容を修正してください。");
    return result.id;
};
