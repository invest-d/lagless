/*
    Version 1
    回収アプリ(開発版159/本番162)のカスタマイズjsとして作成。
*/

import * as abort from "./app_collect/logics_abort_manual_adding_to_queue";
import * as queue from "./app_collect/logics_add_to_queue_button";
import * as copy from "./app_collect/copy_credit_button";

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
    });

    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.index.show", (event) => {
        if (copy.needShowButton()) {
            const button = copy.createCopyCreditButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });
})();
