/*
    Version 1
    回収アプリの親レコードのレコード詳細画面に設置するボタン。
    ボタンクリックすると、既に振込依頼書を送信済みの親レコードに対して、子レコードも含めて状態を送信前に戻す。

    このボタンを使うのは次のような場合：
    一度振込依頼書を送信したものの、申込期限を過ぎたものを受付・支払実行したあと、
    振込依頼書に支払明細を追加修正した上で再送信するとき
    また、単純に「まだ送信してないけど送信を取り消したい」という時にも使えるようにする
*/

import { getParentAndChildCollectRecords, updateStatus } from "./logics_add_to_queue_button";

import { getCollectAppSchema } from "../util/environments";
// import { schema_collect } from "../162/schema";
const schema_collect = getCollectAppSchema(kintone.app.getId());
if (!schema_collect) throw new Error();
const APP_ID_COLLECT                    = schema_collect.id.appId;
const fieldStatus_COLLECT               = schema_collect.fields.properties.collectStatus.code;
const statusUnsend_COLLECT              = schema_collect.fields.properties.collectStatus.options.振込依頼書作成対象.label;
const unsendTarget = [
    schema_collect.fields.properties.collectStatus.options.振込依頼書送信可.label,
    schema_collect.fields.properties.collectStatus.options.振込依頼書送信済み.label
];
const fieldParentCollectRecord_COLLECT  = schema_collect.fields.properties.parentCollectRecord.code;
const isParent_COLLECT                  = schema_collect.fields.properties.parentCollectRecord.options.true.label;

export function needShowButton(record) {
    const is_not_displayed = document.getElementById("unsendInvoice") === null;

    // 振込依頼書送信済みの（もしくはもうすぐ送信される）親レコードの場合のみ表示
    const is_parent = (unsendTarget.includes(record[fieldStatus_COLLECT]["value"])) && ((record[fieldParentCollectRecord_COLLECT]["value"]).includes(isParent_COLLECT));
    return is_not_displayed && is_parent;
}

export function createButton(record) {
    const unsendInvoice = document.createElement("button");
    unsendInvoice.id = "unsendInvoice";
    unsendInvoice.innerText = "このレコードを振込依頼書送信前の状態に戻す";
    unsendInvoice.addEventListener("click", clickUnsendInvoice.bind(null, record));
    return unsendInvoice;
}

async function clickUnsendInvoice (record) {
    const clicked_ok = confirm("このレコードの振込依頼書を未送信の状態（送信前の確認中の状態）に戻してもよろしいですか？");
    if (!clicked_ok) {
        alert("処理は中断されました。");
        return;
    }

    const collects_resp = await getParentAndChildCollectRecords(record)
        .catch((err) => {
            throw new Error(`この親レコードに関連する子レコードの取得中にエラーが発生しました。\n\nエラーログ：${err}`);
        });

    await updateStatus(collects_resp.records, statusUnsend_COLLECT)
        .catch((err) => {
            throw new Error(`親子レコードの状態フィールドの更新中にエラーが発生しました。\n\nエラーログ：${err}`);
        });

    alert(`親子レコードの状態を「${statusUnsend_COLLECT}」に戻しました。\n「振込依頼書を作成」ボタンから振込依頼書をもう一度作り直すことができます。`);
    alert("レコード一覧画面に戻ります。");
    window.location.href = `/k/${APP_ID_COLLECT}/`;
}
