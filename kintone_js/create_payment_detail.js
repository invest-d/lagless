/* eslint-disable no-irregular-whitespace */
/*
    Version 4
    工務店が軽バン.comの場合に専用の明細内容へ変更する処理を追加

    Version 3.1
    初回申込に対する振込手数料率半額CPに対応。

    Version 3
    支払予定明細のメール文面を作成する機能と、作成されたメール文面を送信する機能を別ファイルに分離した。
    本ファイルはメール文面を作成する機能だけについて引き続き責務を負う。
    上述機能の分離先ファイルについてはGitのコミットログを参照。

    また、申込レコードの状態フィールドを新規追加。
    工務店確認済→（文面作成・自動更新）→支払予定明細確認中→（目視確認・手動更新）→支払予定明細送信前確認完了
    という流れを踏む。
    そのため、以前のバージョンとは次のような違いが生じている。
    - 「送信日時」が記入済みのレコードは文面作成対象外としていたが、本バージョンからは「送信日時」に関わらず「状態」フィールドが工務店確認済かどうかだけを見るようになった。
    - 文面を既に作成しているレコードは文面作成対象外としていたが、本バージョンからは文面の作成状態に関わらず「状態」フィールドが工務店確認済かどうかだけを見るようになった。

    Version 2.1
    支払予定明細送信対象のレコード条件を変更。
    旧: 状態フィールドが「ID確認済」
    新: 状態フィールドが「工務店確認済」

    Version 2
    申し込みレコードが遅払いの場合に対応。
    文面に出力する金額を変更する他、手数料の±符号の切り替えも行う。

    Version 1.1
    支払明細書を作成したあとに続けてメール送信のリクエストも行う。
    メール送信の処理自体はherokuで行っている。

    Version 1
    LAGLESS2020開発テーブルにコントロールを一つ追加する。
        - 支払明細書一括作成ボタン
    ボタンをクリックしたとき、申込アプリのレコードの中で、
    状態が「ID確認済」かつ、送信日時と明細書本文がまだブランクのレコードについて、
    明細書テンプレートを元に支払明細書のメール文面を作成し、
    当該フィールドにその本文を保存する。
*/

const dayjs = require("dayjs");
dayjs.locale("ja");
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
import { get_contractor_name } from "./util_forms";
import { KE_BAN_CONSTRUCTORS } from "./96/common";

(function() {
    "use strict";

    // 本キャンペーンを打ち出してから最初に案内メールを送信する日
    const HALF_COMMISION_START_DATE = dayjs("2020-12-17");
    // 現状は終了日未定
    const HALF_COMMISION_END_DATE = dayjs("9999-12-31");

    const button_name = "createPaymentDetail";
    const button_title = "支払予定明細の本文を一括作成";
    const nextActionButtonTitle = "支払予定明細一括送信";

    const fieldRecordId_COMMON = "$id";

    const fieldDetail_APPLY                     = "paymentDetail";
    const fieldStatus_APPLY                     = "状態";
    const statusReady_APPLY                     = "工務店確認済";
    const statusConfirming_APPLY                = "支払予定明細確認中";
    const statusConfirmed_APPLY                 = "支払予定明細送信前確認完了";
    const statusPaid_APPLY                      = "実行完了";
    const fieldCustomerId_APPLY                 = "ルックアップ";
    const fieldCustomerCompanyName_APPLY        = "支払先正式名称";
    const fieldAddresseeName_APPLY              = "担当者名";
    const fieldAddresseeTitle_APPLY             = "役職名";
    const fieldProductName_APPLY                = "productName";
    const statusProductName_Lagless_APPLY       = "ラグレス";
    const statusProductName_Dandori_APPLY       = "ダンドリペイメント";
    const statusProductName_Renove_APPLY        = "リノベ不動産Payment";
    const fieldClosingDate_APPLY                = "closingDay";
    const fieldPaymentDate_APPLY                = "paymentDate";
    const fieldDaysLater_APPLY                  = "daysLater";
    const fieldBillingCompanyName_APPLY         = "billingCompanyOfficialName";
    const fieldApplicantAmount_APPLY            = "applicationAmount";
    const fieldMembershipFee_APPLY              = "membership_fee";
    const fieldTransferFee_APPLY                = "transferFeeTaxIncl";
    const fieldPaymentTiming_APPLY              = "paymentTiming";
    const statusLatePayment_APPLY               = "遅払い";
    const statusOriginalPayment_APPLY           = "通常払い";
    const fieldCommissionRate_Late_APPLY        = "commissionRate_late";
    const fieldCommissionAmount_Late_APPLY      = "commissionAmount_late";
    const fieldTransferAmount_Late_APPLY        = "transferAmount_late";
    const fieldCommissionRate_Early_APPLY       = "commissionRate";
    const fieldCommissionAmount_Early_APPLY     = "commissionAmount";
    const fieldTransferAmount_Early_APPLY       = "transferAmount";
    const fieldCommissionRateEarlyFirst_APPLY   = "commissionRateEarlyFirst";
    const fieldCommissionAmountEarlyFirst_APPLY = "commissionAmountEarlyFirst";
    const fieldTransferAmountEarlyFirst_APPLY   = "transferAmountEarlyFirst";
    const fieldPaymentAccount_APPLY             = "paymentAccount";
    const fieldConstructorID_APPLY              = "constructionShopId";
    const fieldFactorableAmountPerDayWFI_APPLY  = "factorableAmountPerDayWFI";
    const fieldWorkedDaysWFI_APPLY              = "workedDaysWFI";
    const fieldFactorableTotalAmountWFI_APPLY   = "factorableTotalAmountWFI";

    const contractor_mail_lagless               = "lagless@invest-d.com";
    const contractor_mail_dandori               = "d-p@invest-d.com";
    const contractor_mail_renove                = "lagless@invest-d.com"; // ラグレスと同じ

    const APP_ID_CONSTRUCTOR                    = "96";

    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.index.show", (event) => {
        // コントロールの重複作成防止チェック
        if (document.getElementById(button_name) !== null) {
            return;
        }

        const button = createButton();
        kintone.app.getHeaderMenuSpaceElement().appendChild(button);
    });

    function createButton() {
        const button = document.createElement("button");
        button.id = button_name;
        button.innerText = button_title;
        button.addEventListener("click", clickButton);
        return button;
    }

    async function clickButton() {
        const before_process = `${statusReady_APPLY}の各レコードについて、支払予定明細書を作成しますか？\n\n`
            + "※このボタンでは文面を作成するだけで、メールは送信されません。\n"
            + "※既に文面が作成済みでも、文面を削除してもう一度文面を作成・上書きします。";
        const generate_ok = window.confirm(before_process);

        if (!generate_ok) {
            alert("処理は中断されました。");
            return;
        }

        const body_generate_target = {
            app: kintone.app.getId(),
            query: `${fieldStatus_APPLY} in ("${statusReady_APPLY}")
                and ${fieldPaymentTiming_APPLY} not in ("${statusOriginalPayment_APPLY}")`
            // 通常払いは債権譲渡行為を伴わない単なる業務代行。従って支払予定明細を送信する必要がない。
        };
        const ready_to_generate = await kintone.api("/k/v1/records", "GET", body_generate_target)
            .catch((err) => {
                console.error(err);
                alert("申込レコード取得時にエラーが発生しました。システム管理者に連絡してください。\n本文は作成されていません。");
                return;
            });
        if (!ready_to_generate) {
            return;
        }

        if (ready_to_generate.records.length === 0) {
            alert(`支払予定明細本文の作成対象となるレコード（${fieldStatus_APPLY}：${statusReady_APPLY}）のレコードはありませんでした。\n`
            + "処理を終了します。");
            return;
        }

        // 工務店マスタの「遅払い日数」フィールドが必要なので取得する
        const constructors = await kintone.api("/k/v1/records", "GET", { app: APP_ID_CONSTRUCTOR })
            .catch((err) => {
                console.error(err);
                alert("工務店レコード取得時にエラーが発生しました。本文は作成されていません。処理を終了します。");
                return;
            });
        if (!constructors) {
            return;
        }

        // 申込レコードに遅払い日数フィールドを紐付ける
        for (const apply of ready_to_generate.records) {
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
        let records_with_detail = [];
        try {
            records_with_detail = await attachDetail(ready_to_generate.records);
        } catch (err) {
            alert(err.message);
            return;
        }

        if (records_with_detail.length !== 0) {
            // セットした内容でPUT
            const put_params = {
                app: kintone.app.getId(),
                records: records_with_detail
            };
            const result = await kintone.api("/k/v1/records", "PUT", put_params)
                .catch((err) => {
                    console.error(err);
                    alert("レコードの更新中にエラーが発生しました。本文は作成されていません。");
                    return;
                });
            if (!result) {
                return;
            }

            const completed = `支払予定明細書を作成し、レコードの状態を「${statusConfirming_APPLY}」に更新しました。\n`
            + "各レコードの文面を目視で確認してください。\n\n"
            + `問題なし→レコードの状態を「${statusConfirmed_APPLY}」へと手動で更新し、「${nextActionButtonTitle}」ボタンをクリックしてください。\n`
            + "目視確認の結果、文面に修正が必要な場合はシステム担当者に相談してください。";
            // 修正が必要な場合、手動で修正するか、自動で再生成するかで操作が分岐する。金額等の修正の場合は自動で再生成することを推奨。宛名などの修正は手動を推奨。
            // 手動で修正：レコードに保存されている文面を手動で修正して、レコードの状態を statusConfirmed_APPLY に更新すればOK
            // 自動で再生成：レコードの状態を statusReady_APPLY に手動で戻してから、この支払予定明細書一括作成ボタンをもう一度クリックする
            alert(completed);
        }

        alert("処理が終了しました。ページを更新します。");
        document.location.reload();
    }

    async function attachDetail(target_records) {
        // エラーが発生した時、どのレコードで発生したかの情報をthrowするためのlet
        let error_num = 0;
        try {
            const processes = target_records.map(async (record) => {
                error_num = record[fieldRecordId_COMMON]["value"];

                const multiline_detail_text = await (async (record) => {
                    if (KE_BAN_CONSTRUCTORS.includes(record[fieldConstructorID_APPLY]["value"])) {
                        const display_record_data = getKebanDetailDisplayData(record);
                        return generateDetailTextKeban(display_record_data);
                    } else {
                        return await getLaglessPaymentDetail(record);
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

    const getFormattedYYYYMMDD = (kintone_date_value) => {
        // YYYY年MM月DD日のフォーマットで返す
        return `${kintone_date_value.split("-")[0]}年${kintone_date_value.split("-")[1]}月${kintone_date_value.split("-")[2]}日`;
    };

    const getLaglessPaymentDetail = async (record) => {
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
                const past_apply = await kintone.api("/k/v1/records", "GET", body);
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
            kyoryoku_company_name:          kyoryoku_company_name,
            // eslint-disable-next-line no-irregular-whitespace
            kyoryoku_ceo_title_and_name:    getAddresseeName(kyoryoku_ceo_title, kyoryoku_ceo_name),
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
        };

        return generateLaglessDetailText(apply_info, should_discount_for_first);
    };

    const getAddresseeName = (title, name) => {
        return (`${title} ${name}`).replace(/^( |　)+/,""); //titleが無い場合はreplaceで最初のスペースを取り除く
    };

    // 支払予定明細本文を生成する。各変数の加工はせず、受け取ったものをそのまま入れ込む
    function generateLaglessDetailText(apply_info, should_discount_for_first) {
        const fee_sign = apply_info.timing === statusLatePayment_APPLY
            ? "+"
            : "-";

        // eslint-disable-next-line no-irregular-whitespace
        let service_fee = `${apply_info.product_name}　利用手数料【（①+②）×${apply_info.commission_percentage}％】　${fee_sign}${apply_info.commission_amount_comma}円`;
        if (should_discount_for_first) {
            service_fee = service_fee.concat(" ※【初回申込限定】利用手数料半額キャンペーンが適用されました");
        }

        // 行ごとに配列で格納し、最後に改行コードでjoinする
        const text = [
            `${apply_info.kyoryoku_company_name}`,
            `${apply_info.kyoryoku_ceo_title_and_name} 様`,
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
            "",
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
        ];

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
            kyoryoku_company_name:              record[fieldCustomerCompanyName_APPLY]["value"],
            kyoryoku_name:                      getAddresseeName(record[fieldAddresseeTitle_APPLY]["value"], record[fieldAddresseeName_APPLY]["value"]),
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
            `${apply_info.kyoryoku_company_name}`,
            `${apply_info.kyoryoku_name} 様`,
            "",
            "この度は、軽バン .COM【売上前払いシステム】のお申込みありがとうございます。",
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
            "【軽バン .COM前払い事務局】",
            "ファクタリング実行会社：ラグレス2合同会社",
            "システム運営会社：インベストデザイン株式会社",
            "MAIL：lagless+keban@invest-d.com（インベストデザイン株式会社）",
            "TEL：050-3188-6800",
            "営業時間 : 10時〜17時(平日のみ)",
            "──────────────────────────────────────■",
        ];

        return text.join("\r\n");
    };

    function addComma(num) {
        // 数字に3桁区切りのコンマを挿入した文字列を返す。整数のみ考慮
        return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }

})();
