/*
    Version 1
    工務店マスタアプリ(96)のカスタマイズjsとして作成。
*/

import {
    needShow as needShowConvertElements,
    createExecuteButton,
    createFileInput,
    createProcessButton,
    createCancelButton,
} from "./96/button_convert_workship_list";

(function () {
    "use strict";
    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.index.show", (event) => {
        if (needShowConvertElements()) {
            kintone.app.getHeaderMenuSpaceElement().appendChild(createExecuteButton());
            kintone.app.getHeaderMenuSpaceElement().appendChild(createFileInput());
            kintone.app.getHeaderMenuSpaceElement().appendChild(createProcessButton());
            kintone.app.getHeaderMenuSpaceElement().appendChild(createCancelButton());
        }
    });
})();
