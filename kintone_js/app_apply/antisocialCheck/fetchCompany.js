"use strict";

import { CLIENT } from "../../util/kintoneAPI";

import { schema_apply } from "../../161/schema";
const applicantName_APPLY           = schema_apply.fields.properties.company.code;
const applicantRepresentative_APPLY = schema_apply.fields.properties.representative.code;
const applicantPhone_APPLY          = schema_apply.fields.properties.phone.code;
const applicantEmail_APPLY          = schema_apply.fields.properties.mail.code;
const applicantPref_APPLY           = schema_apply.fields.properties.prefecture.code;
const applicantAddr_APPLY           = schema_apply.fields.properties.address.code;
const applicantSt_APPLY             = schema_apply.fields.properties.streetAddress.code;

import { schema_28 } from "../../28/schema";
const recordNo_COMPANY              = schema_28.fields.properties.レコード番号.code;
const companyName_COMPANY           = schema_28.fields.properties["法人名・屋号"].code;
const representative_COMPANY        = schema_28.fields.properties.代表者名.code;
const phoneNumber_COMPANY           = schema_28.fields.properties.TEL_本店.code;
const email_COMPANY                 = schema_28.fields.properties.メールアドレス_会社.code;
const address_COMPANY               = schema_28.fields.properties.住所_本店.code;

export const getSearchQuery = (record) => {
    const info = {
        name: record[applicantName_APPLY]["value"],
        representative: record[applicantRepresentative_APPLY]["representative"],
        phone: record[applicantPhone_APPLY]["value"],
        email: record[applicantEmail_APPLY]["value"],
        address: `${record[applicantPref_APPLY]["value"]}${record[applicantAddr_APPLY]["value"]}${record[applicantSt_APPLY]["value"]}`
    };

    const queries = [];
    if (info.name) queries.push(`${companyName_COMPANY} = "${info.name}"`);
    if (info.representative) queries.push(`${representative_COMPANY} = "${info.representative}"`);
    if (info.phone) queries.push(`${phoneNumber_COMPANY} = "${info.phone}"`);
    if (info.email) queries.push(`${email_COMPANY} = "${info.email}"`);
    if (info.address) queries.push(`${address_COMPANY} = "${info.address}"`);
    return queries.join(" or ");
};

export const searchCompanyRecord = (query) => {
    const body = {
        app: schema_28.id.appId,
        fields: [recordNo_COMPANY],
        query,
    };
    return CLIENT.record.getRecords(body);
};
