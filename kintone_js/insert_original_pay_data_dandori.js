/*
    Version 1
    アプリ174のカスタマイズjsとして作成。
    請求データを請求IDごとにまとめて、kintone申込アプリにレコードを作成する。
*/

(function () {
    "use strict";

    const APP_ID_APPLY                      = ENV.APPLY;
    const fieldStatus_APPLY                 = "状態";
    const statusInserted_APPLY              = "通常払い確認待ち";
    const fieldPaymentTiming_APPLY          = "paymentTiming";
    const statusOriginalPay_APPLY           = "通常払い";
    const fieldBillingAmount_APPLY          = "applicationAmount";
    const fieldMemberFee_APPLY              = "membership_fee";
    const fieldReceivable_APPLY             = "totalReceivables";
    const fieldClosingDate_APPLY            = "closingDay";
    const fieldPaymentDate_APPLY            = "paymentDate";
    const fieldKyoryokuName_APPLY           = "company";
    const fieldConstructorName_APPLY        = "billingCompany";
    const fieldPhone_APPLY                  = "phone";
    const fieldConstructorID_APPLY          = "constructionShopId";
    const fieldKyoryokuID_APPLY             = "ルックアップ";

    const APP_ID_DANDORI                    = "174";
    const fieldStatus_DANDORI               = "status";
    const statusReady_DANDORI               = "未処理";
    const fieldInvoiceID_DANDORI            = "invoiceID";
    const fieldClosingDate_DANDORI          = "closingDate";
    const fieldPaymentDate_DANDORI          = "paymentDate";
    const fieldKyoryokuName_DANDORI         = "kyoryokuName";
    const fieldKyoryokuPhone_DANDORI        = "kyoryokuPhone";
    const fieldBillingDetail_DANDORI        = "constructionBillTaxInclDetail";
    const fieldBillingSum_DANDORI           = "constructionBillTaxInclSum";
    const fieldMemberFeeSum_DANDORI         = "memberShipFeeSum";
    const fieldReceivableSum_DANDORI        = "receivableAmountSum";

    const APP_ID_CONSTRUCTOR                = "96";
    const fieldConstructorID_CONSTRUCTOR    = "id";
    const fieldConstructorName_CONSTRUCTOR  = "工務店正式名称";

    const APP_ID_KYORYOKU                   = "88";
    const fieldKyoryokuID_KYORYOKU          = "支払企業No_";
    const fieldConstructorID_KYORYOKU       = "工務店ID";
    const fieldCommonName_KYORYOKU          = "支払先";
    const fieldFormalName_KYORYOKU          = "支払先正式名称";
    const fieldPhone_KYORYOKU               = "電話番号";

    const client = new KintoneRestAPIClient({baseUrl: "https://investdesign.cybozu.com"});

    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.index.show", (event) => {
        if (needShowButton()) {
            const button = createButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    const button_id = "insertCollect";
    function needShowButton() {
        // 増殖バグ防止
        return document.getElementById(button_id) === null;
    }

    function createButton() {
        const button = document.createElement("button");
        button.id = button_id;
        button.innerText = "請求データから通常払い用レコードを作成";
        button.addEventListener("click", clickButton);
        return button;
    }

    // ボタンクリック時の処理を定義
    async function clickButton() {
        const message = `${fieldStatus_DANDORI}が${statusReady_DANDORI}のレコードを請求IDごとに集計し、申込アプリに新規レコードを作成します。`;
        const clicked_ok = confirm(message);
        if (!clicked_ok) {
            alert("処理は中断されました。");
            return;
        }

        const constructor_id = prompt("工務店IDを入力してください", "100");

        try {
            const constructor = await getConstructor(constructor_id);

            const targets = await getTargetRecords()
                .catch((err) => {
                    console.error(err);
                    throw new Error("請求データレコードの取得中にエラーが発生しました。");
                });

            if (targets.length === 0) {
                alert(`${fieldStatus_DANDORI}が${statusReady_DANDORI}のレコードは存在しませんでした。`);
                return;
            }

            const aggregated_records = aggregateCsvData(targets);

            const new_apply_records = await Promise.all(convert(aggregated_records, constructor));

            const inserted_ids = await insertApplyRecords(new_apply_records)
                .catch((err) => {
                    console.error(err);
                    throw new Error("申込アプリへのレコード挿入中にエラーが発生しました。");
                });

            alert(`${inserted_ids.length}件 の請求書を申込アプリに登録しました。\n申込アプリの各レコードを確認し、協力会社ID（と口座情報）が入っていない場合は手動で入力してください。`);
            alert("ページを更新します。");
            window.location.reload();
        } catch(err) {
            alert(err);
        }
    }

    const getConstructor = async (id) => {
        const request_body = {
            "app": APP_ID_CONSTRUCTOR,
            "condition": `${fieldConstructorID_CONSTRUCTOR} = "${id}"`,
        };

        const records = await client.record.getAllRecords(request_body);
        if (records.length === 0) {
            throw new Error(`工務店が見つかりません。工務店ID: ${id}`);
        } else {
            return {
                id: records[0][fieldConstructorID_CONSTRUCTOR]["value"],
                name: records[0][fieldConstructorName_CONSTRUCTOR]["value"]
            };
        }
    };

    function getTargetRecords() {
        // 請求データアプリの中で状態が未処理のレコードを全件取得する
        const request_body = {
            "app": APP_ID_DANDORI,
            "condition": `${fieldStatus_DANDORI} in ("${statusReady_DANDORI}")`,
        };

        return client.record.getAllRecords(request_body);
    }

    const aggregateCsvData = (records) => {
        const invoice_ids = Array.from(new Set(records.map((r) => r[fieldInvoiceID_DANDORI]["value"])));

        // 請求IDごとにグループ化（1レコードは請求書に記載する明細の1行に相当する）
        const invoice_groups = {};
        for (const invoice_id of invoice_ids) {
            invoice_groups[invoice_id] = records.filter((r) => r[fieldInvoiceID_DANDORI]["value"] === invoice_id);
        }

        const aggregated = [];
        Object.values(invoice_groups).forEach((group) => {
            // グループごとに、①案件の合計額、②協力会費差し引き後振込金額が一致しているか検算する
            const billing_sum = group.reduce((sum, record) => {return Number(sum) + Number(record[fieldBillingDetail_DANDORI]["value"]);}, 0);
            const member_fee = Number(group[0][fieldMemberFeeSum_DANDORI]["value"]);

            try {
                const invoice_id = group[0][fieldInvoiceID_DANDORI]["value"];
                if (billing_sum !== Number(group[0][fieldBillingSum_DANDORI]["value"])) {
                    throw new Error(`請求書の請求額（税込）の合計額が一致しません。請求データに誤りがないか確認してください。請求ID：${invoice_id}`);
                }

                if ((billing_sum - member_fee) !== Number(group[0][fieldReceivableSum_DANDORI]["value"])) {
                    throw new Error(`請求書の振込支払額が、（請求額−協力会費）に一致しません。請求データに誤りがないか確認してください。請求ID：${invoice_id}`);
                }

                // 問題なければgroup[0]を代表にして返す
                aggregated.push(group[0]);
            } catch (e) {
                alert(`${e}\n\nこの請求書の処理をスキップします`);
            }
        });

        return aggregated;
    };

    const convert = (dandori_records, constructor) => {
        const getKyoryokuID = async (invoice_name, invoice_phone, constructor_id) => {
            // 通名もしくは正式名称のフィールドと、電話番号のフィールドの両方が完全一致するレコードがあればそれを返す。なければ空文字
            const request_body = {
                "app": APP_ID_KYORYOKU,
                "condition": `${fieldConstructorID_KYORYOKU} = "${constructor_id}"`,
            };
            const records = await client.record.getAllRecords(request_body);

            const target = records.find((r) => {
                const equal_name = (r[fieldCommonName_KYORYOKU]["value"] === invoice_name)
                    || (r[fieldFormalName_KYORYOKU]["value"] === invoice_name);

                const equal_phone = ((invoice_phone) => {
                    if (!invoice_phone) {
                        return false;
                    }
                    return r[fieldPhone_KYORYOKU]["value"] === invoice_phone;
                })(invoice_phone);

                return equal_name && equal_phone;
            });

            if (target) {
                return target[fieldKyoryokuID_KYORYOKU]["value"];
            } else {
                return "";
            }
        };

        // ダンドリワーク請求データアプリのレコードを加工して、ラグレス申込アプリにinsertできるオブジェクトにする
        return dandori_records.map(async (r) => {
            const phone = (r[fieldKyoryokuPhone_DANDORI]["value"] === "")
                ? "000-0000-0000"
                : r[fieldKyoryokuPhone_DANDORI]["value"];
            const kyoryoku_id = await getKyoryokuID(r[fieldKyoryokuName_DANDORI]["value"], r[fieldKyoryokuPhone_DANDORI]["value"], constructor.id);
            return {
                [fieldStatus_APPLY]: {
                    "value": statusInserted_APPLY
                },
                [fieldPaymentTiming_APPLY]: {
                    "value": statusOriginalPay_APPLY
                },
                [fieldBillingAmount_APPLY]: {
                    "value": r[fieldBillingSum_DANDORI]["value"]
                },
                [fieldMemberFee_APPLY]: {
                    "value": r[fieldMemberFeeSum_DANDORI]["value"]
                },
                [fieldReceivable_APPLY]: {
                    "value": r[fieldReceivableSum_DANDORI]["value"]
                },
                [fieldClosingDate_APPLY]: {
                    "value": r[fieldClosingDate_DANDORI]["value"]
                },
                [fieldPaymentDate_APPLY]: {
                    "value": r[fieldPaymentDate_DANDORI]["value"]
                },
                [fieldKyoryokuName_APPLY]: {
                    "value": r[fieldKyoryokuName_DANDORI]["value"]
                },
                [fieldConstructorName_APPLY]: {
                    "value": constructor.name
                },
                [fieldPhone_APPLY]: {
                    "value": phone
                },
                [fieldConstructorID_APPLY]: {
                    "value": constructor.id
                },
                [fieldKyoryokuID_APPLY]: {
                    "value": kyoryoku_id
                }
            };
        });
    };

    async function insertApplyRecords(records) {
        const request_body = {
            "app": APP_ID_APPLY,
            "records": records
        };

        const resp = await client.record.addAllRecords(request_body);
        return resp.records.map((r) => r.id);
    }
})();
