/*
    Version 1
    クラウドサイン却下になったレコードに対して、回収レコードと申込レコードの結びつきを解除するボタンをレコード詳細画面に設置する。
    具体的には、表示中の回収レコードのレコード番号を、申込レコードの回収IDフィールドにセットしている申込について、回収IDフィールドをブランクで上書きする。
*/

import { getApplyAppSchema, getCollectAppSchema } from "../util/environments";

// import { schema_collect } from "../162/schema";
const schema_collect = getCollectAppSchema(kintone.app.getId());
if (!schema_collect) throw new Error();
const APP_ID_COLLECT            = schema_collect.id.appId;
const fieldRecordNo_COLLECT     = schema_collect.fields.properties.レコード番号.code;
const fieldStatus_COLLECT       = schema_collect.fields.properties.collectStatus.code;
const statusRejected_COLLECT    = schema_collect.fields.properties.collectStatus.options["クラウドサイン却下・再作成待ち"].label;

// import { schema_apply } from "../161/schema";
const schema_apply = getApplyAppSchema(kintone.app.getId());
if (!schema_apply) throw new Error();
const APP_ID_APPLY          = schema_apply.id.appId;
const fieldRecordNo_APPLY   = schema_apply.fields.properties.レコード番号.code;
const fieldCollectId_APPLY  = schema_apply.fields.properties.collectId.code;

export function needShowButton() {
    // 増殖バグ防止
    const not_displayed = document.getElementById("rejectCollect") === null;

    return not_displayed;
}

export function createRejectCollectRecordButton(showing_record) {
    const getRejectCollect = document.createElement("button");
    getRejectCollect.id = "rejectCollect";
    getRejectCollect.innerText = "クラウドサイン再送信用に申込レコードとの結びつきを解除する";
    getRejectCollect.addEventListener("click", clickRejectCollectRecord.bind(null, showing_record));
    return getRejectCollect;
}

// ボタンクリック時の処理を定義
async function clickRejectCollectRecord(showing_record) {
    // 誤操作しないように、却下されたレコードでのみ動作
    const rejected = (showing_record[fieldStatus_COLLECT]["value"] === statusRejected_COLLECT);
    if (!rejected) {
        alert("結びつきを解除するには、このレコードの状態を一度却下にして保存してからもう一度操作してください。");
        return;
    }

    const clicked_ok = confirm("申込レコードと回収レコードの結びつきを解除しますか？");
    if (!clicked_ok) {
        alert("処理は中断されました。");
        return;
    }

    try {
        const detail_ids = await getDetailApplies(showing_record[fieldRecordNo_COLLECT]["value"])
            .catch((err) => {
                console.log(err);
                throw new Error("回収レコードに紐づく申込レコードの取得中にエラーが発生しました。");
            });

        await deleteCollectIdField(detail_ids.records)
            .catch((err) => {
                console.log(err);
                throw new Error("申込レコードの回収IDの削除中にエラーが発生しました。");
            });

        alert("回収IDの紐づけを解除しました。\n"
        + "必要に応じて申込レコードを変更し、再度回収レコードを作成してください。");
        alert("レコード一覧画面に戻ります。");
        window.location.href = `/k/${APP_ID_COLLECT}/`;
    } catch(err) {
        alert(err);
    }
}

function getDetailApplies(collect_record_no) {
    console.log("表示中の回収レコードの明細にあたる申込レコードを全て取得する");

    const request_body = {
        "app": APP_ID_APPLY,
        "fields": [fieldRecordNo_APPLY],
        "query": `${fieldCollectId_APPLY} = ${collect_record_no}`
    };

    return kintone.api(kintone.api.url("/k/v1/records", true), "GET", request_body);
}

function deleteCollectIdField(detail_ids) {
    console.log("クラウドサインの明細にあたるレコードの回収IDをブランクに戻す");

    const request_body = {
        "app": APP_ID_APPLY,
        records: detail_ids.map((detail) => {
            return {
                "id": detail[fieldRecordNo_APPLY]["value"],
                "record": {
                    [fieldCollectId_APPLY]: {
                        "value": null
                    }
                }
            };
        })
    };

    return kintone.api(kintone.api.url("/k/v1/records", true), "PUT", request_body);
}
