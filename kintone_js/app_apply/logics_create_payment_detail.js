/* eslint-disable no-irregular-whitespace */
/*
    Version 2
    工務店に早払い上限回数が設定されている場合、
    明細本文内に上限回数と現在の早払い申込回数を付記するようにした。
    WFIおよびGIGは上限回数未設定のため、分岐処理なし

    Version 1.1
    支払予定明細の宛名部分の文面を変更。
    協力会社名(A)、代表者役職名(B)、代表者氏名(C)について、下記のように宛名を表記する。
    1. 基本は"A B C 様"と改行なしで表示。
    2. Bが空欄の場合、Bの後ろのスペースも削除する
    3. Cが空欄の場合、Cの後ろのスペースも削除する
    4. AとCが同じ場合（AおよびCが個人名と考えられるため）、"B C 様"と表示

    Version 1
    ボタンの定義ファイルからロジックの定義部分を分離
*/

"use strict";

const dayjs = require("dayjs");
dayjs.locale("ja");
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

import { get_contractor_name } from "../util/util_forms";
import { isGigConstructorID } from "../util/gig_utils";
import { KE_BAN_CONSTRUCTORS } from "../96/common";
import { CLIENT } from "../util/kintoneAPI";

// 本キャンペーンを打ち出してから最初に案内メールを送信する日
const HALF_COMMISION_START_DATE = dayjs("2020-12-17");
// 現状は終了日未定
const HALF_COMMISION_END_DATE = dayjs("9999-12-31");

const fieldRecordId_COMMON = "$id";

import { schema_apply } from "../161/schema";
const appId_APPLY                           = kintone.app.getId();
const fieldDetail_APPLY                     = schema_apply.fields.properties.paymentDetail.code;
export const fieldStatus_APPLY              = schema_apply.fields.properties.状態.code;
export const statusReady_APPLY              = schema_apply.fields.properties.状態.options.工務店確認済.label;
export const statusConfirming_APPLY         = schema_apply.fields.properties.状態.options.支払予定明細確認中.label;
export const statusConfirmed_APPLY          = schema_apply.fields.properties.状態.options.支払予定明細送信前確認完了.label;
const statusPaid_APPLY                      = schema_apply.fields.properties.状態.options.実行完了.label;
const fieldCustomerId_APPLY                 = schema_apply.fields.properties.ルックアップ.code;
const fieldCustomerCompanyName_APPLY        = schema_apply.fields.properties.支払先正式名称.code;
const fieldAddresseeName_APPLY              = schema_apply.fields.properties.担当者名.code;
const fieldAddresseeTitle_APPLY             = schema_apply.fields.properties.役職名.code;
const fieldProductName_APPLY                = schema_apply.fields.properties.productName.code;
const statusProductName_Lagless_APPLY       = "ラグレス";
const statusProductName_Dandori_APPLY       = "ダンドリペイメント";
const statusProductName_Renove_APPLY        = "リノベ不動産Payment";
const fieldClosingDate_APPLY                = schema_apply.fields.properties.closingDay.code;
const fieldPaymentDate_APPLY                = schema_apply.fields.properties.paymentDate.code;
const fieldBillingCompanyName_APPLY         = schema_apply.fields.properties.billingCompanyOfficialName.code;
const fieldApplicantAmount_APPLY            = schema_apply.fields.properties.applicationAmount.code;
const fieldMembershipFee_APPLY              = schema_apply.fields.properties.membership_fee.code;
const fieldTransferFee_APPLY                = schema_apply.fields.properties.transferFeeTaxIncl.code;
const fieldPaymentTiming_APPLY              = schema_apply.fields.properties.paymentTiming.code;
const statusUndefinedPayment_APPLY          = schema_apply.fields.properties.paymentTiming.options.未設定.label;
const statusEarlyPayment_APPLY              = schema_apply.fields.properties.paymentTiming.options.早払い.label;
const statusLatePayment_APPLY               = schema_apply.fields.properties.paymentTiming.options.遅払い.label;
const statusOriginalPayment_APPLY           = schema_apply.fields.properties.paymentTiming.options.通常払い.label;
const fieldCommissionRate_Late_APPLY        = schema_apply.fields.properties.commissionRate_late.code;
const fieldCommissionAmount_Late_APPLY      = schema_apply.fields.properties.commissionAmount_late.code;
const fieldTransferAmount_Late_APPLY        = schema_apply.fields.properties.transferAmount_late.code;
const fieldCommissionRate_Early_APPLY       = schema_apply.fields.properties.commissionRate.code;
const fieldCommissionAmount_Early_APPLY     = schema_apply.fields.properties.commissionAmount.code;
const fieldTransferAmount_Early_APPLY       = schema_apply.fields.properties.transferAmount.code;
const fieldCommissionRateEarlyFirst_APPLY   = schema_apply.fields.properties.commissionRateEarlyFirst.code;
const fieldCommissionAmountEarlyFirst_APPLY = schema_apply.fields.properties.commissionAmountEarlyFirst.code;
const fieldTransferAmountEarlyFirst_APPLY   = schema_apply.fields.properties.transferAmountEarlyFirst.code;
const fieldPaymentAccount_APPLY             = schema_apply.fields.properties.paymentAccount.code;
const fieldConstructorID_APPLY              = schema_apply.fields.properties.constructionShopId.code;
const fieldFactorableAmountPerDayWFI_APPLY  = schema_apply.fields.properties.factorableAmountPerDayWFI.code;
const fieldWorkedDaysWFI_APPLY              = schema_apply.fields.properties.workedDaysWFI.code;
const fieldFactorableTotalAmountWFI_APPLY   = schema_apply.fields.properties.factorableTotalAmountWFI.code;

const contractor_mail_lagless               = "lagless@invest-d.com";
const contractor_mail_dandori               = "d-p@invest-d.com";
const contractor_mail_renove                = "lagless@invest-d.com"; // ラグレスと同じ

import { schema_96 } from "../96/schema";
const APP_ID_CONSTRUCTOR                    = schema_96.id.appId;
const earlyPayLimitField_CONSTRUCTOR        = schema_96.fields.properties.applicationLimit.code;
const resetLimitField_CONSTRUCTOR           = schema_96.fields.properties.monthResetCount.code;
const fieldDaysLater_APPLY                  = schema_96.fields.properties.daysLater.code; //申込レコードには存在しないが、特定の場合に限り申込レコードに必要なフィールドとして擬似的に定義する

import { schema_88 } from "../88/schema";
const appId_KYORYOKU                        = schema_88.id.appId;
const kyoryokuIdField_KYORYOKU              = schema_88.fields.properties.支払企業No_.code;
const appliedCountField_KYORYOKU            = schema_88.fields.properties.numberOfApplication.code;

export const confirmBeforeExec = () => {
    const before_process = `${statusReady_APPLY}の各レコードについて、支払予定明細書を作成しますか？\n\n`
        + "※このボタンでは文面を作成するだけで、メールは送信されません。\n"
        + "※既に文面が作成済みでも、文面を削除してもう一度文面を作成・上書きします。";
    return window.confirm(before_process);
};

export const getGenerateTarget = () => {
    const body_generate_target = {
        app: appId_APPLY,
        query: `${fieldStatus_APPLY} in ("${statusReady_APPLY}")
            and ${fieldPaymentTiming_APPLY} not in ("${statusOriginalPayment_APPLY}")`
        // 通常払いは債権譲渡行為を伴わない単なる業務代行。従って支払予定明細を送信する必要がない。
    };

    return CLIENT.record.getRecords(body_generate_target);
};

export const getConstructors = () => {
    return CLIENT.record.getRecords({ app: APP_ID_CONSTRUCTOR });
};

async function attachDetail(target_records, constructors) {
    // エラーが発生した時、どのレコードで発生したかの情報をthrowするためのlet
    let error_num = 0;
    try {
        const processes = target_records.map(async (record) => {
            error_num = record[fieldRecordId_COMMON]["value"];

            const multiline_detail_text = await (async (record) => {
                const constructor_id = record[fieldConstructorID_APPLY]["value"];
                if (KE_BAN_CONSTRUCTORS.includes(constructor_id)) {
                    const display_record_data = getKebanDetailDisplayData(record);
                    return generateDetailTextKeban(display_record_data);
                } else if (isGigConstructorID(constructor_id)) {
                    // GIG(工務店ID 500番台 or 5000番台)は文面が異なる
                    return getGigPaymentDetail(record);
                } else {
                    return await getLaglessPaymentDetail(record, constructors);
                }
            })(record);

            const record_obj = {
                "id": record[fieldRecordId_COMMON]["value"],
                "record": {
                    [fieldDetail_APPLY]: {
                        "value": multiline_detail_text
                    },
                    [fieldStatus_APPLY]: {
                        "value": statusConfirming_APPLY
                    }
                }
            };

            return record_obj;
        });

        const result = await Promise.all(processes);
        return result;
    } catch(err) {
        console.error(err);
        throw new Error(`レコード番号${String(error_num)} を処理中にエラーが発生したため、処理を中断しました。\n`
        + "レコードの内容に不足がないかを確認してからもう一度やり直してください。\n\n"
        + `エラー内容：${err.message}`);
    }
}

export const generateDetails = (target_records, constructors) => {
    // 申込レコードに遅払い日数フィールドを紐付ける
    for (const apply of target_records) {
        const constructor = constructors.records.find((r) => r["id"]["value"] === apply[fieldConstructorID_APPLY]["value"]);

        if (!constructor) {
            const no_constructor = "申込レコードに対応する工務店レコードが見つかりませんでした。申込レコードに記入している工務店IDが正しいかどうか確認してください。\n"
            + "この申込レコードの処理をスキップし、残りのレコードについて処理を続けます。\n\n"
            + `申込レコード番号: ${apply[fieldRecordId_COMMON]["value"]}, 協力会社名: ${apply[fieldCustomerCompanyName_APPLY]["value"]}, 工務店ID: ${apply[fieldConstructorID_APPLY]["value"]}`;
            alert(no_constructor);
            return;
        }

        apply[fieldDaysLater_APPLY] = { "value": constructor[fieldDaysLater_APPLY]["value"] };
    }

    // 支払明細を各レコードにセット
    return attachDetail(target_records, constructors.records);
};

const getFormattedYYYYMMDD = (kintone_date_value) => {
    // YYYY年MM月DD日のフォーマットで返す
    return `${kintone_date_value.split("-")[0]}年${kintone_date_value.split("-")[1]}月${kintone_date_value.split("-")[2]}日`;
};

const getGigPaymentDetail = (record) => {
    // GIG案件のファクタリング支払予定明細の本文を取得する
    const kyoryoku_company_name         = record[fieldCustomerCompanyName_APPLY]["value"];
    const kyoryoku_ceo_name             = record[fieldAddresseeName_APPLY]["value"];
    const kyoryoku_ceo_title            = record[fieldAddresseeTitle_APPLY]["value"];
    const closing_YYYYnenMMgatsuDDhi    = getFormattedYYYYMMDD(record[fieldClosingDate_APPLY]["value"]);
    const payment_YYYYnenMMgatsuDDhi    = getFormattedYYYYMMDD(record[fieldPaymentDate_APPLY]["value"]);
    const billing_amount                = record[fieldApplicantAmount_APPLY]["value"];
    const transfer_fee_tax_incl         = record[fieldTransferFee_APPLY]["value"];

    const service_fees = {
        fee_rate: record[fieldCommissionRate_Early_APPLY]["value"],
        fee_amount: record[fieldCommissionAmount_Early_APPLY]["value"],
        transfer_amount: record[fieldTransferAmount_Early_APPLY]["value"],
    };

    const apply_info = {
        addressee_name:                 getAddresseeName(kyoryoku_company_name, kyoryoku_ceo_title, kyoryoku_ceo_name),
        closing_YYYYnenMMgatsuDDhi:     closing_YYYYnenMMgatsuDDhi,
        payment_YYYYnenMMgatsuDDhi:     payment_YYYYnenMMgatsuDDhi,
        billing_amount_comma:           addComma(billing_amount),
        commission_percentage:          Number(service_fees.fee_rate) * 100,
        commission_amount_comma:        addComma(service_fees.fee_amount),
        transfer_fee_tax_incl_comma:    addComma(transfer_fee_tax_incl),
        transfer_amount_of_money_comma: addComma(service_fees.transfer_amount),
    };

    return generateGigDetailText(apply_info);
};

function generateGigDetailText(apply_info) {
    // 行ごとに配列で格納し、最後に改行コードでjoinする
    const text = [
        `${apply_info.addressee_name}様`,
        "",
        "この度は、Workship前払いオプションのお申込みありがとうございます。",
        "下記のとおり受付いたしましたので、お知らせいたします。",
        "",
        `対象となる締め日：${apply_info.closing_YYYYnenMMgatsuDDhi}`,
        "",
        // eslint-disable-next-line no-irregular-whitespace
        `お振込予定日　　：${apply_info.payment_YYYYnenMMgatsuDDhi}`,
        "",
        "※天災、通信インフラの故障及びその他の事象により、実行日が遅れる可能性がございます。",
        "",
        "",
        // 請求の宛先はGIG固定になる
        // eslint-disable-next-line no-irregular-whitespace
        `株式会社ＧＩＧ宛 請求金額（税込）①　${apply_info.billing_amount_comma}円`,
        // eslint-disable-next-line no-irregular-whitespace
        `前払いオプション利用手数料 ①×${apply_info.commission_percentage}％　-${apply_info.commission_amount_comma}円`,
        // eslint-disable-next-line no-irregular-whitespace
        `振込手数料（お客様負担）　-${apply_info.transfer_fee_tax_incl_comma}円`,
        "──────────────────────────────",
        // eslint-disable-next-line no-irregular-whitespace
        `お振込み予定金額　${apply_info.transfer_amount_of_money_comma}円`,
        "",
        "",
        "",
        "ご不明な点などがございましたら、",
        "下記連絡先までお問い合わせください。",
        "",
        "──────────────────────────────■",
        "Workship 運命の仕事相手がみつかるスキルシェアサービス",
        "https://goworkship.com/",
        "",
        "【Workship前払い】",
        "ラグレス2合同会社",
        "運営会社 : インベストデザイン株式会社",
        "Mail：factoring@goworkship.com",
        "TEL：050-3188-6800",
        "営業時間 : 10時〜18時(平日のみ)",
        "──────────────────────────────■",
        ""
    ];

    return text.join("\r\n");
}

const getLaglessPaymentDetail = async (record, constructors) => {
    // ラグレスのファクタリング支払予定明細の本文を取得する
    const kyoryoku_company_name         = record[fieldCustomerCompanyName_APPLY]["value"];
    const kyoryoku_ceo_name             = record[fieldAddresseeName_APPLY]["value"];
    const kyoryoku_ceo_title            = record[fieldAddresseeTitle_APPLY]["value"];
    const product_name                  = record[fieldProductName_APPLY]["value"];
    const closing_YYYYnenMMgatsuDDhi    = getFormattedYYYYMMDD(record[fieldClosingDate_APPLY]["value"]);
    const payment_YYYYnenMMgatsuDDhi    = getFormattedYYYYMMDD(record[fieldPaymentDate_APPLY]["value"]);
    const construction_shop_name        = record[fieldBillingCompanyName_APPLY]["value"];
    const billing_amount                = record[fieldApplicantAmount_APPLY]["value"];
    const membership_fee                = record[fieldMembershipFee_APPLY]["value"];
    const transfer_fee_tax_incl         = record[fieldTransferFee_APPLY]["value"];
    const timing                        = record[fieldPaymentTiming_APPLY]["value"];

    const should_discount_for_first = await (async (kyoryoku_id) => {
        // 210001: ペテロ組については申込レコードに記録がないが、実行した履歴が残っている（boxファイルで履歴を確認）
        const special_paid_kyoryoku_ids = [
            "210001"
        ];
        if (special_paid_kyoryoku_ids.includes(kyoryoku_id)) {
            return false;
        }

        if (dayjs().isBetween(HALF_COMMISION_START_DATE, HALF_COMMISION_END_DATE, null, "[]")) {
            // キャンペーン期間中の場合、申込アプリの実行済みレコードを検索。0件 or 1件以上
            // ファクタリングを実行したレコードだけを対象にするので、通常払いは除外する
            const body = {
                app: kintone.app.getId(),
                query: `${fieldCustomerId_APPLY} = "${kyoryoku_id}"
                            and ${fieldStatus_APPLY} in ("${statusPaid_APPLY}")
                            and ${fieldPaymentTiming_APPLY} not in ("${statusOriginalPayment_APPLY}")`
            };
            const past_apply = await CLIENT.record.getRecords(body);
            return past_apply.records.length === 0;
        } else {
            return false;
        }
    })(record[fieldCustomerId_APPLY]["value"]);

    const service_fees = ((timing, should_discount_for_first) => {
        let commission_rate;
        let commission_amount;
        let transfer_amount_of_money;
        if (timing === statusLatePayment_APPLY) {
            commission_rate = record[fieldCommissionRate_Late_APPLY]["value"];
            commission_amount = record[fieldCommissionAmount_Late_APPLY]["value"];
            transfer_amount_of_money = record[fieldTransferAmount_Late_APPLY]["value"];
        } else {
            // 通常払いレコードはそもそも処理対象外なので考慮しない
            if (should_discount_for_first) {
                commission_rate = record[fieldCommissionRateEarlyFirst_APPLY]["value"];
                commission_amount = record[fieldCommissionAmountEarlyFirst_APPLY]["value"];
                transfer_amount_of_money = record[fieldTransferAmountEarlyFirst_APPLY]["value"];
            } else {
                commission_rate = record[fieldCommissionRate_Early_APPLY]["value"];
                commission_amount = record[fieldCommissionAmount_Early_APPLY]["value"];
                transfer_amount_of_money = record[fieldTransferAmount_Early_APPLY]["value"];
            }
        }

        return {
            fee_rate: commission_rate,
            fee_amount: commission_amount,
            transfer_amount: transfer_amount_of_money,
        };
    })(timing, should_discount_for_first);

    const sender_mail = {
        [statusProductName_Lagless_APPLY]: contractor_mail_lagless,
        [statusProductName_Dandori_APPLY]: contractor_mail_dandori,
        [statusProductName_Renove_APPLY]: contractor_mail_renove
    }[product_name];

    if (!sender_mail) {
        // 3種類以外の商品名だったとき
        throw new Error(`不明な商品名です: ${product_name}`);
    }

    // 支払元口座と新ラグレス契約状況の2要素によって会社名を変更する
    let contractor_name;
    try {
        contractor_name = get_contractor_name(
            record[fieldPaymentAccount_APPLY]["value"],
            record[fieldDaysLater_APPLY]["value"],
            record[fieldConstructorID_APPLY]["value"]
        );
    } catch (e) {
        if (e instanceof TypeError) {
            throw new Error("会社名を確定できませんでした。\n"
                        + "【支払元口座】および【遅払い日数】を工務店マスタに正しく入力してください。\n\n"
                        + `工務店ID：${record[fieldConstructorID_APPLY]["value"]}\n`
                        + `工務店名：${record[fieldBillingCompanyName_APPLY]["value"]}`);
        } else {
            throw new Error(`不明なエラーです。追加の情報：${e}`);
        }
    }

    const apply_info = {
        timing:                         timing,
        addressee_name:                 getAddresseeName(kyoryoku_company_name, kyoryoku_ceo_title, kyoryoku_ceo_name),
        product_name:                   product_name,
        closing_YYYYnenMMgatsuDDhi:     closing_YYYYnenMMgatsuDDhi,
        payment_YYYYnenMMgatsuDDhi:     payment_YYYYnenMMgatsuDDhi,
        construction_shop_name:         construction_shop_name,
        billing_amount_comma:           addComma(billing_amount),
        membership_fee_comma:           addComma(membership_fee),
        commission_percentage:          Number(service_fees.fee_rate) * 100,
        commission_amount_comma:        addComma(service_fees.fee_amount),
        transfer_fee_tax_incl_comma:    addComma(transfer_fee_tax_incl),
        transfer_amount_of_money_comma: addComma(service_fees.transfer_amount),
        contractor_name:                contractor_name,
        sender_mail:                    sender_mail,
        kyoryoku_id:                    record[fieldCustomerId_APPLY]["value"]
    };

    const kyoryoku_master = await CLIENT.record.getRecords({
        app: appId_KYORYOKU,
        fields: [appliedCountField_KYORYOKU],
        query: `${kyoryokuIdField_KYORYOKU} = ${Number(record[fieldCustomerId_APPLY]["value"])}`
    });
    const applied_count = Number(kyoryoku_master.records[0][appliedCountField_KYORYOKU]["value"]);

    const constructor = constructors.find((c) => c["id"]["value"] === record[fieldConstructorID_APPLY]["value"]);
    return generateLaglessDetailText(apply_info, should_discount_for_first, constructor, applied_count);
};

const deleteSpaces = (s) => {return s.replace(/ /g, "").replace(/　/g, "");};

const getAddresseeName = (company, title, name) => {
    const display_company = ((company, name) => {
        // 一致する場合は重複しないように会社名を非表示にする
        if (deleteSpaces(company) === deleteSpaces(name)) {
            return "";
        } else {
            return `${company} `; // 半角スペース追加
        }
    })(company, name);

    const display_title = deleteSpaces(title) === ""
        ? ""
        : `${title} `;

    const display_name = deleteSpaces(name) === ""
        ? ""
        : `${name} `;

    return `${display_company}${display_title}${display_name}`;
};

async function generateLaglessDetailText(apply_info, should_discount_for_first, constructor, applied_count) {
    const fee_sign = apply_info.timing === statusLatePayment_APPLY
        ? "+"
        : "-";

    // eslint-disable-next-line no-irregular-whitespace
    let service_fee = `${apply_info.product_name}　利用手数料【（①+②）×${apply_info.commission_percentage}％】　${fee_sign}${apply_info.commission_amount_comma}円`;
    if (should_discount_for_first) {
        service_fee = service_fee.concat(" ※【初回申込限定】利用手数料半額キャンペーンが適用されました");
    }

    // 行ごとに配列で格納し、最後に改行コードでjoinする
    const former_part = [
        `${apply_info.addressee_name}様`,
        "",
        `この度は、${apply_info.product_name}のお申込みありがとうございます。`,
        "下記のとおり受付いたしましたので、お知らせいたします。",
        "",
        `対象となる締め日：${apply_info.closing_YYYYnenMMgatsuDDhi}`,
        "",
        // eslint-disable-next-line no-irregular-whitespace
        `お振込予定日　　：${apply_info.payment_YYYYnenMMgatsuDDhi}`,
        "─────────────────",
        "",
        "※債権譲渡登記をされている法人様は、ご利用をお断りさせていただきます。",
        "※天災、通信インフラの故障及びその他の事象により、実行日が遅れる可能性がございます。",
        "※お申し込み受付後は、原則お振込日の変更ができかねます。",
        "",
        "",
        // eslint-disable-next-line no-irregular-whitespace
        `${apply_info.construction_shop_name}宛 請求金額（税込）①　${apply_info.billing_amount_comma}円`,
        "",
        // eslint-disable-next-line no-irregular-whitespace
        `差引額（協力会費・立替金等）②　-${apply_info.membership_fee_comma}円`, //ゼロ円であっても -0円 表記
        "",
        service_fee,
        "",
        // eslint-disable-next-line no-irregular-whitespace
        `振込手数料（貴社負担）　-${apply_info.transfer_fee_tax_incl_comma}円`,
        "──────────────────────────────",
        // eslint-disable-next-line no-irregular-whitespace
        `当社から貴社へのお振込み予定金額　${apply_info.transfer_amount_of_money_comma}円`,
        "",
    ];

    const getFactoringLimitText = async (apply_info, constructor, applied_count) => {
        const limit = constructor[earlyPayLimitField_CONSTRUCTOR]["value"]
            ? Number(constructor[earlyPayLimitField_CONSTRUCTOR]["value"])
            : 0;
        if (limit === 0 || apply_info.timing === statusLatePayment_APPLY)  return "";

        const limit_text = `■年間利用上限回数　${limit}回`;
        const reset_month = constructor[resetLimitField_CONSTRUCTOR]["value"]
            ? Number(constructor[resetLimitField_CONSTRUCTOR]["value"])
            : 0;

        // カウント対象となっている期間と、次回申込可能になる月（カウントが1以上減少する月）を求める
        const {
            term_start,
            term_end,
            next_applicable
        } = await (async (reset_month, kyoryoku_id, limit) => {
            const result = {
                term_start: null,
                term_end: null,
                next_applicable: null
            };

            if (reset_month > 0) {
                const today = dayjs();
                let next_applicable = today;
                while (next_applicable.month()+1 !== reset_month) {
                    next_applicable = next_applicable.add(1, "month");
                }

                result.term_start       = next_applicable.subtract(1, "year");
                result.term_end         = next_applicable.subtract(1, "month");
                result.next_applicable  = next_applicable;
            } else {
                // 直近1年間のカウントの場合
                // 次回申込可能な月は、締め日が新しい方から(年間回数制限)番目のレコードの締め日の1年後の締め日の月とする。
                // カウント期間内の最古の申込を計算に使ってしまうと、回数制限を超えているけど特例で申込を受け付けたというパターンに対応できない
                const body = {
                    app: appId_APPLY,
                    query: `${fieldCustomerId_APPLY} = ${kyoryoku_id}\
                        and ${fieldPaymentTiming_APPLY} in ("${statusUndefinedPayment_APPLY}","${statusEarlyPayment_APPLY}")\
                        and ${fieldStatus_APPLY} in ("${statusPaid_APPLY}")\
                        and ${fieldClosingDate_APPLY} >= "${dayjs().subtract(1, "year").format("YYYY-MM-DD")}"\
                        and ${fieldClosingDate_APPLY} <= "${dayjs().format("YYYY-MM-DD")}"`
                };
                const early_paid_applies = await CLIENT.record.getRecords(body);
                const applied_closings = early_paid_applies
                    .records
                    .map((a) => dayjs(a[fieldClosingDate_APPLY]["value"]))
                    .sort((closing_a, closing_b) => closing_b.unix() - closing_a.unix()); //締日降順
                if (applied_closings.length >= limit) {
                    // 申込回数が上限回数に達していない場合はnext_applicableを文面に表示しないので、セットする必要もない
                    result.next_applicable = applied_closings[limit-1].add(1, "year");
                }
                result.term_start = dayjs().subtract(1, "year");
                result.term_end = dayjs();
            }

            return result;
        })(reset_month, apply_info.kyoryoku_id, limit);
        const count_text = `■お客様の早払い利用回数　${applied_count}回（${term_start.format("YYYY年MM月")}〜${term_end.format("YYYY年MM月")}までの申込回数）`;

        const result_text = [limit_text, count_text];
        if (applied_count >= limit) { // 上限回数を超えて申込を受け付けるパターンもある
            result_text.push(`■次回申込可能時期　${next_applicable.format("YYYY年MM月")}締め以降の請求書発行時`);
        }

        return result_text.join("\r\n");
    };
    const limit_text = await getFactoringLimitText(apply_info, constructor, applied_count);
    former_part.push(limit_text);

    const text = former_part.concat([
        "",
        "ご不明な点などがございましたら、",
        "下記連絡先までお問い合わせください。",
        "",
        "──────────────────────────────■",
        `【${apply_info.product_name}事務局】`,
        apply_info.contractor_name,
        "東京都千代田区神田神保町三丁目5番地 住友不動産九段下ビル7F",
        `Mail：${apply_info.sender_mail}`,
        "TEL：050-3188-6800",
        "──────────────────────────────■",
        ""
    ]);

    return text.join("\r\n");
}

const getKebanDetailDisplayData = (record) => {
    // 明細に表示するため、レコードの情報を各種加工する
    const getKebanApplyableTerm = (closing_date) => {
        // 締日を元に、申込可能な五十日の期間の開始日と終了日を求めて返す。
        // 開始日は常に締日（＝期間の終了日）の4日前
        return {
            start: dayjs(closing_date).subtract(4, "day"),
            end: dayjs(closing_date)
        };
    };

    const term = getKebanApplyableTerm(record[fieldClosingDate_APPLY]["value"]);

    return {
        addressee_name:                     getAddresseeName(record[fieldCustomerCompanyName_APPLY]["value"], record[fieldAddresseeTitle_APPLY]["value"], record[fieldAddresseeName_APPLY]["value"]),
        closing_YYYYnenMMgatsuDDhi:         `${term.start.format("YYYY年MM月DD日")}〜${term.end.format("YYYY年MM月DD日")}`,
        payment_YYYYnenMMgatsuDDhi:         `${dayjs(record[fieldPaymentDate_APPLY]["value"]).format("YYYY年MM月DD日")}`,
        factorableAmountPerDayWFI_comma:    addComma(record[fieldFactorableAmountPerDayWFI_APPLY]["value"]),
        workedDaysWFI:                      record[fieldWorkedDaysWFI_APPLY]["value"],
        factorableTotalAmountWFI_comma:     addComma(record[fieldFactorableTotalAmountWFI_APPLY]["value"]),
        commissionRate_percent:             Number(record[fieldCommissionRate_Early_APPLY]["value"]) * 100,
        commissionAmount_comma:             addComma(record[fieldCommissionAmount_Early_APPLY]["value"]),
        transferFeeTaxIncl_comma:           addComma(record[fieldTransferFee_APPLY]["value"]),
        transferAmount_comma:               addComma(record[fieldTransferAmount_Early_APPLY]["value"]),
    };
};

// 軽バン.com用の支払予定明細を入力する
const generateDetailTextKeban = (apply_info) => {
    const text = [
        `${apply_info.addressee_name}様`,
        "",
        "この度は、軽バン .com【売上前払いシステム】のお申込みありがとうございます。",
        "下記のとおり受付いたしましたので、お知らせいたします。",
        "",
        "",
        `対象となる稼働期間：${apply_info.closing_YYYYnenMMgatsuDDhi}`,
        "",
        `お振込予定日　　　：${apply_info.payment_YYYYnenMMgatsuDDhi}`,
        "",
        "",
        "※天災、通信インフラの故障及びその他の事象により、実行日が遅れる可能性がございます。",
        "",
        "",
        "",
        `前払い可能単価（税込）　　　　　　①　${apply_info.factorableAmountPerDayWFI_comma}円`,
        `稼働日数　　　　　　　　　　　　　②　${apply_info.workedDaysWFI}日`,
        `前払い対象金額（①×②）　　　　　③　${apply_info.factorableTotalAmountWFI_comma}円`,
        `前払いシステム利用手数料率　　　　④　${apply_info.commissionRate_percent}％`,
        `前払いシステム利用手数料（③×④）⑤　${apply_info.commissionAmount_comma}円`,
        `振込手数料（お客様負担）　　　　　⑥　${apply_info.transferFeeTaxIncl_comma}円`,
        "───────────────────────────────────",
        `お振込み予定金額　（③ - ⑤ - ⑥）　${apply_info.transferAmount_comma}円`,
        "",
        "",
        "",
        "ご不明な点などがございましたら、",
        "下記連絡先までお問い合わせください。",
        "",
        "──────────────────────────────────────■",
        "【軽バン .com前払い事務局】",
        "ファクタリング実行会社：ラグレス2合同会社",
        "システム運営会社：インベストデザイン株式会社",
        "MAIL：lagless+keban@invest-d.com（インベストデザイン株式会社）",
        "TEL：050-3188-8481",
        "営業時間 : 10時〜17時(平日のみ)",
        "──────────────────────────────────────■",
    ];

    return text.join("\r\n");
};

function addComma(num) {
    // 数字に3桁区切りのコンマを挿入した文字列を返す。整数のみ考慮
    return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
}

export const updateRecords = (records_with_detail) => {
    // セットした内容でPUT
    const put_params = {
        app: kintone.app.getId(),
        records: records_with_detail
    };

    return CLIENT.record.updateRecords(put_params);
};
