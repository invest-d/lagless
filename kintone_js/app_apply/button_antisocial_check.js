/*
    Version 1
    WFIの申込レコードに限り、反社チェックのオペレーションを補佐する。
*/

"use strict";

import { getApplyAppSchema, getCompanyAppSchema } from "../util/environments";
import { schema_79 } from "../79/schema";
import { CLIENT } from "../util/kintoneAPI";
import {
    createExamRecord, getExaminator
} from "./antisocialCheck/createExam";
import {
    getFullAddress,
    getOrCreateCompanyId,
    searchCompanyRecord,
    getPayerCompanyId,
} from "./antisocialCheck/fetchCompany";
import { addToukiRecord, buildToukiRecord } from "./antisocialCheck/fetchTouki";
import {
    createTask
} from "./antisocialCheck/generateTask";
import {
    getSearchQuery
} from "./antisocialCheck/testableLogics";

// import { schema_apply } from "../161/schema";
const schema_apply = getApplyAppSchema(kintone.app.getId());
if (!schema_apply) throw new Error();
const applyApp = {
    fields: {
        applicantName: schema_apply.fields.properties.company.code,
        representative: schema_apply.fields.properties.representative.code,
        phone: schema_apply.fields.properties.phone.code,
        email: schema_apply.fields.properties.mail.code,
    }
};

// import { schema_28 } from "../28/schema";
const schema_28 = getCompanyAppSchema(kintone.app.getId());
if (!schema_28) throw new Error();
const companyApp = {
    fields: {
        corpNum: schema_28.fields.properties.法人番号.code,
    }
};

// const boxUrl_EXAM               = schema_79.fields.properties.boxのURL.code;

const ExtensibleCustomError = require("extensible-custom-error");
class ManualAbortProcessError extends ExtensibleCustomError { }


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

const buttonId = "checkAntisocial";
const buttonTitle = "反社チェックを開始";
const needShowButton = () => {
    const existsSameButton = document.getElementById(buttonId) !== null;
    return !existsSameButton;
};

const createButton = (record) => {
    const button = document.createElement("button");
    button.id = buttonId;
    button.innerText = buttonTitle;
    button.addEventListener("click", clickButton.bind(null, record));
    return button;
};

const confirmBeforeExec = () => {
    const message = "このレコードについて、反社チェックを開始しますか？"
        + "\n※開始する前に、免許証情報の目視確認を済ませてください";
    return window.confirm(message);
};

const clickButton = async (applyRecord) => {
    if (!confirmBeforeExec()) {
        alert("処理は中断されました。");
        return;
    }

    alert("処理途中でページを更新したり、別のタブを開いたりしないように注意してください。");
    document.getElementById(buttonId).innerText = "処理中...";

    try {
        alert(`${schema_28.id.name}アプリにレコードが既に存在するか確認します。`);
        const companyRecord = await searchCompanyRecord(getSearchQuery({
            name: applyRecord[applyApp.fields.applicantName]["value"],
            representative: applyRecord[applyApp.fields.representative]["value"],
            phone: applyRecord[applyApp.fields.phone]["value"],
            email: applyRecord[applyApp.fields.email]["value"],
            address: getFullAddress(applyRecord),
        }));
        console.log(`${schema_28.id.name}アプリの取得を完了。`);

        const companyId = await getOrCreateCompanyId(companyRecord, applyRecord);
        if (!companyId) { throw new ManualAbortProcessError(); }

        alert(`${schema_28.id.name}アプリのレコード番号${companyId}で反社チェックを進めます。`);
        console.log(`使用する${schema_28.id.name}アプリのレコード番号: ${companyId}を取得完了。`);

        // 反社チェックの経過を記録するための審査レコードを作成する。
        // が、その前にboxへの運転免許証画像ファイルの保存処理がある。
        // const box_URL = await saveDriverLicense(apply_record);

        const examinator = getExaminator();
        if (!examinator) { throw new ManualAbortProcessError(); }

        console.log(`審査担当者: ${examinator}を取得完了。`);

        const company = await CLIENT.record.getRecord({ app: schema_28.id.appId, id: companyId });
        const payerCompanyId = await getPayerCompanyId(applyRecord);
        if (!payerCompanyId) { throw new ManualAbortProcessError(); }
        const examId = await createExamRecord(company.record, examinator, payerCompanyId);
        if (!examId) { throw new ManualAbortProcessError(); }

        alert(`審査レコード: ${examId}を新規作成しました。`
            + "\n運転免許証をboxにアップロードして、そのフォルダのURLを審査レコードに保存する操作は手動で行ってください。");
        console.log(`審査レコード: ${examId}を作成完了。`);

        const isCorporate = Boolean(company.record[companyApp.fields.corpNum].value);
        if (isCorporate) {
            alert("法人企業のため、登記情報を取得します。");
            const exam = await CLIENT.record.getRecord({ app: schema_79.id.appId, id: examId });
            const newToukiRecord = buildToukiRecord(company.record, exam.record);
            const toukiId = await addToukiRecord(newToukiRecord);
            if (!toukiId) { throw new ManualAbortProcessError(); }
            alert("登記情報取得タスクをシステムに登録しました。\n"
                + "完了後、チャットアプリにて通知します。");
        }

        alert("審査レコードから記事取得タスクを生成します。");
        const taskId = await createTask(examId, company.record, examinator);
        if (!taskId) { throw new ManualAbortProcessError(); }

        alert(`記事取得タスク: ${taskId}の作成が完了しました。`
            + "記事の検索処理が完了するまでしばらくお待ちください。");
        console.log(`記事取得タスク: ${taskId}を作成完了。`);

        const examPage = `https://investdesign.cybozu.com/k/${schema_79.id.appId}/show#record=${examId}`;
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
        document.getElementById(buttonId).innerText = buttonTitle;
    }
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
