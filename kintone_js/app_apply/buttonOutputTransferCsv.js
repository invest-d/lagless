import * as realtor from "./button_output_csv_RealtorOriginalPay";
import * as wfi from "./button_output_csv_WfiEarlyPay";
import * as common_logics from "./outputTransferCsv/logics_output_csv";
import * as realtor_logics from "./outputTransferCsv/logics_output_csv_RealtorOriginalPay";
import * as wfi_logics from "./outputTransferCsv/logics_output_csv_WfiEarlyPay";

(function() {
    "use strict";
    kintone.events.on("app.record.index.show", (event) => {
        if (common_logics.needToShow(event, realtor.transferType, realtor_logics.AVAILABLE_VIEW)) {
            const button = realtor.createButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }

        if (common_logics.needToShow(event, wfi.transferType, wfi_logics.AVAILABLE_VIEW)) {
            const button = wfi.createButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });
})();
