/*
    Version 1
    支払予定明細送信済みのレコードを全て振込前確認完了に更新する
*/

import { CLIENT } from "../util/kintoneAPI";
const ExtensibleCustomError = require("extensible-custom-error");
class CheckReadyToPayError extends ExtensibleCustomError {}

import { getApplyAppSchema } from "../util/environments";
// import { schema_apply } from "../161/schema";
const schema_apply = getApplyAppSchema(kintone.app.getId());
if (!schema_apply) throw new Error();
const executable_view_name  = schema_apply.views.views.支払予定明細送信状況.name;
const target_status         = schema_apply.fields.properties.状態.options.支払予定明細送付済.label;
const new_status            = schema_apply.fields.properties.状態.options.振込前確認完了.label;
const status_field          = schema_apply.fields.properties.状態.code;
const record_id_field       = schema_apply.fields.properties.レコード番号.code;

(function() {
    "use strict";

    kintone.events.on("app.record.index.show", (event) => {
        if (!needShowButton(event.viewName)) return;
        kintone.app.getHeaderMenuSpaceElement().appendChild(createButton());
    });
})();

const button_name = "makeRecordsReadyToPay";
const button_title = "支払明細送信済を一括振込確認完了";

const needShowButton = (view_name) => {
    // 特定の一覧を選択している&&ボタンが重複していない
    return (view_name === executable_view_name)
        && (document.getElementById(button_name) === null);
};

const createButton = () => {
    const button = document.createElement("button");
    button.id = button_name;
    button.innerText = button_title;
    button.addEventListener("click", clickButton);
    return button;
};

const clickButton = async () => {
    if (!confirmBeforeExec()) {
        alert("処理を中断しました。");
        return;
    }

    const button = document.getElementById(button_name);
    button.innerText = "処理中...";

    try {
        const target_records = await getCheckingPayRecords()
            .catch((e) => {
                throw new CheckReadyToPayError("レコードの取得中にエラーが発生しました。", e);
            });
        if (target_records.length === 0) {
            alert("対象となるレコードはありませんでした。");
            return;
        }

        await putCheckingPayRecords(target_records)
            .catch((e) => {
                throw new CheckReadyToPayError("レコードの更新中にエラーが発生しました。", e);
            });

        alert(`${target_records.length}件のレコードについて、状態を${new_status}に更新しました。`);
        document.location.reload();
    } catch (e) {
        console.error(e);
        alert("処理中にエラーが発生しました。F12キーを押してシステム管理者に連絡してください。");
    } finally {
        alert("処理を終了します。");
        button.innerText = button_title;
    }
};

const confirmBeforeExec = () => {
    const message = `${target_status}のレコードを全て${new_status}に更新してもよろしいですか？`;
    return confirm(message);
};

const getCheckingPayRecords = async () => {
    const body = {
        app: kintone.app.getId(),
        query: `${status_field} in ("${target_status}")`
    };

    console.log(JSON.stringify(body));
    const resp = await CLIENT.record.getRecords(body);
    return resp.records;
};

const putCheckingPayRecords = (records) => {
    const recs = records
        .map((r) => {
            return {
                id: r[record_id_field]["value"],
                record: {
                    [status_field]: {
                        value: new_status
                    }
                }
            };
        });

    const body = {
        app: kintone.app.getId(),
        records: recs
    };

    console.log(JSON.stringify(body));
    return CLIENT.record.updateRecords(body);
};
