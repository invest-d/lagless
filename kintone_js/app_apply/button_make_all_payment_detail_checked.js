/*
    Version 1
    確認中の支払予定明細のレコードを全て確認済みに更新する
*/

import { CLIENT } from "../util/kintoneAPI";
const ExtensibleCustomError = require("extensible-custom-error");
class DetailCheckedError extends ExtensibleCustomError {}

import { schema_apply } from "../161/schema.js";

const executable_view_name  = schema_apply.views.views.支払予定明細文面作成.name;
const target_status         = schema_apply.fields.properties.状態.options.支払予定明細確認中.label;
const new_status            = schema_apply.fields.properties.状態.options.支払予定明細送信前確認完了.label;
const status_field          = schema_apply.fields.properties.状態.code;
const record_id_field       = schema_apply.fields.properties.レコード番号.code;

(function() {
    "use strict";

    kintone.events.on("app.record.index.show", (event) => {
        if (!needShowButton(event.viewName)) return;
        kintone.app.getHeaderMenuSpaceElement().appendChild(createButton());
    });
})();

const button_name = "makeAllDetailChecked";
const button_title = "支払予定明細を一括確認完了";

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
        const target_records = await getCheckingDetailRecords()
            .catch((e) => {
                throw new DetailCheckedError("レコードの取得中にエラーが発生しました。", e);
            });
        if (target_records.length === 0) {
            alert("対象となるレコードはありませんでした。");
            return;
        }

        await putCheckingDetailRecords(target_records)
            .catch((e) => {
                throw new DetailCheckedError("レコードの更新中にエラーが発生しました。", e);
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

const getCheckingDetailRecords = async () => {
    const body = {
        app: kintone.app.getId(),
        query: `${status_field} in ("${target_status}")`
    };

    console.log(JSON.stringify(body));
    const resp = await CLIENT.record.getRecords(body);
    return resp.records;
};

const putCheckingDetailRecords = (records) => {
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
