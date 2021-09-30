"use strict";

import { CLIENT } from "../../util/kintoneAPI";

import { schema_28 } from "../../28/schema";
const recordNo_COMPANY              = schema_28.fields.properties.レコード番号.code;
const companyName_COMPANY           = schema_28.fields.properties["法人名・屋号"].code;
const representative_COMPANY        = schema_28.fields.properties.代表者名.code;

import { schema_65 } from "../../65/schema";
const examId_TASK               = schema_65.fields.properties.作成中_審査Ver2.code;
const companyName_TASK          = schema_65.fields.properties["法人名・屋号"].code;
const companyId_TASK            = schema_65.fields.properties.取引企業管理_No.code;
const searchType_TASK           = schema_65.fields.properties.検索ワード種別.code;
const typeRepresentative_TASK   = schema_65.fields.properties.検索ワード種別.options.代表者氏名.label;
const searchValue_TASK          = schema_65.fields.properties.検索ワード.code;
const concluder_TASK            = schema_65.fields.properties.確認者.code;
// FIXME: もっといい感じに定義したい
const concluders_by_user = {
    "sawada@invest-d.com": "澤田友里",
    "takahashi@invest-d.com": "髙橋望",
    "inomata@invest-d.com": "猪俣和貴",
    "imura@invest-d.com": "井村一也",
};

export const createTask = async (exam_id, company_record, user) => {
    const search_value = company_record[representative_COMPANY]["value"]
        ? company_record[representative_COMPANY]["value"]
        : company_record[companyName_COMPANY]["value"];
    const new_record = {
        [examId_TASK]: exam_id,
        [companyName_TASK]: company_record[companyName_COMPANY]["value"],
        [companyId_TASK]: company_record[recordNo_COMPANY]["value"],
        [searchType_TASK]: typeRepresentative_TASK,
        [searchValue_TASK]: search_value,
        [concluder_TASK]: [concluders_by_user[user]],
    };
    Object.keys(new_record).forEach((k) => new_record[k] = { value: new_record[k] });
    const body = {
        app: schema_65.id.appId,
        record: new_record
    };
    const result = await CLIENT.record.addRecord(body);
    return result.id;
};
