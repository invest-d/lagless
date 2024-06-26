/*
    Version 2
    親子レコードの判定時に、「工務店IDや締め日が異なるものの、同じ親子グループとして判定すべき」という
    軽バン.comの回収レコードについての考慮が漏れていた問題を修正。
    これにより、本来「振込依頼書送信可」に更新されるべき軽バン.comの回収レコードが更新されないバグが起きないようにした。

    Version 1
    回収アプリの親レコードのレコード詳細画面に設置するボタン。
    ボタンクリックすると、その親に属する親子全てのレコードの状態を「振込依頼書送信可」に更新する。
    ただし、次の全ての条件に当てはまっている必要がある。
        1. 回収レコードの親の「振込依頼書確認OK」チェックボックスがオンになっている。
        2. 振込依頼書生成対象となっている申込レコードの状態が、全て「実行完了」になっている。
    条件を満たしていない場合、原因を伝えるエラーメッセージを表示し、処理をキャンセルする。
    （実際に送信するのは親だけなのにも関わらず）親子両方とも状態を変更する理由は、
    振込依頼書作成処理をもう一度実行した時に、状態が取り残されたままの子たちの中で新たな親が出来てしまうのを防ぐため。
*/

const dayjs = require("dayjs");
import { KE_BAN_CONSTRUCTORS } from "../96/common";

import * as kintoneAPI from "../util/kintoneAPI";

const client = kintoneAPI.CLIENT;

import { getApplyAppSchema, getCollectAppSchema } from "../util/environments";
// import { schema_collect } from "../162/schema";
const schema_collect = getCollectAppSchema(kintone.app.getId());
if (!schema_collect) throw new Error();
const APP_ID_COLLECT                = schema_collect.id.appId;
const fieldStatus_COLLECT           = schema_collect.fields.properties.collectStatus.code;
const fieldRecordId_COLLECT         = schema_collect.fields.properties.レコード番号.code;
const fieldConstructorId_COLLECT    = schema_collect.fields.properties.constructionShopId.code;
const fieldClosingDate_COLLECT      = schema_collect.fields.properties.closingDate.code;
const statusRejected_COLLECT        = schema_collect.fields.properties.collectStatus.options["クラウドサイン却下・再作成待ち"].label;

export function getParentAndChildCollectRecords(record) {
    console.log("親子レコードを全て取得する。");
    const constructor_id = record[fieldConstructorId_COLLECT]["value"];
    const closing_date = record[fieldClosingDate_COLLECT]["value"];

    const queries = ((constructor_id, closing_date) => {
        const queries = [];

        // 親自身よりも後に作成されたレコードが対象。（generate_invoice_button.jsにおいて、親子グループ内でレコード番号が最も小さいレコードが親になるという前提）
        queries.push(`${fieldRecordId_COLLECT} >= ${record[fieldRecordId_COLLECT]["value"]}`);

        if (KE_BAN_CONSTRUCTORS.includes(constructor_id)) {
            // 軽バン.comの場合、親子レコードの判定を次のように変更する。
            // ①軽バン.comの工務店IDのいずれかを持っている
            // ②recordのclosing_dateと同じ年, 月を持っている（日は異なっていても良い）
            // 上記の①と②の両方を満たすレコードである。
            const in_query = KE_BAN_CONSTRUCTORS.map((id) => `"${id}"`).join(",");
            queries.push(`${fieldConstructorId_COLLECT} in (${in_query})`);

            const from_date = dayjs(closing_date).startOf("month").format("YYYY-MM-DDTHH:mm:ssZ");
            const to_date = dayjs(closing_date).endOf("month").format("YYYY-MM-DDTHH:mm:ssZ");
            queries.push(`${fieldClosingDate_COLLECT} >= "${from_date}"`);
            queries.push(`${fieldClosingDate_COLLECT} <= "${to_date}"`);
        } else {
            // 工務店IDと締め日の両方が等しい。親自身も取得対象に含める。
            queries.push(`${fieldConstructorId_COLLECT} = "${constructor_id}" and ${fieldClosingDate_COLLECT} = "${closing_date}"`);
        }

        // 取り下げは除外
        queries.push(`${fieldStatus_COLLECT} not in ("${statusRejected_COLLECT}")`);

        return queries;
    })(constructor_id, closing_date);

    const query = queries.map((q) => `(${q})`).join(" and ");

    const get_body = {
        "app": APP_ID_COLLECT,
        "fields": [fieldRecordId_COLLECT],
        "query": query
    };

    console.log(get_body);

    return client.record.getRecords(get_body);
}

export function updateStatus(records, status) {
    const ids = records.map((r) => r[fieldRecordId_COLLECT]["value"]);

    const put_body = {
        "app": APP_ID_COLLECT,
        "records": ids.map((id) => {
            return {
                "id": id,
                "record": {
                    [fieldStatus_COLLECT]: {
                        "value": status
                    }
                }
            };
        })
    };

    return client.record.updateRecords(put_body);
}

const fieldParentCollectRecord_COLLECT  = schema_collect.fields.properties.parentCollectRecord.code;
const fieldInvoicePdf_COLLECT           = schema_collect.fields.properties.invoicePdf.code;
const statusApproved_COLLECT            = schema_collect.fields.properties.collectStatus.options.クラウドサイン承認済み.label;
const statusPdfReady_COLLECT            = schema_collect.fields.properties.collectStatus.options.振込依頼書作成対象.label;
const statusesNotSent = [
    statusApproved_COLLECT,
    statusPdfReady_COLLECT,
];
const statusReadyToSend_COLLECT         = schema_collect.fields.properties.collectStatus.options.振込依頼書送信可.label;
const tableInvoiceTargets_COLLECT       = schema_collect.fields.properties.invoiceTargets.code;
const tableFieldRecordId_COLLECT        = schema_collect.fields.properties.invoiceTargets.fields.applyRecordNoIV.code;
const fieldConfirmStatus_COLLECT        = schema_collect.fields.properties.confirmStatusInvoice.code;
const statusConfirmedInvoice_COLLECT    = schema_collect.fields.properties.confirmStatusInvoice.options.確認OK.label;
const isParent_COLLECT                  = schema_collect.fields.properties.parentCollectRecord.options.true.label;

// import { schema_apply } from "../161/schema";
const schema_apply = getApplyAppSchema(kintone.app.getId());
if (!schema_apply) throw new Error();
const APP_ID_APPLY                      = schema_apply.id.appId;
const fieldRecordId_APPLY               = schema_apply.fields.properties.レコード番号.code;
const fieldStatus_APPLY                 = schema_apply.fields.properties.状態.code;
const statusPaid_APPLY                  = schema_apply.fields.properties.状態.options.実行完了.label;
const fieldPaymentTiming_APPLY          = schema_apply.fields.properties.paymentTiming.code;
const statusLater_APPLY                 = schema_apply.fields.properties.paymentTiming.options.遅払い.label;

export function needShowButton(record) {
    const is_not_displayed = document.getElementById("addToQueue") === null;

    // 親レコードのうち、振込依頼書作成済みで、かつ送信前のレコードの場合のみ表示
    const is_parent_not_send = ((record[fieldParentCollectRecord_COLLECT]["value"]).includes(isParent_COLLECT))
        && (record[fieldInvoicePdf_COLLECT]["value"].length > 0)
        && statusesNotSent.includes(record[fieldStatus_COLLECT]["value"]);
    return is_not_displayed && is_parent_not_send;
}

export function createAddToQueueButton(record) {
    const button = document.createElement("button");
    button.id = "addToQueue";
    button.innerText = "振込依頼書を送信待ち状態にする";
    button.addEventListener("click", clickAddToQueue.bind(null, record));
    return button;
}

async function clickAddToQueue(record) {
    const clicked_ok = confirm("このレコードの振込依頼書を自動送信してもよろしいですか？\n（最長10分後に自動で送信されます）");
    if (!clicked_ok) {
        alert("処理は中断されました。");
        return;
    }

    try {
        if (!(record[fieldConfirmStatus_COLLECT]["value"]).includes(statusConfirmedInvoice_COLLECT)) {
            alert("振込依頼書の目視確認が済んでいません。\n振込依頼書確認OKのチェックボックスをオンにして保存してから\nもう一度ボタンをクリックしてください。");
            return;
        }

        const apply_ids = (record[tableInvoiceTargets_COLLECT]["value"]).map((row) => row["value"][tableFieldRecordId_COLLECT]["value"]);
        const applies_resp = await getApplies(apply_ids)
            .catch((err) => {
                throw new Error(`振込依頼書明細の申込レコードの支払状況を確認している最中にエラーが発生しました。\n\nエラーログ：${err}`);
            });

        // それぞれのレコード番号の状態を全て確認する。
        // 振込依頼書対象になっているのに申込アプリに存在しないレコードがあればエラーとする。
        const expected_id_set = new Set(apply_ids);
        const retlieved_id_set = new Set(applies_resp.map((r) => r[fieldRecordId_APPLY]["value"]));
        // script by https://qiita.com/toshihikoyanase/items/7b07ca6a94eb72164257
        Set.prototype.difference = function(setB) {
            const difference = new Set(this);
            for (const elem of setB) {
                difference.delete(elem);
            }
            return difference;
        };
        const diff = expected_id_set.difference(retlieved_id_set);
        if (diff.size > 0) {
            throw new Error(`申込アプリの中に、下記のレコード番号が見つかりませんでした。\n${Array.from(diff).join(",")}`);
        }

        // 支払実行されていないレコードがあったとしても、それが全て遅払いであれば振込依頼書送信OK
        const is_all_early_payments_paid = applies_resp
            .filter((r) => r[fieldPaymentTiming_APPLY]["value"] !== statusLater_APPLY)
            .every((r) => r[fieldStatus_APPLY]["value"] === statusPaid_APPLY);

        if (!is_all_early_payments_paid) {
            alert(`支払実行が完了していない申込レコードがあります。\n\n申込アプリを開いて、下記のレコード番号の状態フィールドが${statusPaid_APPLY}になっているか確認してください。\n${apply_ids.join(",")}`);
            return;
        }

        const collects_resp = await getParentAndChildCollectRecords(record)
            .catch((err) => {
                throw new Error(`この親レコードに関連する子レコードの取得中にエラーが発生しました。\n\nエラーログ：${err}`);
            });

        await updateStatus(collects_resp.records, statusReadyToSend_COLLECT)
            .catch((err) => {
                throw new Error(`親子レコードの状態フィールドの更新中にエラーが発生しました。\n\nエラーログ：${err}`);
            });

        alert(`親子レコードの状態を${statusReadyToSend_COLLECT}に更新しました。\nこの後は自動でメールが送信されます。\n\n10分経っても送信されない場合はシステム管理者にご連絡ください。`);
        alert("レコード一覧画面に戻ります。");
        window.location.href = `/k/${APP_ID_COLLECT}/`;
    } catch(err) {
        alert(err);
    }
}

function getApplies(apply_ids) {
    const get_body = {
        "app": APP_ID_APPLY,
        "fields": [
            fieldRecordId_APPLY,
            fieldStatus_APPLY,
            fieldPaymentTiming_APPLY,
        ],
        "condition": `${fieldRecordId_APPLY} in ("${apply_ids.join('","')}")`
    };

    return client.record.getAllRecords(get_body);
}
