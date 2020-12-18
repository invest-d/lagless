/*
    Version 1
    アプリ174のカスタマイズjsとして作成。
    請求データを請求IDごとにまとめて、kintone申込アプリにレコードを作成する。
*/

import {
    needShowButton as needShowInsertButton,
    createButton as createInsertButton,
} from "./174/button_insert_original_pay_data";

import {
    needShowButton as needShowListingButton,
    createButton as createListingButton,
} from "./174/button_listing_undefined_kyoryoku";

(function () {
    "use strict";
    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.index.show", (event) => {
        if (needShowListingButton()) {
            kintone.app.getHeaderMenuSpaceElement().appendChild(createListingButton());
        }

        if (needShowInsertButton()) {
            kintone.app.getHeaderMenuSpaceElement().appendChild(createInsertButton());
        }
    });
})();
