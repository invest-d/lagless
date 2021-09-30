/*
    Version 1
    WFIの申込レコードに限り、反社チェックのオペレーションを補佐する。
*/

"use strict";

import { schema_apply } from "../161/schema";
const applicantName_APPLY           = schema_apply.fields.properties.company.code;
const applicantRepresentative_APPLY = schema_apply.fields.properties.representative.code;
const applicantPhone_APPLY          = schema_apply.fields.properties.phone.code;
const applicantEmail_APPLY          = schema_apply.fields.properties.mail.code;
const applicantPref_APPLY           = schema_apply.fields.properties.prefecture.code;
const applicantAddr_APPLY           = schema_apply.fields.properties.address.code;
const applicantSt_APPLY             = schema_apply.fields.properties.streetAddress.code;
const applicantZipcode_APPLY        = schema_apply.fields.properties.postalCode.code;

import { schema_28 } from "../28/schema";
const recordNo_COMPANY              = schema_28.fields.properties.レコード番号.code;
const companyName_COMPANY           = schema_28.fields.properties["法人名・屋号"].code;
const representativeTitle_COMPANY   = schema_28.fields.properties.代表者名_役職.code;
const representative_COMPANY        = schema_28.fields.properties.代表者名.code;
const phoneNumber_COMPANY           = schema_28.fields.properties.TEL_本店.code;
const email_COMPANY                 = schema_28.fields.properties.メールアドレス_会社.code;
const address_COMPANY               = schema_28.fields.properties.住所_本店.code;
const addressAuto_COMPANY           = schema_28.fields.properties.住所_HubSpotより.code;
const businessType_COMPANY          = schema_28.fields.properties.取引区分.code;
const type_pay_COMPANY              = schema_28.fields.properties.取引区分.options.支払企業.label;
const companyType_COMPANY           = schema_28.fields.properties.企業形態.code;
const type_person_COMPANY           = schema_28.fields.properties.企業形態.options.個人企業.label;
const zipcodeNormal_COMPANY         = schema_28.fields.properties.郵便番号_本店.code;
const zipcodeAuto_COMPANY           = schema_28.fields.properties.郵便番号_HubSpotより.code;
const representativeMemo_COMPANY    = schema_28.fields.properties.代表者備考.code;
const toukiGetId_COMPANY            = schema_28.fields.properties.登記情報取得_No_.code;
const companyNameAuto_COMPANY       = schema_28.fields.properties["法人名・屋号_HubSpotより"].code;
const companyNumber_COMPANY         = schema_28.fields.properties.法人番号.code;

import { schema_79 } from "../79/schema";
const companyId_EXAM            = schema_79.fields.properties.取引企業管理No_審査対象企業.code;
const companyName_EXAM          = schema_79.fields.properties["法人名・屋号"].code;
const representativeTitle_EXAM  = schema_79.fields.properties.代表者役職.code;
const representativeMemo_EXAM   = schema_28.fields.properties.代表者備考.code;
const toukiGetId_EXAM           = schema_79.fields.properties.登記情報取得No_.code;
const companyNameAuto_EXAM      = schema_79.fields.properties.取得した企業名＿HubSpotの場合.code;
const companyNumber_EXAM        = schema_79.fields.properties.法人番号.code;
const selectableUserIds_EXAM    = schema_79.fields.properties.審査担当者_作成者.entities.map((e) => e.code);
const examinator_EXAM           = schema_79.fields.properties.審査担当者_作成者.code;
const businessType_EXAM         = schema_79.fields.properties.取引区分.code;
const typeGiver_EXAM            = schema_79.fields.properties.取引区分.options.譲渡企業.label;
const payerCompany_EXAM         = schema_79.fields.properties.取引企業管理_No_支払企業2.code;
const WFI_COMPANY_ID            = "4736";
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
const examineeSource_EXAM       = schema_79.fields.properties.取得経路.code;
const sourceForm_EXAM           = schema_79.fields.properties.取得経路.options["早払い・遅払い申込フォーム（協力会社）"].label;
const telStatus_EXAM            = schema_79.fields.properties.架電状況_1回目.code;
const telNotNeed_EXAM           = schema_79.fields.properties.架電状況_1回目.options.架電不要先.label;
// const boxUrl_EXAM               = schema_79.fields.properties.boxのURL.code;

import { schema_65 } from "../65/schema";
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

const ExtensibleCustomError = require("extensible-custom-error");
class ManualAbortProcessError extends ExtensibleCustomError { }

import { CLIENT } from "../util/kintoneAPI";
import { replaceFullWidthNumbers } from "../util/manipulations";

// box保存。 https://github.com/allenmichael/box-javascript-sdk を使用。カスタマイズjsとして `BoxSdk.min.js` の存在を前提にする
// const box = new BoxSdk();
// import { schema_61 } from "../61/schema";
// const BOX_IDENTIFY_RECORD = 84;
// const developer_token_ID = schema_61.fields.properties.ユーザー名.code;
// const client_id_ID = schema_61.fields.properties.ID.code;
// const client_secret_ID = schema_61.fields.properties.パスワード.code;

// const client = new box.BasicBoxClient({accessToken: "1234554321"});

(function () {
    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.detail.show", (event) => {
        if (needShowButton()) {
            kintone.app.record.getHeaderMenuSpaceElement().appendChild(createButton(event.record));
        }
    });
})();

const button_id = "checkUnsocial";
const button_title = "反社チェックを開始";
const needShowButton = () => {
    const exists_same_button = document.getElementById(button_id) !== null;
    return !exists_same_button;
};

const createButton = (record) => {
    const button = document.createElement("button");
    button.id = button_id;
    button.innerText = button_title;
    button.addEventListener("click", clickButton.bind(null, record));
    return button;
};

const clickButton = async (apply_record) => {
    if (!confirmBeforeExec()) {
        alert("処理は中断されました。");
        return;
    }

    alert("処理途中でページを更新したり、別のタブを開いたりしないように注意してください。");
    document.getElementById(button_id).innerText = "処理中...";

    try {
        alert(`${schema_28.id.name}アプリにレコードが既に存在するか確認します。`);
        const company_record = await searchCompanyRecord(getSearchQuery(apply_record));
        console.log(`${schema_28.id.name}アプリの取得を完了。`);

        const company_id = await getOrCreateCompanyId(company_record, apply_record);
        if (!company_id) { throw new ManualAbortProcessError(); }

        alert(`${schema_28.id.name}アプリのレコード番号${company_id}で反社チェックを進めます。`);
        console.log(`使用する${schema_28.id.name}アプリのレコード番号: ${company_id}を取得完了。`);

        // 反社チェックの経過を記録するための審査レコードを作成する。
        // が、その前にboxへの運転免許証画像ファイルの保存処理がある。
        // const box_URL = await saveDriverLicense(apply_record);

        const examinator = getExaminator();
        if (!examinator) { throw new ManualAbortProcessError(); }

        console.log(`審査担当者: ${examinator}を取得完了。`);

        const company = await CLIENT.record.getRecord({ app: schema_28.id.appId, id: company_id });
        const exam_id = await createExamRecord(company.record, examinator);
        if (!exam_id) { throw new ManualAbortProcessError(); }

        alert(`審査レコード: ${exam_id}を新規作成しました。`
            + "\n運転免許証をboxにアップロードして、そのフォルダのURLを審査レコードに保存する操作は手動で行ってください。");
        console.log(`審査レコード: ${exam_id}を作成完了。`);

        alert("審査レコードから記事取得タスクを生成します。");
        const task_id = await createTask(exam_id, company.record, examinator);
        if (!task_id) { throw new ManualAbortProcessError(); }

        alert(`記事取得タスク: ${task_id}の作成が完了しました。`
            + "記事の検索処理が完了するまでしばらくお待ちください。");
        console.log(`記事取得タスク: ${task_id}を作成完了。`);

        const examPage = `https://investdesign.cybozu.com/k/${schema_79.id.appId}/show#record=${exam_id}`;
        alert("作成した審査レコードのページに移動します。");
        window.location.href = examPage;
    } catch (e) {
        if (e instanceof ManualAbortProcessError) {
            alert("処理を中断しました");
        } else {
            console.error(e);
            alert("途中で処理に失敗しました。システム管理者に連絡してください。"
                + "\n追加の情報: "
                + `\n${JSON.stringify(e)}`);
        }
    } finally {
        alert("処理を終了します。");
        document.getElementById(button_id).innerText = button_title;
    }
};

const confirmBeforeExec = () => {
    const before_process = "このレコードについて、反社チェックを開始しますか？"
        + "\n※開始する前に、免許証情報の目視確認を済ませてください";
    return window.confirm(before_process);
};

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

const getOrCreateCompanyId = async (company_record, apply_record) => {
    if (company_record && company_record.records.length) {
        return selectCompanyRecordNumber(company_record);
    } else {
        alert("レコードが見つからなかったため、新規作成します。");
        return await createCompanyRecord(apply_record);
    }
};

export const selectCompanyRecordNumber = (get_result) => {
    // get_resultが存在する場合。nullもしくは数値のレコード番号を返す
    const returnAsNumber = (input) => Number(replaceFullWidthNumbers(input));
    const recordRepr = (record) => `レコード番号: ${record[recordNo_COMPANY]["value"]}, 会社名: ${record[companyName_COMPANY]["value"]}, 所在地: ${record[address_COMPANY]["value"]}`;

    if (get_result.records.length === 1) {
        const num = get_result.records[0][recordNo_COMPANY]["value"];
        const message = `レコードが見つかりました。\n${recordRepr(get_result.records[0])}`
            + "\nこのレコードを使って進めますか？";
        if (confirm(message)) {
            return Number(num);
        } else {
            const input = prompt("使用するレコード番号を手入力してください");
            if (input) return returnAsNumber(input);
            return null;
        }
    } else {
        const message = `複数のレコードが見つかりました。${get_result.records.map((r) => recordRepr(r)).join("\n")}`
            + "\nどのレコード番号で進めますか？";
        const input = prompt(message);
        if (input) return returnAsNumber(input);
        return null;
    }
};

const createCompanyRecord = async (apply) => {
    const address = `${apply[applicantPref_APPLY]["value"]}${apply[applicantAddr_APPLY]["value"]}${apply[applicantSt_APPLY]["value"]}`;
    const new_record = {
        [companyName_COMPANY]: apply[applicantName_APPLY]["value"],
        [businessType_COMPANY]: [type_pay_COMPANY],
        [companyType_COMPANY]: type_person_COMPANY,
        [representative_COMPANY]: apply[applicantRepresentative_APPLY]["value"],
        [zipcodeNormal_COMPANY]: apply[applicantZipcode_APPLY]["value"],
        [zipcodeAuto_COMPANY]: apply[applicantZipcode_APPLY]["value"],
        [address_COMPANY]: address,
        [addressAuto_COMPANY]: address,
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

const getExaminator = () => {
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

// TODO: 運転免許証のファイルをboxに保存する処理もやりたいけど、box APIの仕様が難しくて頓挫してる
// const saveDriverLicense = async (apply_record) => {
//     const identify = await (async () => {
//         const body = {
//             app: schema_61.id.appId,
//             id: BOX_IDENTIFY_RECORD
//         };
//         const result = await CLIENT.record.getRecord(body);
//         return {
//             developer_token: result.record[developer_token_ID]["value"],
//             client_id: result.record[client_id_ID]["value"],
//             client_secret: result.record[client_secret_ID]["value"],
//         };
//     })();

//     const access_token = await (async () => {
//         const ENDPOINT = "https://api.box.com/oauth2/token/";
//         const CONTENT_TYPE = "application/x-www-form-urlencoded";
//         const body = {
//             code:
//         }
//         const CLIENT_ID = identify.client_id;
//         const CLIENT_SECRET = identify.client_secret;

//     })();

// };

const createExamRecord = async (company_record, examinator) => {
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
        [payerCompany_EXAM]: WFI_COMPANY_ID,
        [examType_EXAM]: typePreExam_EXAM,
        [examOrderer_EXAM]: ordererLagless_EXAM,
        [examPurpose_EXAM]: purposeGiver_EXAM,
        [examConclusion_EXAM]: conclusionUnexam_EXAM,
        [toukiIntegrity_EXAM]: [toukiNone_EXAM],
        [examineeSource_EXAM]: [sourceForm_EXAM],
        [telStatus_EXAM]: [telNotNeed_EXAM],
    };
    Object.keys(new_record).forEach((k) => new_record[k] = { value: new_record[k] });
    const body = {
        app: schema_79.id.appId,
        record: new_record
    };
    const result = await CLIENT.record.addRecord(body);
    return result.id;
};

const createTask = async (exam_id, company_record, user) => {
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
