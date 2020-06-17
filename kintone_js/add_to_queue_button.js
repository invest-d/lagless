/*
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

(function() {
    "use strict";

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
    const fieldRecordId_COLLECT = "レコード番号";
    const fieldParentCollectRecord_COLLECT = "parentCollectRecord";
    const fieldInvoicePdf_COLLECT = "invoicePdf";
    const fieldStatus_COLLECT = "collectStatus";
    const statusNotReadyToSend_COLLECT = "クラウドサイン承認済み";
    const statusReadyToSend_COLLECT = "振込依頼書送信可";
    const fieldConstructorId_COLLECT = "constructionShopId";
    const fieldClosingDate_COLLECT = "closingDate";
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
        const addToQueue = document.createElement("button");
        addToQueue.id = "addToQueue";
        addToQueue.innerText = "振込依頼書を送信待ち状態にする";
        addToQueue.addEventListener("click", clickAddToQueue.bind(null, record));
        return addToQueue;
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

            // それぞれのレコード番号の状態を全て確認するのが目的なので、件数が合っていなければエラーにする
            if (applies_resp.records.length !== apply_ids.length) {
                throw new Error(`一部もしくは全ての申込レコードが申込アプリに存在しませんでした。\n取得を試みたレコード番号：${apply_ids.join(",")}`);
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

            await updateStatusReady(collects_resp.records)
                .catch((err) => {
                    throw new Error(`親子レコードの状態フィールドの更新中にエラーが発生しました。\n\nエラーログ：${err}`);
                });

            alert(`親子レコードの状態を${statusReadyToSend_COLLECT}に更新しました。\nこの後は自動でメールが送信されます。\n\nメール送信の際にはinfoのアドレスにもCcが送信されます。10分経っても送信されない場合はシステム管理者にご連絡ください。`);
            alert("レコード一覧画面に戻ります。");
            window.location.href = `/k/${APP_ID_COLLECT}/`;
        } catch(err) {
            alert(err);
        }
    }

    function getParentAndChildCollectRecords(record) {
        console.log("親子レコードを全て取得する。");
        // 親レコードと①工務店ID、②締め日の二つが両方とも等しいレコードを子レコードとする。親自身も取得対象に含める。
        const constructor_id = record[fieldConstructorId_COLLECT]["value"];
        const closing_date = record[fieldClosingDate_COLLECT]["value"];

        const get_body = {
            "app": APP_ID_COLLECT,
            "fields": [fieldRecordId_COLLECT],
            "query": `${fieldConstructorId_COLLECT} = "${constructor_id}" and ${fieldClosingDate_COLLECT} = "${closing_date}"`
        };

        console.log(get_body);

        return kintoneRecord.getRecords(get_body);
    }

    function updateStatusReady(records) {
        const ids = records.map((r) => r[fieldRecordId_COLLECT]["value"]);

        const put_body = {
            "app": APP_ID_COLLECT,
            "records": ids.map((id) => {
                return {
                    "id": id,
                    "record": {
                        [fieldStatus_COLLECT]: {
                            "value": statusReadyToSend_COLLECT
                        }
                    }
                };
            })
        };

        return kintoneRecord.updateRecords(put_body);
    }

    function getApplies(apply_ids) {
        const get_body = {
            "app": APP_ID_APPLY,
            "fields": [fieldStatus_APPLY],
            "query": `${fieldRecordId_APPLY} in ("${apply_ids.join('","')}")`
        };

        return kintoneRecord.getRecords(get_body);
    }
})();
