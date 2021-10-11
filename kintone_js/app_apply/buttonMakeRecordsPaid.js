/**
 * Version 1
 * WFI案件のレコードに限り、申込アプリのレコードの状態を実行済みに更新する
 */
"use strict";

// import { schema_apply as applyAppSchema } from "../161/schema";
import { CLIENT } from "../util/kintoneAPI";
import { confirmBeforeExec, getBody, putBody } from "./makeRecordsPaid/logic";
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
        status: {
            code: applyAppSchema.fields.properties.状態.code,
            olds: [
                applyAppSchema.fields.properties.状態.options.支払予定明細送付済.label,
                applyAppSchema.fields.properties.状態.options.振込データ出力済.label,
            ],
            new: applyAppSchema.fields.properties.状態.options.実行完了.label,
        },
        constructorId: applyAppSchema.fields.properties.constructionShopId.code,
    },
};

(function () {
    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.index.show", (event) => {
        if (!needShowButton()) return;
        kintone.app.getHeaderMenuSpaceElement().appendChild(createButton());
    });
})();

const buttonId = "makeAllRecordsPaid";
const buttonTitle = "(WFIのみ)レコードを実行完了に一括更新";

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
        statusFieldCode: applyApp.fields.status.code,
        targetStatuses: applyApp.fields.status.olds,
        constructorIdFieldCode: applyApp.fields.constructorId,
    })).catch((e) => {
        const message = "対象レコードの取得中にエラーが発生しました。";
        throw new FailedGetTargetsError(message, e);
    });

    if (!confirmBeforeExec({
        targetNum: targetRecords.length,
        targetState: applyApp.fields.status.olds.join(", "),
        newState: applyApp.fields.status.new,
    })) {
        alert("処理を中断しました。");
        return;
    }

    const result = await CLIENT.record.updateAllRecords(putBody({
        app: applyApp.id,
        targetRecords,
        idFieldCode: applyApp.fields.id,
        statusFieldCode: applyApp.fields.status.code,
        newStatusValue: applyApp.fields.status.new,
    })).catch((e) => {
        const message = "対象レコードの更新中にエラーが発生しました。";
        throw new FailedPutTargetsError(message, e);
    });

    alert(`${result.records.length}件のレコードについて、`
        + `状態を${applyApp.fields.status.new}に更新しました。`);
};
