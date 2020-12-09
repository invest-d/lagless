/*
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

(function() {
    "use strict";



    const button_name = "createPaymentDetail";
    const button_title = "支払予定明細の本文を一括作成";
    const fieldRecordId_COMMON = "$id";
    const fieldDetail_APPLY = "paymentDetail";
    const fieldStatus_APPLY = "状態";
    const statusReady_APPLY = "工務店確認済";
    const statusConfirming_APPLY = "支払予定明細確認中";
    const statusConfirmed_APPLY = "支払予定明細送信前確認完了";
    const fieldCustomerCompanyName_APPLY = "支払先正式名称";
    const fieldAddresseeName_APPLY = "担当者名";
    const fieldAddresseeTitle_APPLY = "役職名";
    const fieldProductName_APPLY = "productName";
    const statusProductName_Lagless_APPLY = "ラグレス";
    const statusProductName_Dandori_APPLY = "ダンドリペイメント";
    const statusProductName_Renove_APPLY = "リノベ不動産Payment";
    const fieldClosingDate_APPLY = "closingDay";
    const fieldPaymentDate_APPLY = "paymentDate";
    const fieldDaysLater_APPLY = "daysLater";
    const fieldBillingCompanyName_APPLY = "billingCompanyOfficialName";
    const fieldApplicantAmount_APPLY = "applicationAmount";
    const fieldMembershipFee_APPLY = "membership_fee";
    const fieldTransferFee_APPLY = "transferFeeTaxIncl";
    const fieldPaymentTiming_APPLY = "paymentTiming";
    const statusLatePayment_APPLY = "遅払い";
    const fieldCommissionRate_Late_APPLY = "commissionRate_late";
    const fieldCommissionAmount_Late_APPLY = "commissionAmount_late";
    const fieldTransferAmount_Late_APPLY = "transferAmount_late";
    const fieldCommissionRate_Early_APPLY = "commissionRate";
    const fieldCommissionAmount_Early_APPLY = "commissionAmount";
    const fieldTransferAmount_Early_APPLY = "transferAmount";
    const fieldPaymentAccount_APPLY = "paymentAccount";
    const statusPaymentAccount_LaglessGK_APPLY = "LAGLESS";
    const statusPaymentAccount_Lagless2GK_APPLY = "ID";
    const fieldConstructorID_APPLY = "constructionShopId";
    const nextActionButtonTitle = "支払予定明細一括送信";

    const contractor_mail_lagless = "lagless@invest-d.com";
    const contractor_mail_dandori = "d-p@invest-d.com";
    const contractor_mail_renove = "lagless@invest-d.com"; // ラグレスと同じ

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
            + `※既に文面が作成済みでも、文面を削除してもう一度文面を作成・上書きします。`;
        const generate_ok = window.confirm(before_process);

        if (!generate_ok) {
            alert("処理は中断されました。");
            return;
        }

        const body_generate_target = {
            app: kintone.app.getId(),
            query: `状態 in ("${statusReady_APPLY}")`
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
            alert(`支払予定明細本文の作成対象となるレコード（状態：${statusReady_APPLY}）のレコードはありませんでした。\n`
            + "処理を終了します。");
            return;
        }

        // 工務店マスタの「遅払い日数」フィールドが必要なので取得する
        const body_constructors = {
            app: 96
        };
        const constructors = await kintone.api("/k/v1/records", "GET", body_constructors)
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
            const constructor = constructors.records.find((r) => r["id"]["value"] === apply[fieldConstructorID_APPLY]["value"])

            if (!constructor) {
                const no_constructor = "申込レコードに対応する工務店レコードが見つかりませんでした。申込レコードに記入している工務店IDが正しいかどうか確認してください。\n"
                + "この申込レコードの処理をスキップし、残りのレコードについて処理を続けます。\n\n"
                + `申込レコード番号: ${apply[fieldRecordId_COMMON]["value"]}, 協力会社名: ${apply[fieldCustomerCompanyName_APPLY]["value"]}, 工務店ID: ${apply[fieldConstructorID_APPLY]["value"]}`;
                alert(no_constructor)
                return;
            }

            apply[fieldDaysLater_APPLY] = { "value": constructor[fieldDaysLater_APPLY]["value"] }
        }

        // 支払明細を各レコードにセット
        let records_with_detail = [];
        try {
            records_with_detail = attachDetail(ready_to_generate.records);
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
            + `目視確認の結果、文面に修正が必要な場合はシステム担当者に相談してください。`
            // 修正が必要な場合、手動で修正するか、自動で再生成するかで操作が分岐する。金額等の修正の場合は自動で再生成することを推奨。宛名などの修正は手動を推奨。
            // 手動で修正：レコードに保存されている文面を手動で修正して、レコードの状態を statusConfirmed_APPLY に更新すればOK
            // 自動で再生成：レコードの状態を statusReady_APPLY に手動で戻してから、この支払予定明細書一括作成ボタンをもう一度クリックする
            alert(completed);
        }

        alert("処理が終了しました。ページを更新します。");
        document.location.reload();
    }

    function attachDetail(target_records) {
        const modified_records = [];

        // エラーが発生した時、どのレコードで発生したかの情報をthrowするためのlet
        let record_num = 0;
        try {
            const getFormattedYYYYMMDD = (kintone_date_value) => {
                // YYYY年MM月DD日のフォーマットで返す
                return `${kintone_date_value.split("-")[0]}年${kintone_date_value.split("-")[1]}月${kintone_date_value.split("-")[2]}日`;
            }

            target_records.forEach((record) => {
                record_num = record[fieldRecordId_COMMON]["value"];

                const kyoryoku_company_name = record[fieldCustomerCompanyName_APPLY]["value"];
                const kyoryoku_ceo_name = record[fieldAddresseeName_APPLY]["value"];
                const kyoryoku_ceo_title = record[fieldAddresseeTitle_APPLY]["value"];
                const product_name = record[fieldProductName_APPLY]["value"];
                const closing_YYYYnenMMgatsuDDhi = getFormattedYYYYMMDD(record[fieldClosingDate_APPLY]["value"]);
                const payment_YYYYnenMMgatsuDDhi = getFormattedYYYYMMDD(record[fieldPaymentDate_APPLY]["value"]);
                const construction_shop_name = record[fieldBillingCompanyName_APPLY]["value"];
                const billing_amount = record[fieldApplicantAmount_APPLY]["value"];
                const membership_fee = record[fieldMembershipFee_APPLY]["value"];
                const transfer_fee_tax_incl = record[fieldTransferFee_APPLY]["value"];

                let commission_rate;
                let commission_amount;
                let transfer_amount_of_money;
                const timing = record[fieldPaymentTiming_APPLY]["value"];
                if (timing === statusLatePayment_APPLY) {
                    commission_rate = record[fieldCommissionRate_Late_APPLY]["value"];
                    commission_amount = record[fieldCommissionAmount_Late_APPLY]["value"];
                    transfer_amount_of_money = record[fieldTransferAmount_Late_APPLY]["value"];
                } else {
                    commission_rate = record[fieldCommissionRate_Early_APPLY]["value"];
                    commission_amount = record[fieldCommissionAmount_Early_APPLY]["value"];
                    transfer_amount_of_money = record[fieldTransferAmount_Early_APPLY]["value"];
                }

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
                const version = ((days_later) => {
                    if (!days_later) {
                        // 空文字やundefinedの場合
                        return "V1";
                    }

                    if (Number(days_later) > 0) {
                        return "V2";
                    } else {
                        return "V1";
                    }
                })(record[fieldDaysLater_APPLY]["value"]);

                let contractor_name = "";
                try {
                    contractor_name = {
                        [statusPaymentAccount_Lagless2GK_APPLY]: {
                            "V1": "インベストデザイン株式会社",
                            "V2": "ラグレス2合同会社",
                        },
                        [statusPaymentAccount_LaglessGK_APPLY]: {
                            "V1": "ラグレス合同会社",
                            "V2": "ラグレス合同会社",
                        }
                    }[record[fieldPaymentAccount_APPLY]["value"]][version];
                } catch (err) {
                    throw new Error(`不明な支払元口座です: ${ record[fieldPaymentAccount_APPLY]["value"] }`);
                }

                if (!contractor_name) {
                    throw new Error(`不明な支払元口座です: ${ record[fieldPaymentAccount_APPLY]["value"] }`);
                }

                const detail = generateDetailText(
                    kyoryoku_company_name,
                    (`${kyoryoku_ceo_title  } ${  kyoryoku_ceo_name}`).replace(/^( |　)+/,""), //titleが無い場合はreplaceで最初のスペースを取り除く
                    product_name,
                    closing_YYYYnenMMgatsuDDhi,
                    payment_YYYYnenMMgatsuDDhi,
                    construction_shop_name,
                    addComma(billing_amount),
                    addComma(membership_fee),
                    Number(commission_rate) * 100,
                    addComma(commission_amount),
                    addComma(transfer_fee_tax_incl),
                    addComma(transfer_amount_of_money),
                    contractor_name,
                    sender_mail,
                    timing);

                const record_obj = {
                    "id": record_num,
                    "record": {
                        [fieldDetail_APPLY]: {
                            "value": detail
                        },
                        [fieldStatus_APPLY]: {
                            "value": statusConfirming_APPLY
                        }
                    }
                };

                // 一括更新するため配列に格納
                modified_records.push(record_obj);
            });
        } catch(err) {
            console.error(err);
            throw new Error(`レコード番号${String(record_num)} を処理中にエラーが発生したため、処理を中断しました。\n`
            + "レコードの内容に不足がないかを確認してからもう一度やり直してください。\n\n"
            + `エラー内容：${err.message}`);
        }

        return modified_records;
    }

    // 支払予定明細本文を生成する。各変数の加工はせず、受け取ったものをそのまま入れ込む
    function generateDetailText(
        kyoryoku_company_name,
        kyoryoku_ceo_title_and_name,
        product_name,
        closing_YYYYnenMMgatsuDDhi,
        payment_YYYYnenMMgatsuDDhi,
        construction_shop_name,
        billing_amount_comma,
        membership_fee_comma,
        commission_percentage, // 5%のとき、0.05じゃなくて5を渡す。
        commission_amount_comma,
        transfer_fee_tax_incl_comma, //振込手数料1000円以上はたぶんないだろうけど、もしあったらコンマ付きで渡す
        transfer_amount_of_money_comma,
        contractor_name,
        sender_mail,
        timing
    ) {
        const fee_sign = timing === statusLatePayment_APPLY
            ? "+"
            : "-";

        // 行ごとに配列で格納し、最後に改行コードでjoinする
        const text = [
            `${kyoryoku_company_name}`,
            `${kyoryoku_ceo_title_and_name} 様`,
            "",
            `この度は、${product_name}のお申込みありがとうございます。`,
            "下記のとおり受付いたしましたので、お知らせいたします。",
            "",
            `対象となる締め日：${closing_YYYYnenMMgatsuDDhi}`,
            "",
            `お振込予定日　　：${payment_YYYYnenMMgatsuDDhi}`,
            "─────────────────",
            "",
            "※債権譲渡登記をされている法人様は、ご利用をお断りさせていただきます。",
            "※天災、通信インフラの故障及びその他の事象により、実行日が遅れる可能性がございます。",
            "※お申し込み受付後は、原則お振込日の変更ができかねます。",
            "",
            "",
            `${construction_shop_name}宛 請求金額（税込）①　${billing_amount_comma}円`,
            "",
            `差引額（協力会費・立替金等）②　-${membership_fee_comma}円`, //ゼロ円であっても -0円 表記
            "",
            `${product_name}　利用手数料【（①+②）×${commission_percentage}％】　${fee_sign}${commission_amount_comma}円`,
            "",
            `振込手数料（貴社負担）　-${transfer_fee_tax_incl_comma}円`,
            "──────────────────────────────",
            `当社から貴社へのお振込み予定金額　${transfer_amount_of_money_comma}円`,
            "",
            "",
            "",
            "ご不明な点などがございましたら、",
            "下記連絡先までお問い合わせください。",
            "",
            "──────────────────────────────■",
            `【${product_name}事務局】`,
            contractor_name,
            "東京都千代田区神田神保町三丁目5番地 住友不動産九段下ビル7F",
            `Mail：${sender_mail}`,
            "TEL：050-3188-6800",
            "──────────────────────────────■",
            ""
        ];

        return text.join("\r\n");
    }

    function addComma(num) {
        // 数字に3桁区切りのコンマを挿入した文字列を返す。整数のみ考慮
        return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }

})();
