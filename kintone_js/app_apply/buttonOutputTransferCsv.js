// @ts-check
import * as common_logics from "./outputTransferCsv/logics_output_csv";
import * as realtor_logics from "./outputTransferCsv/logics_output_csv_RealtorOriginalPay";
import * as wfi_logics from "./outputTransferCsv/logics_output_csv_WfiEarlyPay";

(function() {
    "use strict";
    // @ts-ignore
    kintone.events.on("app.record.index.show", (event) => {
        if (common_logics.needToShow(event, "usualRealtor", realtor_logics.AVAILABLE_VIEW)) {
            const button = common_logics.createButton({ transferType: "usualRealtor" });
            // @ts-ignore
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }

        if (common_logics.needToShow(event, "advanceKeban", wfi_logics.AVAILABLE_VIEW)) {
            const button = common_logics.createButton({ transferType: "advanceKeban" });
            // @ts-ignore
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });
})();
