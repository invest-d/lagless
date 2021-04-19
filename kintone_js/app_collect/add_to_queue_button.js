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

const kintoneRecord = new kintoneJSSDK.Record({connection: new kintoneJSSDK.Connection()});

const APP_ID = ((app_id) => {
    switch(app_id) {
    // 今開いてるのが開発版の回収アプリの場合
    case 160:
        return {
            APPLY: 159,
            COLLECT: 160
        };

    // 本番の回収アプリの場合
    case 162:
        return {
            APPLY: 161,
            COLLECT: 162
        };
    default:
        console.warn(`Unknown app: ${app_id}`);
    }
})(kintone.app.getId());

const APP_ID_COLLECT = APP_ID.COLLECT;
const fieldStatus_COLLECT = "collectStatus";
const fieldRecordId_COLLECT = "レコード番号";
const fieldConstructorId_COLLECT = "constructionShopId";
const fieldClosingDate_COLLECT = "closingDate";
const statusRejected_COLLECT = "クラウドサイン却下・再作成待ち";

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

    return kintoneRecord.getRecords(get_body);
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

    return kintoneRecord.updateRecords(put_body);
}

(function() {
    "use strict";

    const fieldParentCollectRecord_COLLECT = "parentCollectRecord";
    const fieldInvoicePdf_COLLECT = "invoicePdf";
    const statusNotReadyToSend_COLLECT = "クラウドサイン承認済み";
    const statusReadyToSend_COLLECT = "振込依頼書送信可";
    const tableInvoiceTargets_COLLECT = "invoiceTargets";
    const tableFieldRecordId_COLLECT = "applyRecordNoIV";
    const fieldConfirmStatus_COLLECT ="confirmStatusInvoice";
    const statusConfirmedInvoice_COLLECT = "確認OK";

    const APP_ID_APPLY = APP_ID.APPLY;
    const fieldRecordId_APPLY = "$id";
    const fieldStatus_APPLY = "状態";
    const statusPaid_APPLY = "実行完了";

    kintone.events.on("app.record.detail.show", (event) => {
        if (needShowButton(event.record)) {
            const button = createAddToQueueButton(event.record);
            kintone.app.record.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function needShowButton(record) {
        const is_not_displayed = document.getElementById("addToQueue") === null;

        // 親レコードのうち、振込依頼書作成済みで、かつ送信前のレコードの場合のみ表示
        const is_parent_not_send = ((record[fieldParentCollectRecord_COLLECT]["value"]).includes("true"))
            && (record[fieldInvoicePdf_COLLECT]["value"].length > 0)
            && (record[fieldStatus_COLLECT]["value"] === statusNotReadyToSend_COLLECT);
        return is_not_displayed && is_parent_not_send;
    }

    function createAddToQueueButton(record) {
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
            const retlieved_id_set = new Set(applies_resp.records.map((r) => r[fieldRecordId_APPLY]["value"]));
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

            const is_all_paid = applies_resp.records.every((r) => r[fieldStatus_APPLY]["value"] === statusPaid_APPLY);

            if (!is_all_paid) {
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
                fieldStatus_APPLY
            ],
            "query": `${fieldRecordId_APPLY} in ("${apply_ids.join('","')}")`
        };

        return kintoneRecord.getAllRecordsByQuery(get_body);
    }
})();
