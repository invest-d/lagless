/*
    Version 1
    回収アプリ(開発版159/本番162)のカスタマイズjsとして作成。
*/

import {
    STATUS_FIELD,
    shouldNotChangeStatus,
    setErrorMessageOnDetailEdit,
    setErrorMessageOnInlineEdit,
} from "./app_collect/abort_manual_adding_to_queue";

(function () {
    "use strict";

    kintone.events.on(`app.record.edit.change.${STATUS_FIELD}`, (event) => {
        const status = event.record[STATUS_FIELD]["value"];
        if (shouldNotChangeStatus(status)) {
            return setErrorMessageOnDetailEdit(event);
        }
    });

    kintone.events.on(`app.record.index.edit.change.${STATUS_FIELD}`, (event) => {
        const status = event.record[STATUS_FIELD]["value"];
        if (shouldNotChangeStatus(status)) {
            return setErrorMessageOnInlineEdit(event);
        }
    });
})();
