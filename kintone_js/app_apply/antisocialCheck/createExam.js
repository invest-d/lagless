"use strict";

import { CLIENT } from "../../util/kintoneAPI";
import { getCompanyAppSchema } from "../../util/environments";
// import { schema_28 } from "../../28/schema";
const schema_28 = getCompanyAppSchema(kintone.app.getId());
if (!schema_28) throw new Error();
const recordNo_COMPANY              = schema_28.fields.properties.レコード番号.code;
const companyName_COMPANY           = schema_28.fields.properties["法人名・屋号"].code;
const representativeTitle_COMPANY   = schema_28.fields.properties.代表者名_役職.code;
const representativeMemo_COMPANY    = schema_28.fields.properties.代表者備考.code;
const toukiGetId_COMPANY            = schema_28.fields.properties.登記情報取得_No_.code;
const companyNameAuto_COMPANY       = schema_28.fields.properties["法人名・屋号_HubSpotより"].code;
const companyNumber_COMPANY         = schema_28.fields.properties.法人番号.code;

import { schema_79 } from "../../79/schema";
const selectableUserIds_EXAM    = schema_79.fields.properties.審査担当者_作成者.entities.map((e) => e.code);
const companyId_EXAM            = schema_79.fields.properties.取引企業管理No_審査対象企業.code;
const companyName_EXAM          = schema_79.fields.properties["法人名・屋号"].code;
const representativeTitle_EXAM  = schema_79.fields.properties.代表者役職.code;
const representativeMemo_EXAM   = schema_28.fields.properties.代表者備考.code;
const toukiGetId_EXAM           = schema_79.fields.properties.登記情報取得No_.code;
const companyNameAuto_EXAM      = schema_79.fields.properties.取得した企業名＿HubSpotの場合.code;
const companyNumber_EXAM        = schema_79.fields.properties.法人番号.code;
const examinator_EXAM           = schema_79.fields.properties.審査担当者_作成者.code;
const businessType_EXAM         = schema_79.fields.properties.取引区分.code;
const typeGiver_EXAM            = schema_79.fields.properties.取引区分.options.譲渡企業.label;
const payerCompany_EXAM         = schema_79.fields.properties.取引企業管理_No_支払企業2.code;
const examType_EXAM             = schema_79.fields.properties.審査種類.code;
const typePreExam_EXAM          = schema_79.fields.properties.審査種類.options.事前審査.label;
const examOrderer_EXAM          = schema_79.fields.properties.審査依頼者.code;
const ordererLagless_EXAM       = schema_79.fields.properties.審査依頼者.options.ラグレス関係の申込フォーム.label;
const examPurpose_EXAM          = schema_79.fields.properties.審査目的.code;
const purposeGiver_EXAM         = schema_79.fields.properties.審査目的.options["LagLess譲渡企業(協力会社等)"].label;
const examConclusion_EXAM       = schema_79.fields.properties.意見_審査担当者.code;
const conclusionUnexam_EXAM     = schema_79.fields.properties.意見_審査担当者.options.審査待ち.label;
const toukiIntegrity_EXAM       = schema_79.fields.properties.取得情報と登記情報の一致確認.code;
const toukiNone_EXAM            = schema_79.fields.properties.取得情報と登記情報の一致確認.options["登記無し(個人事業主)"].label;
const toukiPending_EXAM         = schema_79.fields.properties.取得情報と登記情報の一致確認.options.確認中.label;
const examineeSource_EXAM       = schema_79.fields.properties.取得経路.code;
const sourceForm_EXAM           = schema_79.fields.properties.取得経路.options["早払い・遅払い申込フォーム（協力会社）"].label;
const telStatus_EXAM            = schema_79.fields.properties.架電状況_1回目.code;
const telNotNeed_EXAM           = schema_79.fields.properties.架電状況_1回目.options.架電不要先.label;
// const boxUrl_EXAM               = schema_79.fields.properties.boxのURL.code;

export const getExaminator = () => {
    let message = `${schema_79.id.name}アプリに新規レコードを作成します。`
        + "\n審査担当者のIDを入力してください"
        + `\n選択可能なID: ${selectableUserIds_EXAM.map((i) => i.replace("@invest-d.com", "")).join(", ")}`;
    let user = prompt(message);
    // promptでキャンセルするとnull、入力なしでOKすると空文字列を返す
    if (user === null) {
        return null;
    }

    let userid = `${user}@invest-d.com`;
    while (!selectableUserIds_EXAM.includes(userid)) {
        message = `選択可能なIDではありません: ${user} もう一度入力してください。`
            + `\n選択可能なID: ${selectableUserIds_EXAM.map((i) => i.replace("@invest-d.com", "")).join(", ")}`;
        user = prompt(message);
        if (user === null) {
            return null;
        }
        userid = `${user}@invest-d.com`;
    }
    return userid;
};

export const createExamRecord = async (company_record, examinator, payerCompanyId) => {
    const new_record = {
        [companyId_EXAM]: company_record[recordNo_COMPANY]["value"],
        [companyName_EXAM]: company_record[companyName_COMPANY]["value"],
        [representativeTitle_EXAM]: company_record[representativeTitle_COMPANY]["value"],
        [representativeMemo_EXAM]: company_record[representativeMemo_COMPANY]["value"],
        [toukiGetId_EXAM]: company_record[toukiGetId_COMPANY]["value"],
        [companyNameAuto_EXAM]: company_record[companyNameAuto_COMPANY]["value"],
        [companyNumber_EXAM]: company_record[companyNumber_COMPANY]["value"],
        [examinator_EXAM]: [{ code: examinator }],
        [businessType_EXAM]: [typeGiver_EXAM],
        // [boxUrl_EXAM]: box_URL,
        [payerCompany_EXAM]: payerCompanyId,
        [examType_EXAM]: typePreExam_EXAM,
        [examOrderer_EXAM]: ordererLagless_EXAM,
        [examPurpose_EXAM]: purposeGiver_EXAM,
        [examConclusion_EXAM]: conclusionUnexam_EXAM,
        [toukiIntegrity_EXAM]: [toukiNone_EXAM],
        [examineeSource_EXAM]: [sourceForm_EXAM],
        [telStatus_EXAM]: [telNotNeed_EXAM],
    };
    if (company_record[companyNumber_COMPANY]["value"]) {
        new_record[toukiIntegrity_EXAM] = [toukiPending_EXAM];
        alert("申込内容と登記情報の一致を確認した後、審査アプリの「取得情報と登記情報の一致確認」を更新してください。");
    }
    Object.keys(new_record).forEach((k) => new_record[k] = { value: new_record[k] });
    const body = {
        app: schema_79.id.appId,
        record: new_record
    };
    const result = await CLIENT.record.addRecord(body);
    return result.id;
};
