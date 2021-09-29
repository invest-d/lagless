import * as kintoneAPI from "../../util/kintoneAPI";

import { getCollectAppSchema, UnknownAppError } from "../../util/choiceCollectAppSchema";
const collectAppSchema = (() => {
    try {
        return getCollectAppSchema(kintone.app.getId());
    } catch (e) {
        if (e instanceof UnknownAppError) {
            alert("不明なアプリです。回収アプリで実行してください。");
        } else {
            console.error(e);
            const additional_info = e.message ?? JSON.stringify(e);
            alert("途中で処理に失敗しました。システム管理者に連絡してください。"
                + "\n追加の情報: "
                + `\n${additional_info}`);
        }
    }
})();
if (!collectAppSchema) throw new Error();
const collectFields = collectAppSchema.fields.properties;
const APP_ID_COLLECT                            = collectAppSchema.id.appId;
const fieldRecordId_COLLECT                     = collectFields.レコード番号.code;
const fieldDeadline_COLLECT                     = collectFields.deadline.code;
const fieldProductName_COLLECT                  = collectFields.productName.code;
const fieldConstructionShopId_COLLECT           = collectFields.constructionShopId.code;
const fieldConstructionShopName_COLLECT         = collectFields.constructionShopName.code;
const fieldCeoTitle_COLLECT                     = collectFields.ceoTitle.code;
const fieldCeo_COLLECT                          = collectFields.ceo.code;
const fieldMailToInvest_COLLECT                 = collectFields.mailToInvest.code;
const fieldClosingDate_COLLECT                  = collectFields.closingDate.code;
const fieldCollectableAmount_COLLECT            = collectFields.scheduledCollectableAmount.code;
const fieldAccount_COLLECT                      = collectFields.account.code;
const fieldDaysLater_COLLECT                    = collectFields.daysLater.code;
const fieldStatus_COLLECT                       = collectFields.collectStatus.code;
const statusInvoiceTarget_COLLECT               = collectFields.collectStatus.options.振込依頼書作成対象.label;
const fieldParentCollectRecord_COLLECT          = collectFields.parentCollectRecord.code;
const fieldTotalBilledAmount_COLLECT            = collectFields.totalBilledAmount.code;
const tableCloudSignApplies_COLLECT             = collectFields.cloudSignApplies.code;
const tableInvoiceTargets_COLLECT               = collectFields.invoiceTargets.code;
const fieldInvoicePdfDate_COLLECT               = collectFields.invoicePdfDate.code;

export const getInvoiceTargetQuery = () => {
    return `${fieldStatus_COLLECT} in ("${statusInvoiceTarget_COLLECT}")`;
};

export function getTargetRecords() {
    console.log(`回収アプリから${statusInvoiceTarget_COLLECT}のレコードを全て取得する`);

    const query = getInvoiceTargetQuery();

    const request_body = {
        "app": APP_ID_COLLECT,
        "fields":[
            fieldRecordId_COLLECT,
            fieldProductName_COLLECT,
            fieldConstructionShopId_COLLECT,
            fieldConstructionShopName_COLLECT,
            fieldCeoTitle_COLLECT,
            fieldCeo_COLLECT,
            fieldMailToInvest_COLLECT,
            fieldClosingDate_COLLECT,
            fieldDeadline_COLLECT,
            fieldCollectableAmount_COLLECT,
            fieldAccount_COLLECT,
            fieldDaysLater_COLLECT,
            fieldParentCollectRecord_COLLECT,
            fieldTotalBilledAmount_COLLECT,
            tableCloudSignApplies_COLLECT,
            tableInvoiceTargets_COLLECT,
            fieldInvoicePdfDate_COLLECT,
        ],
        query,
    };

    return kintoneAPI.CLIENT.record.getRecords(request_body);
}
