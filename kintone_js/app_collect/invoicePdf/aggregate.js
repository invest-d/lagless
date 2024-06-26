
import { Decimal } from "decimal.js";
import { isKeban, KE_BAN_PRODUCT_NAME } from "../../96/common";
import { asyncFlatMap, asyncMap } from "../../util/async-flat-map";
import { detectApp, getApplyAppSchema, getCollectAppSchema, getOrdererAppSchema } from "../../util/environments";
import { isGigConstructorID } from "../../util/gig_utils";
import * as kintoneAPI from "../../util/kintoneAPI";
import { getUniqueCombinations } from "../../util/manipulations";
const dayjs = require("dayjs");
dayjs.locale("ja");

// import { schema_96 } from "../../96/schema";
const schema_96 = getOrdererAppSchema(kintone.app.getId());
if (!schema_96) throw new Error();
const APP_ID_CONSTRUCTOR                        = schema_96.id.appId;
const fieldConstructorId_CONSTRUCTOR            = schema_96.fields.properties.id.code;
const fieldTmpcommissionRate_CONSTRUCTOR        = schema_96.fields.properties.tmpcommissionRate.code;
const fieldConstructorName_CONSTRUCTOR          = schema_96.fields.properties.工務店正式名称.code;

const applyAppSchema = getApplyAppSchema(kintone.app.getId());
if (!applyAppSchema) throw new Error();
const applyFields = applyAppSchema.fields.properties;
const APP_ID_APPLY             = applyAppSchema.id.appId;
const fieldRecordId_APPLY      = applyFields.レコード番号.code;
const fieldConstructorId_APPLY = applyFields.constructionShopId.code;

const collectAppSchema = getCollectAppSchema(kintone.app.getId());
if (!collectAppSchema) throw new Error();
const collectFields = collectAppSchema.fields.properties;
const fieldRecordId_COLLECT                     = collectFields.レコード番号.code;
const fieldConstructionShopId_COLLECT           = collectFields.constructionShopId.code;
const fieldClosingDate_COLLECT                  = collectFields.closingDate.code;
const fieldCollectableAmount_COLLECT            = collectFields.scheduledCollectableAmount.code;
const fieldParentCollectRecord_COLLECT          = collectFields.parentCollectRecord.code;
const statusParent_COLLECT                      = collectFields.parentCollectRecord.options.true.label;
const fieldTotalBilledAmount_COLLECT            = collectFields.totalBilledAmount.code;
const tableCloudSignApplies_COLLECT             = collectFields.cloudSignApplies.code;
const tableFieldApplyRecordNoCS_COLLECT         = collectFields.cloudSignApplies.fields.applyRecordNoCS.code;
const tableFieldPaymentTimingCS_COLLECT         = collectFields.cloudSignApplies.fields.paymentTimingCS.code;
const tableFieldApplicantOfficialNameCS_COLLECT = collectFields.cloudSignApplies.fields.applicantOfficialNameCS.code;
const tableFieldReceivableCS_COLLECT            = collectFields.cloudSignApplies.fields.receivableCS.code;
const tableFieldPaymentDateCS_COLLECT           = collectFields.cloudSignApplies.fields.paymentDateCS.code;
const tableInvoiceTargets_COLLECT               = collectFields.invoiceTargets.code;
const tableFieldApplyRecordNoIV_COLLECT         = collectFields.invoiceTargets.fields.applyRecordNoIV.code;
const tableFieldPaymentTimingIV_COLLECT         = collectFields.invoiceTargets.fields.paymentTimingIV.code;
const tableFieldApplicantOfficialNameIV_COLLECT = collectFields.invoiceTargets.fields.applicantOfficialNameIV.code;
const tableFieldReceivableIV_COLLECT            = collectFields.invoiceTargets.fields.receivableIV.code;
const tableFieldPaymentDateIV_COLLECT           = collectFields.invoiceTargets.fields.paymentDateIV.code;
const tableFieldBackRateIV_COLLECT              = collectFields.invoiceTargets.fields.backRateIV.code;
const tableFieldActuallyOrdererIV_COLLECT       = collectFields.invoiceTargets.fields.actuallyOrdererIV.code;
const fieldInvoicePdfDate_COLLECT               = collectFields.invoicePdfDate.code;
const labelInvoicePdfDate_COLLECT               = collectFields.invoicePdfDate.label;
const statusInvoiceTarget_COLLECT = collectFields.collectStatus.options.振込依頼書作成対象.label;


const ExtensibleCustomError = require("extensible-custom-error");
export class UndefinedPdfDateError extends ExtensibleCustomError { }

export async function getAggregatedParentRecords(records) {
    console.log("振込依頼書作成対象のレコードを締日と工務店IDごとにまとめ、明細の情報を親に集約する");
    // まず工務店IDと締日だけ全て抜き出す
    const pairs = records.map((record) => {
        return {
            id: record[fieldConstructionShopId_COLLECT]["value"],
            date: record[fieldClosingDate_COLLECT]["value"]
        };
    });

    // 抜き出した工務店IDと締日のペアについて、重複なしのリストを作る。
    const unique_key_pairs = getUniqueCombinations(pairs, Object.keys(pairs[0]));

    // 軽バン.com案件は別集計する
    const target_pairs = unique_key_pairs.filter((p) => !isKeban(p.id));

    // 親レコード更新用のオブジェクトを作成
    const excludeKebanTargets = (await asyncMap(target_pairs, async (pair) => {
        // 振込依頼書をまとめるべき回収レコードを配列としてグループ化
        const invoice_group = records.filter((record) => {
            return record[fieldConstructionShopId_COLLECT]["value"] === pair.id
                && record[fieldClosingDate_COLLECT]["value"] === pair.date;
        });

        const parent_record = invoice_group.reduce(returnEarlyRecord);
        const invoice_targets = await asyncFlatMap(invoice_group, convertToKintoneSubTableObject);
        const total_billed = ((constructor_id) => {
            if (isGigConstructorID(constructor_id)) {
                // GIGの場合、「早払いの申込ごとに」特定のバック金額を引いた後の金額を合計したものを振込依頼書の請求金額とする。
                // その関係でinvoice_group ではなく invoice_targetsを元に計算する。
                return invoice_targets.reduce(sumGigInvoiceBills, 0);
            } else {
                // GIG以外の場合、単純にクラウドサインで送信した金額を合計して振込依頼書の請求金額とすれば良い。
                return invoice_group.reduce(sumInvoiceBills, 0);
            }
        })(parent_record[fieldConstructionShopId_COLLECT]["value"]);
        const pdfDate = getPdfDate(parent_record[fieldRecordId_COLLECT]["value"], invoice_group);
        if (!pdfDate) return null; // 外側のfilterで弾く

        // apiに渡すためにオブジェクトの構造を整える
        return getUpdateRecordObject(
            parent_record[fieldRecordId_COLLECT]["value"],
            total_billed,
            invoice_targets,
            pdfDate
        );
    })).filter((t) => Boolean(t));

    const kebanTargets = await (async (records, unique_key_pairs) => {
        if (!shouldIncludeKebanRecords(unique_key_pairs)) {
            return [];
        }

        const ke_ban_records = records.filter((r) => isKeban(r[fieldConstructionShopId_COLLECT]["value"]));

        const closing_months = Array.from(new Set(ke_ban_records
            // 締め日フィールドの年月ごとにまとめる
            .map((r) => dayjs(r[fieldClosingDate_COLLECT]["value"]).format("YYYY-MM")))
        );

        const update_targets_keban = (await asyncMap(closing_months, async (closing) => {
            const invoice_group = ke_ban_records.filter((r) => {
                return dayjs(r[fieldClosingDate_COLLECT]["value"]).format("YYYY-MM") === closing;
            });

            if (invoice_group.length <= 3) {
                // 同月内の回収レコードが3つ以下は操作ミスの可能性が高い
                const msg = `WFIの${closing.slice(-2)}月の振込依頼書作成対象レコードが${invoice_group.length}つしかありません。\n`
                    + `（締め日: ${invoice_group.map((r) => r[fieldClosingDate_COLLECT]["value"]).join(", ")}）\n`
                    + "このまま振込依頼書を作成してよろしいですか？\n\n"
                    + `振込依頼書の作成対象レコードを追加する場合、①キャンセルを押して、②レコードの状態を${statusInvoiceTarget_COLLECT}に更新してください`;
                const resume = confirm(msg);

                if (!resume) return false;
            }

            const parent_record = invoice_group.reduce(returnEarlyRecord);
            const invoice_targets = await asyncFlatMap(invoice_group, convertToKintoneSubTableObject);
            const total_billed = invoice_group.reduce(sumInvoiceBills, 0);
            const pdfDate = getPdfDate(parent_record[fieldRecordId_COLLECT]["value"], invoice_group);
            if (!pdfDate) return null; // 外側のfilterで弾く

            return getUpdateRecordObject(
                parent_record[fieldRecordId_COLLECT]["value"],
                total_billed,
                invoice_targets,
                pdfDate
            );
        })).filter((t) => Boolean(t));

        return update_targets_keban;
    })(records, unique_key_pairs);

    return excludeKebanTargets.concat(kebanTargets);
}

// 軽バン.com案件は、実行済みの回収レコードがあっても常に振込依頼書を作成するわけではない。
// 月ごとの最後の実行後に、ひと月ぶん全てまとめて振込依頼書を作成するのが基本。
// 月ごとの最後の実行日を厳密に計算するのは煩雑になるため、最短の申込締切日(26日)〜振込依頼書送信期日（翌月第2週……遅くとも8日）までの場合のみ振込依頼書を作成できる仕様とした。
const shouldIncludeKebanRecords = (pairs) => {
    // 開発版アプリの場合は今日として扱う日付を指定可能
    const today = detectApp(kintone.app.getId()) === "dev"
        ? dayjs(prompt("今日の日付：YYYY-MM-DD"))
        : dayjs();

    const canMakeKebanInvoiceTerm = (today) => today.date() > 26 || today.date() < 8;
    const includedKebanRecords = pairs.some((p) => isKeban(p.id));

    const shouldInclude = (canMake) => {
        if (canMake) {
            const message = `${KE_BAN_PRODUCT_NAME}の回収レコードについて振込依頼書を作成しますか？\n`
                + "\n"
                + "はい→全てのレコードの振込依頼書を作成\n"
                + `いいえ→${KE_BAN_PRODUCT_NAME}以外の回収レコードのみ振込依頼書を作成`;
            return confirm(message);
        } else {
            return false;
        }
    };

    return shouldInclude(includedKebanRecords && canMakeKebanInvoiceTerm(today));
};

// 振込依頼書が同一となる回収レコードのグループに対する各種処理----------------------------------------
const returnEarlyRecord = (a, b) => {
    // グループの中でレコード番号が最も小さいもの一つを親と決める
    if (Number(a[fieldRecordId_COLLECT]["value"]) < Number(b[fieldRecordId_COLLECT]["value"])) {
        return a;
    } else {
        return b;
    }
};

// 振込依頼書に記載する合計額
const sumInvoiceBills = (total, record) => total + Number(record[fieldCollectableAmount_COLLECT]["value"]);
const sumGigInvoiceBills = (total, subRecord) => {
    const applied_amount = Number(subRecord["value"][tableFieldReceivableIV_COLLECT]["value"]);
    const back_rate = Number(subRecord["value"][tableFieldBackRateIV_COLLECT]["value"]);
    const back_amount = (new Decimal(applied_amount)).times(back_rate).floor().toNumber();
    const remain = applied_amount - back_amount;
    return total + remain;
};

const convertToKintoneSubTableObject = async (record) => {
    // グループの情報を親に集約。クラウドサイン用の情報とは別に保持するため、親の振込依頼書用サブテーブルに親自身のクラウドサイン用サブテーブルのレコードも加える。
    // 振込依頼書に記載する申込レコード一覧（グループ化した回収レコードそれぞれの、クラウドサイン用サブテーブルに入っている申込レコードのunion）
    // サブテーブルのUpdateをするにあたって、サブテーブルのレコードそれぞれのオブジェクトの構造を整える
    const for_cloudsign_sub_records = record[tableCloudSignApplies_COLLECT]["value"];
    const for_invoice_sub_records = for_cloudsign_sub_records.map((sub_rec) => {
        return {
            "value": {
                [tableFieldApplyRecordNoIV_COLLECT]: {
                    "value": sub_rec["value"][tableFieldApplyRecordNoCS_COLLECT]["value"]
                },
                [tableFieldApplicantOfficialNameIV_COLLECT]: {
                    "value": sub_rec["value"][tableFieldApplicantOfficialNameCS_COLLECT]["value"]
                },
                [tableFieldReceivableIV_COLLECT]: {
                    "value": sub_rec["value"][tableFieldReceivableCS_COLLECT]["value"]
                },
                [tableFieldPaymentTimingIV_COLLECT]: {
                    "value": sub_rec["value"][tableFieldPaymentTimingCS_COLLECT]["value"]
                },
                [tableFieldPaymentDateIV_COLLECT]: {
                    "value": sub_rec["value"][tableFieldPaymentDateCS_COLLECT]["value"]
                }
            }
        };
    });

    // GIGの場合、Workship上で発注した企業から算出されるGIGへのバック手数料率を求めて追加する
    if (isGigConstructorID(record[fieldConstructionShopId_COLLECT]["value"])) {
        const apply_ids = for_invoice_sub_records.map((r) => r["value"][tableFieldApplyRecordNoIV_COLLECT]["value"]);
        const in_query_a = apply_ids.map((i) => `"${i}"`).join(",");
        const apply_body = {
            app: APP_ID_APPLY,
            fields: [
                fieldRecordId_APPLY,
                fieldConstructorId_APPLY
            ],
            query: `${fieldRecordId_APPLY} in (${in_query_a})`
        };
        const apply = await kintoneAPI.CLIENT.record.getRecords(apply_body);

        const constructor_ids = Array.from(new Set(apply.records.map((a) => a[fieldConstructorId_APPLY]["value"])));
        const in_query_c = constructor_ids.map((i) => `"${i}"`).join(",");
        const constructor_body = {
            app: APP_ID_CONSTRUCTOR,
            fields: [
                fieldConstructorId_CONSTRUCTOR,
                fieldConstructorName_CONSTRUCTOR,
                fieldTmpcommissionRate_CONSTRUCTOR
            ],
            query: `${fieldConstructorId_CONSTRUCTOR} in (${in_query_c})`
        };
        const constructor = await kintoneAPI.CLIENT.record.getRecords(constructor_body);

        // 申込レコード番号で工務店マスタの情報を参照できるobjectを作成する
        const id_map = {};
        apply.records.forEach((a) => {
            const c = constructor.records.find((r) => r[fieldConstructorId_CONSTRUCTOR]["value"] === a[fieldConstructorId_APPLY]["value"]);
            id_map[a[fieldRecordId_APPLY]["value"]] = {
                orderer: c[fieldConstructorName_CONSTRUCTOR]["value"],
                rate: c[fieldTmpcommissionRate_CONSTRUCTOR]["value"],
            };
        });

        // https://docs.google.com/presentation/d/11CYj7z-HJJGBnwL9o67HHfxk9cHYYXzektjPk6WUc3I/edit#slide=id.p1
        // 上記スライドに従って導出する
        const rate_table = {
            0.075: 0.025,
            0.06:  0.02,
            0.045: 0.015,
            0.016: 0,
        };

        for_invoice_sub_records.forEach((r) => {
            const constructor_master_rate = id_map[r["value"][tableFieldApplyRecordNoIV_COLLECT]["value"]].rate;
            const constructor_master_name = id_map[r["value"][tableFieldApplyRecordNoIV_COLLECT]["value"]].orderer;
            const rate = rate_table[constructor_master_rate];
            r["value"][tableFieldBackRateIV_COLLECT] = { value: rate };
            r["value"][tableFieldActuallyOrdererIV_COLLECT] = { value: constructor_master_name };
        });
    }
    return for_invoice_sub_records;
};

const getPdfDate = (parentId, invoice_group) => {
    const records = invoice_group.map((r) => {
        return {
            id: r[fieldRecordId_COLLECT]["value"],
            pdfDate: r[fieldInvoicePdfDate_COLLECT]["value"],
        };
    });

    try {
        return selectPdfDate({ parentId, records });
    } catch (e) {
        if (e instanceof UndefinedPdfDateError) {
            alert("次のどれかのレコードについて、"
                + `フィールド「${labelInvoicePdfDate_COLLECT}」を入力してください。\n\n`
                + `レコード番号: ${records.map((r) => r.id).join(", ")}`);
        } else {
            console.error(e);
            const additional_info = e.message ?? JSON.stringify(e);
            alert("途中で処理に失敗しました。システム管理者に連絡してください。"
                + "\n追加の情報: "
                + `\n${additional_info}`);
        }
        return null;
    }
};

/**
 * @typedef {Object} recordOfPdfDatePart
 * @property {number} id
 * @property {string} pdfDate - YYYY-MM-DD
 */

/**
 * @typedef {Object} pdfDateInfo
 * @property {number} [parentId]
 * @property {recordOfPdfDatePart[]} records - YYYY-MM-DD
 */

/**
* @summary 請求書としてまとめる複数の回収レコードのinvoicePdfDateの中から最終的にpdfに表示する日付を取得する。
* @param {pdfDateInfo} group - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @return {string} YYYY-MM-DD
*/
const selectPdfDate = (group) => {
    // 親レコードが確定している場合、そのレコードに記入している日付を返す
    const specifiedParentId = Boolean(group.parentId);
    const existsParentRecord = group.records
        .map((record) => record.id)
        .includes(group.parentId);
    const parentHasPdfDate = Boolean(
        group.records.find((r) => r.id === group.parentId).pdfDate
    );
    if (specifiedParentId && existsParentRecord && parentHasPdfDate) {
        // 正常系
        return group.records.find((record) => record.id === group.parentId).pdfDate;
    }

    // 親レコードが確定していない場合、groupのうち日付を記入済みのものの中で最もレコード番号が小さいものに記入している日付を返す
    const validRecords = group.records.filter((r) => Boolean(r.pdfDate));
    if (validRecords.length > 0) {
        return validRecords
            .reduce((acc, record) => {
                return acc.id < record.id
                    ? acc
                    : record;
            })
            .pdfDate;
    }

    // どのレコードにも日付を記入していない場合は突き返す
    throw new UndefinedPdfDateError();
};

const getUpdateRecordObject = (parentRecordId, total_billed, invoice_targets, pdfDate) => {
    return {
        "id": parentRecordId,
        "record": {
            [fieldParentCollectRecord_COLLECT]: {
                "value": [statusParent_COLLECT] // チェックボックス型は複数選択のフィールドなので配列で値を指定
            },
            [fieldTotalBilledAmount_COLLECT]: {
                "value": total_billed
            },
            [fieldInvoicePdfDate_COLLECT]: {
                "value": pdfDate
            },
            [tableInvoiceTargets_COLLECT]: {
                "value": invoice_targets
            }
        }
    };
};
// 振込依頼書が同一となる回収レコードのグループに対する各種処理 ここまで-----------------------------------
