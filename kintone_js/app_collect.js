/*
    Version 1
    回収アプリ(開発版159/本番162)のカスタマイズjsとして作成。
*/

import * as abort from "./app_collect/logics_abort_manual_adding_to_queue";
import * as queue from "./app_collect/add_to_queue_button";

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
})();
