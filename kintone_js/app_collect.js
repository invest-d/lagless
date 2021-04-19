/*
    Version 1
    回収アプリ(開発版159/本番162)のカスタマイズjsとして作成。
*/

import * as abort from "./app_collect/logics_abort_manual_adding_to_queue";

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
})();
