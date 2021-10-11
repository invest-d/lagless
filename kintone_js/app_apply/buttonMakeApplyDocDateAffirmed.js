/**
 * Version 1
 * ファクタリングの申込に関連して、
 * 公証人による確定日付の取得を済ませた申込レコードを一括で更新する
 */
"use strict";

// import { schema_apply as applyAppSchema } from "../161/schema";
import { CLIENT } from "../util/kintoneAPI";
import { confirmBeforeExec, getBody, putBody } from "./makeApplyDocDateAffirmed/logic";
import { getApplyAppSchema, UnknownAppError } from "../util/choiceApplyAppSchema";
const applyAppSchema = (() => {
    try {
        return getApplyAppSchema(kintone.app.getId());
    } catch (e) {
        if (e instanceof UnknownAppError) {
            alert("不明なアプリです。申込アプリで実行してください。");
        } else {
            console.error(e);
            const additional_info = e.message ?? JSON.stringify(e);
            alert("途中で処理に失敗しました。システム管理者に連絡してください。"
                + "\n追加の情報: "
                + `\n${additional_info}`);
        }
    }
})();
if (!applyAppSchema) throw new Error();
const ExtensibleCustomError = require("extensible-custom-error");
class FailedGetTargetsError extends ExtensibleCustomError { }
class FailedPutTargetsError extends ExtensibleCustomError { }


const applyApp = {
    id: applyAppSchema.id.appId,
    fields: {
        id: applyAppSchema.fields.properties.レコード番号.code,
        transferStatus: {
            code: applyAppSchema.fields.properties.transferStatus.code,
            target: applyAppSchema.fields.properties.transferStatus.options.承認済.label,
        },
        affirmationStatus: {
            code: applyAppSchema.fields.properties.docDateAffirmationStatus.code,
            newStatus: applyAppSchema.fields.properties.docDateAffirmationStatus.options.取得済.label,
        },
    },
};

(function () {
    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.index.show", (event) => {
        if (!needShowButton()) return;
        kintone.app.getHeaderMenuSpaceElement().appendChild(createButton());
    });
})();

const buttonId = "makeApplyDocDateAffirmed";
const buttonTitle = "確定日付取得済みに一括更新";

const needShowButton = () => {
    // ボタンが重複していない
    return document.getElementById(buttonId) === null;
};

const createButton = () => {
    const button = document.createElement("button");
    button.id = buttonId;
    button.innerText = buttonTitle;
    button.addEventListener("click", clickButton);
    return button;
};

const clickButton = async () => {
    const button = document.getElementById(buttonId);
    button.innerText = "処理中...";

    try {
        await main();
    } catch (e) {
        console.error(e);
        alert("処理中にエラーが発生しました。"
            + "F12キーを押してエラー内容を表示し、"
            + "操作内容とエラー内容をシステム管理者に連絡してください。");
    } finally {
        alert("処理を終了します。");
        button.innerText = buttonTitle;
    }
};

const main = async () => {
    const targetRecords = await CLIENT.record.getAllRecords(getBody({
        app: applyApp.id,
        statusFieldCode: applyApp.fields.transferStatus.code,
        targetStatus: applyApp.fields.transferStatus.target,
    })).catch((e) => {
        const message = "対象レコードの取得中にエラーが発生しました。";
        throw new FailedGetTargetsError(message, e);
    });

    if (!confirmBeforeExec({
        targetNum: targetRecords.length,
        targetState: applyApp.fields.transferStatus.target,
        newState: applyApp.fields.affirmationStatus.newStatus,
    })) {
        alert("処理を中断しました。");
        return;
    }

    const result = await CLIENT.record.updateAllRecords(putBody({
        app: applyApp.id,
        targetRecords,
        idFieldCode: applyApp.fields.id,
        statusFieldCode: applyApp.fields.affirmationStatus.code,
        newStatusValue: applyApp.fields.affirmationStatus.newStatus,
    })).catch((e) => {
        const message = "対象レコードの更新中にエラーが発生しました。";
        throw new FailedPutTargetsError(message, e);
    });

    alert(`${result.records.length}件のレコードについて、`
        + `電子確定日付を${applyApp.fields.affirmationStatus.newStatus}に更新しました。`);
};
