/*
    Version 1
    自動生成した振込依頼書を目視確認したあと、確認OKの状態に更新する。
    親レコードのレコード詳細画面にボタンを表示。
    状態を更新するときに、親レコードだけでなく、紐づく子レコードの状態もまとめて更新する。
*/

(function () {
    "use strict";

    const APP_ID_COLLECT = kintone.app.getId();
    const fieldRecordId_COLLECT = "レコード番号";
    const fieldStatus_COLLECT = "collectStatus";
    const statusPaid_COLLECT = "支払実行済み";
    const statusConfirmed_COLLECT = "振込依頼書確認OK";
    const fieldParentCollectRecord_COLLECT = "parentCollectRecord";
    const fieldInvoicePdf_COLLECT = "invoicePdf";
    const fieldConstructorId_COLLECT = "constructionShopId";
    const fieldClosingDate_COLLECT = "closingDate";

    kintone.events.on("app.record.detail.show", (event) => {
        if (needShowButton(event.record)) {
            const button = createConfirmInvoiceButton(event.record);
            kintone.app.record.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function needShowButton(showing_record) {
        // 増殖バグ防止
        const not_displayed = document.getElementById("confirmInvoice") === null;

        // 振込依頼書作成済みの親レコードの場合のみ表示
        const is_parent = (showing_record[fieldParentCollectRecord_COLLECT]["value"][0] === "true") && (showing_record[fieldInvoicePdf_COLLECT]["value"].length > 0);

        return not_displayed && is_parent;
    }

    function createConfirmInvoiceButton(showing_record) {
        const confirmInvoice = document.createElement("button");
        confirmInvoice.id = "confirmInvoice";
        confirmInvoice.innerText = "振込依頼書の確認OK";
        confirmInvoice.addEventListener("click", clickConfirmInvoice.bind(null, showing_record));
        return confirmInvoice;
    }

    // ボタンクリック時の処理を定義
    async function clickConfirmInvoice(showing_record) {
        const clicked_ok = confirm("レコードの状態を振込依頼書確認済みに更新しますか？");
        if (!clicked_ok) {
            alert("処理は中断されました。");
            return;
        }

        try {
            // 工務店IDと締日の両方が一致しており、支払実行済みのレコードを取得。親自身も取得する。
            const update_target = await getInvoiceGroup(showing_record[fieldConstructorId_COLLECT]["value"], showing_record[fieldClosingDate_COLLECT]["value"])
                .catch((err) => {
                    console.log(err);
                    throw new Error("親子レコードの一覧を取得中にエラーが発生しました");
                });

            await updateStatusConfirmed(update_target.records.map((record) => record[fieldRecordId_COLLECT]["value"]))
                .catch((err) => {
                    console.log(err);
                    throw new Error("親子レコードの状態を更新中にエラーが発生しました。");
                });

            alert("状態を振込依頼書確認済みに更新しました。\n"
            + "振込依頼書は自動で送信されます。");
            alert("レコード一覧画面に戻ります。");
            window.location.href = `/k/${APP_ID_COLLECT}/`;
        } catch(err) {
            alert(err);
        }
    }

    function getInvoiceGroup(constructor_id, closing_date) {
        console.log("表示中の親レコードについて、支払実行済みの親子レコードを全て取得する");

        const request_body = {
            "app": APP_ID_COLLECT,
            "fields": [fieldRecordId_COLLECT],
            "query": `${fieldStatus_COLLECT} in ("${statusPaid_COLLECT}") and ${fieldConstructorId_COLLECT} = "${constructor_id}" and ${fieldClosingDate_COLLECT} = "${closing_date}"`
        };

        return kintone.api(kintone.api.url("/k/v1/records", true), "GET", request_body);
    }

    function updateStatusConfirmed(record_ids) {
        console.log("親子レコードの状態を振込依頼書確認済みに更新する");

        const request_body = {
            "app": APP_ID_COLLECT,
            "records": record_ids.map((id) => {
                return {
                    "id": id,
                    "record": {
                        [fieldStatus_COLLECT]: {
                            "value": statusConfirmed_COLLECT
                        }
                    }
                };
            })
        };

        return kintone.api(kintone.api.url("/k/v1/records", true), "PUT", request_body);
    }
})();
