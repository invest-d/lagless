/*
    Workshipの企業一覧が掲載されているhtmlファイルを解析し、各企業の属性を持ったオブジェクトを返す
*/

"use strict";

const client = new KintoneRestAPIClient({baseUrl: "https://investdesign.cybozu.com"});

const commonRecordIdDisplay = "レコード番号";
const commonRecordId        = "$id";

import { schema_28 } from "../28/schema";
const APP_ID_CUSTOMER                   = schema_28.id.appId;
const fieldcodeCustomerName_Customer    = schema_28.fields.properties["法人名・屋号"].code;
const fieldcodeCustomerNameAlt_Customer = schema_28.fields.properties["法人名・屋号_HubSpotより"].code;

import { schema_96 } from "./schema";
const APP_ID_CONSTRUCTOR                            = schema_96.id.appId;
const fieldcodeConstructorId_CONSTRUCTOR            = schema_96.fields.properties.id.code;
const fielddspConstructorId_CONSTRUCTOR             = schema_96.fields.properties.id.label;
const fieldcodeConstructorNameAlias_CONSTRUCTOR     = schema_96.fields.properties.工務店名.code;
const fielddspConstructorNameAlias_CONSTRUCTOR      = schema_96.fields.properties.工務店名.label;
const fieldcodeConstructorName_CONSTRUCTOR          = schema_96.fields.properties.工務店正式名称.code;
const fielddspConstructorName_CONSTRUCTOR           = schema_96.fields.properties.工務店正式名称.label;
const fielddspCustomerCode_CONSTRUCTOR              = schema_96.fields.properties.customerCode.label;
const fielddspCeoTitle_CONSTRUCTOR                  = schema_96.fields.properties.ceoTitle.label;
const fielddspCeo_CONSTRUCTOR                       = schema_96.fields.properties.ceo.label;
const fielddspAccount_CONSTRUCTOR                   = schema_96.fields.properties.支払元口座.label;
const fielddspProductName_CONSTRUCTOR               = schema_96.fields.properties.service.label;
const fielddspOriginalPays_CONSTRUCTOR              = schema_96.fields.properties.defaultPaymentResponsible.label;
const fielddspCostDisplay_CONSTRUCTOR               = schema_96.fields.properties.cost.label;
const fielddspCostDecimal_CONSTRUCTOR               = schema_96.fields.properties.tmpcommissionRate.label;
const fielddspTransferFee_CONSTRUCTOR               = schema_96.fields.properties.transfer_fee.label;
const fielddspTransferFeeDecimal_CONSTRUCTOR        = schema_96.fields.properties.tmptransferFee.label;
const fielddspMail_CONSTRUCTOR                      = schema_96.fields.properties.mail.label;
const fielddspClosing_CONSTRUCTOR                   = schema_96.fields.properties.closing.label;
const fielddspOriginalPayDate_CONSTRUCTOR           = schema_96.fields.properties.original.label;
const fielddspLag_CONSTRUCTOR                       = schema_96.fields.properties.lag.label;
const fielddspDeadline_CONSTRUCTOR                  = schema_96.fields.properties.deadline.label;
const fielddspEarlyPay_CONSTRUCTOR                  = schema_96.fields.properties.early.label;
const fielddspEffect_CONSTRUCTOR                    = schema_96.fields.properties.effect.label;
const fielddspHandleHoliday_CONSTRUCTOR             = schema_96.fields.properties.handleForHolidays.label;
const fielddspCreditFacility_CONSTRUCTOR            = schema_96.fields.properties.creditFacility.label;

import {
    encodeToSjis,
    downloadFile
} from "../app_apply/logics_output_csv";

export const target_mime = "text/html";

export const getOrderersList = async (html_string) => {
    const orderers = new WorkshipOrderers(html_string);
    const audited = orderers.getList().filter((o) => o.audited);
    return await splitList(audited);
};

class WorkshipOrderers {
    constructor(html_string) {
        const parser = new DOMParser();
        this.doc = parser.parseFromString(html_string, target_mime);
    }

    getList() {
        return Array.from(this.doc.querySelectorAll("#right-panel > div.content.mt-3 > table > tbody > tr"))
            .map((e) => new WorkshipOrderer(e));
    }
}

class WorkshipOrderer {
    constructor(row_element) {
        const columns = row_element.getElementsByTagName("td");
        // 列の並び順は固定とする
        this.audited = columns[0].innerText.includes("監査済");
        this.name = columns[1].innerText.replaceAll(/\n/g, "");
        this.address = columns[2].innerText.replaceAll(/ |\n/g, "");

        const tel_matches = columns[3].innerText.match(/0\d{9,10}|0\d{1,3}-\d{1,4}-\d{4}|(070|080|090)-\d{4}-\d{4}/g);
        if (tel_matches) {
            this.tel = tel_matches[0];
        } else {
            this.tel = null;
        }

        // eslint-disable-next-line no-useless-escape
        const email_matches = columns[3].innerText.match(/[a-zA-Z0-9-_\.]+@[a-zA-Z0-9-_\.]+/g);
        if (email_matches) {
            this.email = email_matches[0];
        } else {
            this.email = null;
        }

        const credit_facility_matches = columns[4].innerText.match(/(\d|,)+円/g);
        if (credit_facility_matches) {
            this.credit_facility = Number(credit_facility_matches[0].replaceAll(/\D/g, ""));
        } else {
            this.credit_facility = null;
        }

        const commission_rate_matches = columns[4].innerText.match(/(\d|\.)+%/g);
        if (commission_rate_matches) {
            this.commission_rate = Number(commission_rate_matches[0].replaceAll(/%/g, ""));
        } else {
            this.commission_rate = null;
        }

        this.record_obj = null;
        this.retlieved = false;
    }

    async record() {
        if (this.retlieved) {
            return this.record_obj;
        }

        this.retlieved = true;
        this.record_obj = await getConstructor(this.name);
        return this.record_obj;
    }

    async exists() {
        const retlieved = await this.record();
        return Boolean(retlieved);
    }
}

const getConstructor = async (name) => {
    const request_body = {
        "app": APP_ID_CONSTRUCTOR,
        "query": `${fieldcodeConstructorName_CONSTRUCTOR} = "${name}"
            or ${fieldcodeConstructorNameAlias_CONSTRUCTOR} = "${name}"`,
        "totalCount": true
    };

    const result = await client.record.getRecords(request_body);
    if (result.totalCount === "0") {
        return null;
    } else {
        return result.records[0];
    }
};

const getLatestGigConstructorId = async () => {
    const request_body = {
        "app": APP_ID_CONSTRUCTOR,
        "fields": [fieldcodeConstructorId_CONSTRUCTOR]
    };

    const result = await client.record.getRecords(request_body);
    // とりあえず全件取得して、工務店IDが5始まりのものだけを抽出
    const gig_constructors = result.records.filter((r) => r[fieldcodeConstructorId_CONSTRUCTOR]["value"].startsWith("5"));
    // 数値に直せるものだけ直して最大値を取得
    const max_id = Math.max(...gig_constructors
        .map((c) => Number(c[fieldcodeConstructorId_CONSTRUCTOR]["value"]))
        .filter((id) => !Number.isNaN(id)));

    if (max_id === 599) {
        return 5001;
    } else {
        return max_id;
    }
};

const getCustomerCode = async (name) => {
    // 取引企業管理アプリの中から、法人名が完全一致するものを取得する
    const request_body = {
        "app": APP_ID_CUSTOMER,
        "query": `${fieldcodeCustomerName_Customer} = "${name}"
            or ${fieldcodeCustomerNameAlt_Customer} = "${name}"`,
        "totalCount": true
    };

    const result = await client.record.getRecords(request_body);
    if (result.totalCount === "0") {
        return null;
    } else {
        return result.records[0][commonRecordId]["value"];
    }
};

const splitList = async (list) => {
    // 既存データのリストと、新規データのリストに分割する
    const exists = [];
    const new_orderers = [];
    for (const orderer of list) {
        if (await orderer.exists()) {
            exists.push(orderer);
        } else {
            new_orderers.push(orderer);
        }
    }

    return {
        exists: exists,
        new_orderers: new_orderers
    };
};

export const downloadUpdateCsv = async (list) => {
    const header_row = [
        commonRecordIdDisplay,
        fielddspCreditFacility_CONSTRUCTOR,
        fielddspCostDisplay_CONSTRUCTOR,
        fielddspCostDecimal_CONSTRUCTOR
    ].join(",");

    const csv_rows = list.map((orderer) => getUpdateRow(orderer));
    // CSV文字列それぞれをCRLFで結合し、最終行の最後にもCRLFを追加
    const rows_result = await Promise.all(csv_rows);
    const data = [header_row, ...rows_result];
    const csv_text = `${data.join("\r\n")}\r\n`;
    const sjis_text = encodeToSjis(csv_text);
    const file_name = "Workship企業データ(工務店マスタ上書き用).csv";
    downloadFile(sjis_text, file_name);
};

const getUpdateRow = async (orderer) => {
    // 仕様 https://takadaid.backlog.com/view/LAGLESS-205
    const fields = [];

    fields.push((await orderer.record())[commonRecordId]["value"]);
    fields.push(orderer.credit_facility);
    fields.push(`${orderer.commission_rate}%`);
    fields.push(orderer.commission_rate * 0.01);

    return fields.join(",");
};

export const downloadInsertCsv = async (list) => {
    const header_row = [
        fielddspConstructorId_CONSTRUCTOR,
        fielddspConstructorName_CONSTRUCTOR,
        fielddspConstructorNameAlias_CONSTRUCTOR,
        fielddspCustomerCode_CONSTRUCTOR,
        fielddspCeoTitle_CONSTRUCTOR,
        fielddspCeo_CONSTRUCTOR,
        fielddspAccount_CONSTRUCTOR,
        fielddspProductName_CONSTRUCTOR,
        fielddspOriginalPays_CONSTRUCTOR,
        fielddspCostDisplay_CONSTRUCTOR,
        fielddspCostDecimal_CONSTRUCTOR,
        fielddspTransferFee_CONSTRUCTOR,
        fielddspTransferFeeDecimal_CONSTRUCTOR,
        fielddspMail_CONSTRUCTOR,
        fielddspClosing_CONSTRUCTOR,
        fielddspOriginalPayDate_CONSTRUCTOR,
        fielddspLag_CONSTRUCTOR,
        fielddspDeadline_CONSTRUCTOR,
        fielddspEarlyPay_CONSTRUCTOR,
        fielddspEffect_CONSTRUCTOR,
        fielddspHandleHoliday_CONSTRUCTOR,
        fielddspCreditFacility_CONSTRUCTOR,
    ].join(",");

    // 新規レコードの工務店IDを決める。既存レコードのうち、500番台の連番。
    // 599まで埋まっている場合は5001からリスタート
    const latest_id = await getLatestGigConstructorId();

    const csv_rows = list.map(async (orderer, i) => {
        const customer_code = await getCustomerCode(orderer.name);
        return getInsertRow(orderer, latest_id + (i+1), customer_code);
    });
    // CSV文字列それぞれをCRLFで結合し、最終行の最後にもCRLFを追加
    const rows_result = await Promise.all(csv_rows);
    const data = [header_row, ...rows_result];
    const csv_text = `${data.join("\r\n")}\r\n`;
    const sjis_text = encodeToSjis(csv_text);
    const file_name = "Workship企業データ(工務店マスタ追加用).csv";
    downloadFile(sjis_text, file_name);
};

const getInsertRow = (orderer, id, customer_code) => {
    // 仕様 https://takadaid.backlog.com/view/LAGLESS-205
    const fields = [];

    fields.push(id);
    fields.push(orderer.name);
    fields.push(orderer.name);
    fields.push(customer_code);
    fields.push("代表取締役");
    fields.push("岩上貴洋");
    fields.push("ID");
    fields.push("Workship前払い");
    fields.push("工務店");
    const rate_txt = orderer.commission_rate ? `${orderer.commission_rate}%` : "";
    fields.push(rate_txt);
    const rate_decimal = orderer.commission_rate ? orderer.commission_rate * 0.01 : 0;
    fields.push(rate_decimal);
    fields.push("275円（税込）");
    fields.push(250);
    fields.push("factoring@goworkship.com");
    fields.push("末日");
    fields.push("翌月末");
    fields.push("30日");
    fields.push("(不定)");
    fields.push("(不定)");
    fields.push("(不定)");
    fields.push("前営業日");
    const credit = orderer.credit_facility ? orderer.credit_facility : 0;
    fields.push(credit);

    return fields.join(",");
};
