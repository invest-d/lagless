// @ts-check
import * as common from "./outputTransferCsv/logics_output_csv";
import * as realtor from "./outputTransferCsv/logics_output_csv_RealtorOriginalPay";
import * as keban from "./outputTransferCsv/logics_output_csv_WfiEarlyPay";

(function() {
    "use strict";
    // @ts-ignore
    kintone.events.on("app.record.index.show", (event) => {
        if (common.needToShow(event, "usualRealtor", realtor.AVAILABLE_VIEW)) {
            const button = common.createButton({ transferType: "usualRealtor" });
            // @ts-ignore
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }

        if (common.needToShow(event, "advanceKeban", keban.AVAILABLE_VIEW)) {
            const button = common.createButton({ transferType: "advanceKeban" });
            // @ts-ignore
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });
})();
