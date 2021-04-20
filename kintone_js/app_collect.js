/*
    Version 1
    回収アプリ(開発版159/本番162)のカスタマイズjsとして作成。
*/

import * as abort from "./app_collect/logics_abort_manual_adding_to_queue";
import * as queue from "./app_collect/logics_add_to_queue_button";
import * as unqueue from "./app_collect/unsend_invoice_button";
import * as copy from "./app_collect/logics_copy_credit_button";
import * as accept from "./app_collect/logics_generate_acceptance_letter_button";
import * as invoice from "./app_collect/logics_generate_invoice_button";
import * as sum from "./app_collect/logics_get_collectable_amount_button";
import * as cs_draft from "./app_collect/logics_post_cloud_sign_draft_button";
import * as reject from "./app_collect/logics_reject_collect_record_button";

(function () {
    "use strict";

    kintone.events.on(`app.record.edit.change.${abort.STATUS_FIELD}`, (event) => {
        const status = event.record[abort.STATUS_FIELD]["value"];
        if (abort.shouldNotChangeStatus(status)) {
            return abort.setErrorMessageOnDetailEdit(event);
        }
    });

    kintone.events.on(`app.record.index.edit.change.${abort.STATUS_FIELD}`, (event) => {
        const status = event.record[abort.STATUS_FIELD]["value"];
        if (abort.shouldNotChangeStatus(status)) {
            return abort.setErrorMessageOnInlineEdit(event);
        }
    });

    kintone.events.on("app.record.detail.show", (event) => {
        if (queue.needShowButton(event.record)) {
            const button = queue.createAddToQueueButton(event.record);
            kintone.app.record.getHeaderMenuSpaceElement().appendChild(button);
        }

        if (reject.needShowButton()) {
            const button = reject.createRejectCollectRecordButton(event.record);
            kintone.app.record.getHeaderMenuSpaceElement().appendChild(button);
        }

        if (unqueue.needShowButton(event.record)) {
            const button = unqueue.createButton(event.record);
            kintone.app.record.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.index.show", (event) => {
        if (accept.needShowButton()) {
            const button = accept.createButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }

        if (cs_draft.needShowButton()) {
            const button = cs_draft.createButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }

        if (invoice.needShowButton()) {
            const button = invoice.createGenerateInvoiceButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }

        if (sum.needShowButton()) {
            const button = sum.createGetCollectableAmountButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }

        if (copy.needShowButton()) {
            const button = copy.createCopyCreditButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });
})();
