/*
    Version 3
    軽バン.COM案件の場合の専用レイアウトを追加

    Version 2
    遅払いの申込が入ってくる場合にも対応。
    - 文面を一部更新
    - 支払明細のテーブルにフィールドを追加し、支払タイミングを出力するようになった
    インベストデザインの企業ロゴを削除
    住所更新
    以上の変更は、遅払いを利用しない場合にも適用される。

    Version 1.2
    処理対象レコードの状態を「支払実行済み」から「クラウドサイン承認済み」に変更。
    振込依頼書の目視確認が完了しているかどうかを、状態フィールドではなく専用のチェックボックスを使って管理するように変更。

    Version 1.1
    振込依頼書をPDF形式で作成し、kintoneの添付ファイルフィールドに保存する。

    Version 1
    1: 回収アプリの支払実行済みレコードを、工務店IDと回収期限が同一のグループでまとめる。
    まとめた中でレコード番号が最も小さいものを親レコードとし、振込依頼書作成に必要な申込レコードの情報と最終的な振込金額の合計を集約する。
    2: 工務店への振込依頼書を作成する。親レコード1件に対して振込依頼書を1通。子レコードに対しては何もしない。
    作成した振込依頼書はプレーンテキストでローカルに保存する。
*/

// PDF生成ライブラリ
import { createPdf } from "./pdfMake_util";
import { formatYMD, addComma, get_contractor_name, get_display_payment_timing } from "./util_forms";
import { KE_BAN_CONSTRUCTORS } from "./96/common";

// 祝日判定ライブラリ
const holiday_jp = require("@holiday-jp/holiday_jp");
const dateFns = require("date-fns");

const dayjs = require("dayjs");
dayjs.locale("ja");

(function() {
    "use strict";

    const APP_ID = ((app_id) => {
        switch(app_id) {
        // 開発版の回収アプリ
        case 160:
            return {
                APPLY: 159,
                COLLECT: 160
            };

        // 本番の回収アプリ
        case 162:
            return {
                APPLY: 161,
                COLLECT: 162
            };
        default:
            console.warn(`Unknown app: ${  app_id}`);
        }
    })(kintone.app.getId());

    const ACCOUNTS = {
        "株式会社NID": {
            smbc: "三井住友銀行　神田支店\n普通預金　3 3 9 1 1 9 5\nカ）エヌアイディー"
        },
        "ラグレス合同会社": {
            smbc: "三井住友銀行　神田支店\n普通預金　3 4 0 9 1 3 4\nラグレス（ド，マスターコウザ"
        },
        "ラグレス2合同会社": {
            smbc: "三井住友銀行　神田支店\n普通預金　3 4 5 9 5 5 4\nラグレスニ　（ド,マスターコウザ",
            gmo_aozora: "GMOあおぞらネット銀行\n法人営業部\n普通預金　1 2 0 3 8 6 8\nラグレスニ（ド"
        },
    };

    const getAccount = (contractor, constructor_id) => {
        // 一部の工務店ではGMOあおぞらネット銀行を利用する
        if (KE_BAN_CONSTRUCTORS.includes(constructor_id)) {
            return ACCOUNTS[contractor].gmo_aozora;
        }

        return ACCOUNTS[contractor].smbc;
    };

    const APP_ID_CONSTRUCTOR = 96;

    const APP_ID_COLLECT = APP_ID.COLLECT;
    const fieldRecordId_COLLECT = "レコード番号";
    const fieldDeadline_COLLECT = "deadline";
    const fieldProductName_COLLECT = "productName";
    const fieldConstructionShopId_COLLECT = "constructionShopId";
    const fieldConstructionShopName_COLLECT = "constructionShopName";
    const fieldCeoTitle_COLLECT = "ceoTitle";
    const fieldCeo_COLLECT = "ceo";
    const fieldMailToInvest_COLLECT ="mailToInvest";
    const fieldClosingDate_COLLECT = "closingDate";
    const fieldCollectableAmount_COLLECT = "scheduledCollectableAmount";
    const fieldAccount_COLLECT = "account";
    const fieldDaysLater_COLLECT = "daysLater";
    const fieldStatus_COLLECT = "collectStatus";
    const statusApproved_COLLECT = "クラウドサイン承認済み";
    const fieldParentCollectRecord_COLLECT = "parentCollectRecord";
    const statusParent_COLLECT = "true";
    const fieldTotalBilledAmount_COLLECT = "totalBilledAmount";
    const tableCloudSignApplies_COLLECT = "cloudSignApplies";
    const tableFieldApplyRecordNoCS_COLLECT = "applyRecordNoCS";
    const tableFieldPaymentTimingCS_COLLECT = "paymentTimingCS";
    const tableFieldApplicantOfficialNameCS_COLLECT = "applicantOfficialNameCS";
    const tableFieldReceivableCS_COLLECT = "receivableCS";
    const tableFieldPaymentDateCS_COLLECT = "paymentDateCS";
    const tableInvoiceTargets_COLLECT = "invoiceTargets";
    const tableFieldApplyRecordNoIV_COLLECT = "applyRecordNoIV";
    const tableFieldPaymentTimingIV_COLLECT = "paymentTimingIV";
    const tableFieldApplicantOfficialNameIV_COLLECT = "applicantOfficialNameIV";
    const tableFieldReceivableIV_COLLECT = "receivableIV";
    const tableFieldPaymentDateIV_COLLECT = "paymentDateIV";
    const fieldInvoicePdf_COLLECT = "invoicePdf";
    const fieldHandleForHolidays_COLLECT = "handleForHolidays";
    const fieldConfirmStatusInvoice_COLLECT = "confirmStatusInvoice";

    const orange = "#ff9a33";
    const white = "#ffffff";
    const black = "#000000";

    kintone.events.on("app.record.index.show", (event) => {
        // ボタンを表示するか判定
        if (needShowButton()) {
            const button = createGenerateInvoiceButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function needShowButton() {
        // 一旦は常にボタンを表示する。増殖バグだけ防止
        return document.getElementById("generateInvoice") === null;
    }

    function createGenerateInvoiceButton() {
        const generateInvoice = document.createElement("button");
        generateInvoice.id = "generateInvoice";
        generateInvoice.innerText = "振込依頼書を作成";
        generateInvoice.addEventListener("click", clickGenerateInvoice);
        return generateInvoice;
    }

    // ボタンクリック時の処理を定義
    async function clickGenerateInvoice() {
        const clicked_ok = confirm(`${statusApproved_COLLECT}のレコードに対して、振込依頼書を作成しますか？`);
        if (!clicked_ok) {
            alert("処理は中断されました。");
            return;
        }

        const text_ready = this.innerText;
        this.innerText = "振込依頼書を作成中...";

        try {
            const target = await getTargetRecords()
                .catch((err) => {
                    console.error(err);
                    throw new Error(`${statusApproved_COLLECT}の回収レコードの取得中にエラーが発生しました。`);
                });

            if (target.records.length === 0) {
                alert(`${statusApproved_COLLECT}のレコードはありませんでした。`);
                return;
            }

            // updateのための、明細や金額を集約したあとの親レコード配列を取得
            const parents = getAggregatedParentRecords(target.records);

            // Update
            const update_body = {
                "app": APP_ID_COLLECT,
                "records": parents
            };
            await kintone.api(kintone.api.url("/k/v1/records", true), "PUT", update_body)
                .catch((err) => {
                    console.error(err);
                    throw new Error("回収レコードの親を更新中にエラーが発生しました。");
                });

            // 親レコードそれぞれから振込依頼書を作成
            const invoices = await generateInvoices()
                .catch((err) => {
                    console.error(err);
                    throw new Error("振込依頼書の作成中にエラーが発生しました。");
                });

            // 作成した振込依頼書を添付ファイルとしてレコードに添付
            const completed_count = await uploadInvoices(invoices)
                .catch((err) => {
                    console.error(err);
                    throw new Error("振込依頼書の添付中にエラーが発生しました。");
                });

            alert(`${completed_count}件 振込依頼書の作成が完了しました。\n\nそれぞれのレコードの添付ファイルを目視で確認したのち、\nレコード詳細画面の振込依頼書確認OKチェックボックスをオンにして保存してください。`);

        } catch(err) {
            alert(err);
        } finally {
            this.innerText = text_ready;
        }
    }

    function getTargetRecords() {
        console.log(`回収アプリから${statusApproved_COLLECT}のレコードを全て取得する`);

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
                tableInvoiceTargets_COLLECT
            ],
            "query": `${fieldStatus_COLLECT} in ("${statusApproved_COLLECT}")`
        };

        return kintone.api(kintone.api.url("/k/v1/records", true), "GET", request_body);
    }

    function getAggregatedParentRecords(records) {
        console.log("振込依頼書作成対象のレコードを締日と工務店IDごとにまとめ、明細の情報を親に集約する");
        // まず工務店IDと締日だけ全て抜き出す
        const key_pairs = records.map((record) => {
            return {
                [fieldConstructionShopId_COLLECT]: record[fieldConstructionShopId_COLLECT]["value"],
                [fieldClosingDate_COLLECT]: record[fieldClosingDate_COLLECT]["value"]
            };
        });

        // 抜き出した工務店IDと締日のペアについて、重複なしのリストを作る。
        const unique_key_pairs = key_pairs.filter((key_pair1, key_pairs_index, self_arr) => {
            const target_index = self_arr.findIndex(((key_pair2) => {
                // 工務店IDの一致
                return (key_pair1[fieldConstructionShopId_COLLECT] === key_pair2[fieldConstructionShopId_COLLECT])
                // 締日の一致
                && (key_pair1[fieldClosingDate_COLLECT] === key_pair2[fieldClosingDate_COLLECT]);
            }));

            const is_unique = (target_index === key_pairs_index);
            return is_unique;
        });

        // 親レコード更新用のオブジェクトを作成
        const update_targets = unique_key_pairs.map((pair) => {
            // 振込依頼書をまとめるべき回収レコードを配列としてグループ化
            const invoice_group = records.filter((record) => {
                return record[fieldConstructionShopId_COLLECT]["value"] === pair[fieldConstructionShopId_COLLECT]
                && record[fieldClosingDate_COLLECT]["value"] === pair[fieldClosingDate_COLLECT];
            });

            // グループの中でレコード番号が最も小さいもの一つを親と決める
            const parent_record = invoice_group.reduce((a, b) => {
                if (Number(a[fieldRecordId_COLLECT]["value"]) < Number(b[fieldRecordId_COLLECT]["value"])) {
                    return a;
                } else {
                    return b;
                }
            });

            // グループの情報を親に集約。クラウドサイン用の情報とは別に保持するため、親の振込依頼書用サブテーブルに親自身のクラウドサイン用サブテーブルのレコードも加える。
            // 振込依頼書に記載する合計額
            const total_billed = invoice_group.reduce((total, record) => total + Number(record[fieldCollectableAmount_COLLECT]["value"]), 0);

            // 振込依頼書に記載する申込レコード一覧（グループ化した回収レコードそれぞれの、クラウドサイン用サブテーブルに入っている申込レコードのunion）
            const invoice_targets = invoice_group
                .flatMap((record) => {
                    // サブテーブルのUpdateをするにあたって、サブテーブルのレコードそれぞれのオブジェクトの構造を整える
                    return record[tableCloudSignApplies_COLLECT]["value"].map((sub_rec) => {
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
                });

            // apiに渡すためにオブジェクトの構造を整える
            return {
                "id": parent_record[fieldRecordId_COLLECT]["value"],
                "record": {
                    [fieldParentCollectRecord_COLLECT]: {
                        "value": [statusParent_COLLECT] // チェックボックス型は複数選択のフィールドなので配列で値を指定
                    },
                    [fieldTotalBilledAmount_COLLECT]: {
                        "value": total_billed
                    },
                    [tableInvoiceTargets_COLLECT]: {
                        "value": invoice_targets
                    }
                }
            };
        });

        return update_targets;
    }

    async function generateInvoices() {
        // 親レコードを全て取得
        const get_parents = {
            "app": APP_ID_COLLECT,
            "fields": [
                fieldRecordId_COLLECT,
                fieldConstructionShopId_COLLECT,
                fieldConstructionShopName_COLLECT,
                fieldCeoTitle_COLLECT,
                fieldCeo_COLLECT,
                fieldProductName_COLLECT,
                fieldClosingDate_COLLECT,
                fieldDeadline_COLLECT,
                fieldTotalBilledAmount_COLLECT,
                tableInvoiceTargets_COLLECT,
                fieldAccount_COLLECT,
                fieldDaysLater_COLLECT,
                fieldMailToInvest_COLLECT,
                fieldHandleForHolidays_COLLECT
            ],
            "query": `${fieldStatus_COLLECT} in ("${statusApproved_COLLECT}") and ${fieldParentCollectRecord_COLLECT} in ("${statusParent_COLLECT}")`
        };
        const target_parents = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", get_parents);

        const get_constructors = {
            "app": APP_ID_CONSTRUCTOR
        };
        const constructors = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", get_constructors);

        const attachment_pdfs = [];
        for(const parent_record of target_parents.records) {
            // 回収レコードに遅払い日数フィールドを紐づける
            const constructor = constructors.records.find((r) => r["id"]["value"] === parent_record[fieldConstructionShopId_COLLECT]["value"]);
            if (!constructor) {
                // ダイアログを表示するが、他のPDFは引き続き作成を試みる
                alert(`工務店レコードが見つかりませんでした。回収レコードID: ${parent_record["$id"]["value"]}`);
                continue;
            }

            parent_record["daysLater"] = { "value": constructor["daysLater"]["value"] };

            const invoice_doc = generateInvoiceDocument(parent_record);
            const file_name = `${parent_record[fieldConstructionShopName_COLLECT]["value"]}様用 支払明細書兼振込依頼書${formatYMD(parent_record[fieldClosingDate_COLLECT]["value"])}締め分.pdf`;

            console.log("作成した振込依頼書をPDF形式で生成");
            const generator = await createPdf(invoice_doc);
            // 添付先のレコード番号と添付するファイルをオブジェクトにして返す
            attachment_pdfs.push({
                "id": parent_record[fieldRecordId_COLLECT]["value"],
                "file_name": file_name,
                "doc_generator": generator
            });
        }

        return attachment_pdfs;
    }

    function generateInvoiceDocument(parent_record) {
        // pdfmakeのライブラリ用のオブジェクトを生成する。
        const product_name = parent_record[fieldProductName_COLLECT]["value"];
        const company = parent_record[fieldConstructionShopName_COLLECT]["value"];
        let contact_company;
        try {
            contact_company = get_contractor_name(
                parent_record[fieldAccount_COLLECT]["value"],
                parent_record[fieldDaysLater_COLLECT]["value"],
                parent_record[fieldConstructionShopId_COLLECT]["value"]
            );
        } catch (e) {
            if (e instanceof TypeError) {
                throw new Error("連絡先として表示する会社名を確定できませんでした。\n"
                    + "【支払元口座】および【遅払い日数】を工務店マスタに正しく入力してください。\n\n"
                    + `工務店ID：${parent_record[fieldConstructionShopId_COLLECT]["value"]}\n`
                    + `工務店名：${parent_record[fieldConstructionShopName_COLLECT]["value"]}`);
            } else {
                throw new Error(`不明なエラーです。追加の情報：${e}`);
            }
        }

        const doc = {
            info: {
                title: `${company}様宛${product_name}利用分振込依頼書`,
                author: `${product_name}事務局 ${contact_company}`,
                subject: `${formatYMD(parent_record[fieldClosingDate_COLLECT]["value"])}締め分`,
                creator: `${product_name}事務局 ${contact_company}`,
                producer: `${product_name}事務局 ${contact_company}`,
            },
            content: [],
            pageSize: "A4",
            pageMargins: [55, 30, 55, 30],
            defaultStyle: {
                font: "Koruri",
                fontSize: 8,
                lineHeight: 1.2,
            }
        };

        // 文書の上下にある横長のバー
        const bar = {
            table: {
                widths: ["100%"],
                heights: [5],
                headerRows: 0,
                body: [
                    [ { text: "", fillColor: orange, borderColor: [orange, orange, orange, orange] } ]
                ]
            }
        };
        doc.content.push(bar);

        // 文書のタイトル
        const title = {
            text: `${product_name} 振込依頼書 兼 支払明細書`,
            fontSize: 14,
            bold: true,
            alignment: "center",
            margin: [0, 15, 0, 0]
        };
        doc.content.push(title);

        // 振込依頼書に記載する日付。Y年M月D日
        // 支払明細の申込レコードの中で、最も遅い支払日を採用する
        const detail_payment_dates =  parent_record["invoiceTargets"]["value"].map((record) => dayjs(record["value"][tableFieldPaymentDateIV_COLLECT]["value"]));
        const latest_date = dayjs(Math.max(...detail_payment_dates));
        const send_date = {
            text: latest_date.format("YYYY年M月D日"),
            alignment: "right",
            fontSize: 10
        };
        doc.content.push(send_date);

        // 肩書が空白の場合、単純に繋ぐと名前の前に空白が出来てしまうので、trimStartで対策。全角半角スペース混在にも対応できる
        const ceo = `${parent_record[fieldCeoTitle_COLLECT]["value"]} ${parent_record[fieldCeo_COLLECT]["value"]}`.trimStart();
        const addressee = {
            text: `${company}\n${ceo} 様`,
            lineHeight: 1.5,
            margin: [0, 5, 0, 0],
            fontSize: 12
        };
        doc.content.push(addressee);

        const letter_body = {
            rowSpan: 2,
            border: [false],
            text: [
                "拝啓　時下ますますご清栄のこととお慶び申し上げます。\n",
                "平素は格別のご高配を賜り厚く御礼申し上げます。\n",
                `さて、下記のとおり${product_name}のお申込み受付をいたしましたのでご案内いたします。\n`,
                `つきましては、${product_name}利用分の合計金額を、お支払期限までに下記振込先口座へお振込み頂きますよう、お願い申し上げます。\n`,
                "ご不明な点などがございましたら、下記連絡先までお問い合わせください。\n",
                "今後ともどうぞ宜しくお願いいたします。\n",
                {
                    text: "敬具",
                    alignment: "right"
                }
            ],
            margin: [0, 5, 25, 0]
        };

        // 改行で空白のスペースを作り出す
        const logo_space = {
            text: "\n\n\n\n",
            width: 50,
            border: [false],
            alignment: "center"
        };

        const mail = parent_record[fieldMailToInvest_COLLECT]["value"];
        const invoice_from = {
            text: [
                `【${product_name}事務局】\n`,
                {
                    text: `${contact_company}\n`,
                    bold: true
                },
                "東京都千代田区神田神保町三丁目\n",
                "5番地 住友不動産九段下ビル7F\n",
                `Mail:${mail}\n`,
                "TEL:050-3188-6800\n"
            ],
            fontSize: 7,
            border: [false]
        };

        // 文章と連絡先を横並びに
        const bodies = {
            table: {
                headerRows: 0,
                // autoの列はセルを塗りつぶして擬似的に縦のラインを作るためのもの
                widths: ["75%", "auto", "25%"],
                body: [
                    [letter_body, {text: "", border: [false]},                    logo_space   ],
                    [{},          {text: "", border: [false], fillColor: orange}, invoice_from ]
                ]
            }
        };

        doc.content.push(bodies);

        // 支払先・支払額情報
        const billing_title_template = {
            text: "",
            bold: true,
            alignment: "center",
            color: white,
            fillColor: orange,
            borderColor: [orange, orange, orange, orange],
            rowSpan: 1
        };
        const billing_value_template = {
            text: "",
            fontSize: 10,
            alignment: "center",
            borderColor: [orange, orange, orange, orange],
            border: false,
            rowSpan: 1
        };

        // テンプレートのオブジェクトをディープコピーして必要な部分だけ設定
        const closing_date_title = JSON.parse(JSON.stringify(billing_title_template));
        closing_date_title.text = "対象となる締め日";
        closing_date_title.borderColor = [orange, orange, orange, white];

        const closing_date = JSON.parse(JSON.stringify(billing_value_template));
        closing_date.text = formatYMD(parent_record[fieldClosingDate_COLLECT]["value"]);

        const deadline_title = JSON.parse(JSON.stringify(billing_title_template));
        deadline_title.text = "お支払期限";
        deadline_title.borderColor = [orange, white, orange, white];

        const deadline = JSON.parse(JSON.stringify(billing_value_template));
        const ymd_arr = parent_record[fieldDeadline_COLLECT]["value"].split("-").map((num) => Number(num));
        const base_deadline_date = new Date(ymd_arr[0], ymd_arr[1]-1, ymd_arr[2]);
        const actual_deadline_date = getNearestWeekday(base_deadline_date, parent_record[fieldHandleForHolidays_COLLECT]["value"]);
        deadline.text = `${actual_deadline_date.getFullYear()}年${actual_deadline_date.getMonth()+1}月${actual_deadline_date.getDate()}日`;

        const billed_amount_title = JSON.parse(JSON.stringify(billing_title_template));
        billed_amount_title.text = "ご請求金額\n（消費税込み）";
        billed_amount_title.borderColor = [orange, white, orange, orange];

        const billed_amount = JSON.parse(JSON.stringify(billing_value_template));
        const total = addComma(parent_record[fieldTotalBilledAmount_COLLECT]["value"]);
        billed_amount.text = `${total}円`;
        billed_amount.bold = true;
        // セルの縦幅の中で中央に寄せたいが、alignmentは横幅しかサポートしていないため、marginで手動調整をかける
        billed_amount.margin = [0, 6.5, 0, 0];

        const account_title = JSON.parse(JSON.stringify(billing_title_template));
        account_title.text = "振込先口座";
        account_title.rowSpan = 3;
        account_title.margin = [0, 30, 0, 0];

        const account_value = JSON.parse(JSON.stringify(billing_value_template));
        account_value.text = getAccount(contact_company, parent_record[fieldConstructionShopId_COLLECT]["value"]);
        account_value.rowSpan = 3;
        account_value.fontSize = 8;
        account_value.margin = ((text) => {
            let top_margin = 14;
            if ((text.match(/\n/g) || []).length === 3) {
                // 4行に亘る場合はマージンを調整
                top_margin = 10;
            }
            return [0, top_margin, 0, 0];
        })(account_value.text);

        const bill_table = {
            table: {
                widths: ["20%", "30%", "20%", "30%"],
                headerRows: 0,
                body: [
                    [closing_date_title , closing_date,   account_title, account_value],
                    [deadline_title,      deadline,       {},            {}           ],
                    [billed_amount_title, billed_amount,  {},            {}           ]
                ]
            },
            margin: [0, 25, 0, 0]
        };
        doc.content.push(bill_table);

        const about_transfer_fee = {
            text: "※お振込手数料はお客様にてご負担をお願いいたします。",
            bold: true
        };
        doc.content.push(about_transfer_fee);

        const detail_table_title = {
            text: "支払明細",
            bold: true,
            margin: [0, 20, 0, 0]
        };
        doc.content.push(detail_table_title);

        const detail_table = ((constructor_id, details, total) => {
            if (KE_BAN_CONSTRUCTORS.includes(constructor_id)) {
                return getWfiDetailTable(details, total);
            } else {
                return getLaglessDetailTable(details, total);
            }
        })(parent_record[fieldConstructionShopId_COLLECT]["value"], parent_record["invoiceTargets"]["value"], total);
        doc.content.push(detail_table);

        doc.content.push(bar);

        return doc;
    }

    const getWfiDetailTable = (collect_record_details, total) => {
        // 振込依頼書PDFに表示する支払明細テーブルのpdfDocオブジェクトを生成する
        // FIXME: ラグレスの場合とほとんど処理が共通なので、共通にしても良さそうな部分をもっと共通化する
        const detail_table = {
            table: {
                widths: ["5%", "48%", "17%", "30%"],
                headerRows: 1,
                body: []
            },
            margin: [0, 5, 0, 15]
        };

        const header_text_style = {
            text: "",
            fontSize: 8,
            bold: true,
            lineHeight: 1,
            alignment: "center",
            color: white,
            fillColor: orange,
            borderColor: [orange, orange, orange, black]
        };

        const columns = [
            {
                title: "No.",
                detail_style: {
                    alignment: "right",
                    borderColor: [white, black, orange, black]
                }
            },
            {
                title: "支払先ドライバー名",
                detail_style: {
                    value: {
                        code: tableFieldApplicantOfficialNameIV_COLLECT,
                        format: null
                    },
                    alignment: "left",
                    borderColor: [orange, black, orange, black]
                }
            },
            {
                title: "支払日",
                detail_style: {
                    value: {
                        code: tableFieldPaymentDateIV_COLLECT,
                        format: formatYMD
                    },
                    alignment: "left",
                    borderColor: [orange, black, orange, black]
                }
            },
            {
                title: "金額（税込：円）",
                detail_style: {
                    value: {
                        code: tableFieldReceivableIV_COLLECT,
                        format: addComma
                    },
                    alignment: "right",
                    borderColor: [orange, black, white, black]
                }
            },
        ];
        const header_row = columns.map((c) => {
            // オブジェクトを複製して使用する
            const pdfDoc_table_cell = JSON.parse(JSON.stringify(header_text_style));
            pdfDoc_table_cell.text = c.title;
            return pdfDoc_table_cell;
        });
        detail_table.table.body.push(header_row);

        detail_table.table.body.push(...getDetailRowsDocObject(collect_record_details, columns));

        const sum_title = JSON.parse(JSON.stringify(header_text_style));
        sum_title.text = "合計金額";
        sum_title.borderColor = [orange, orange, orange, orange];

        const sum_amount = {
            text: total,
            alignment: "right",
            borderColor: [orange, orange, orange, orange],
            bold: true
        };

        const blank_cell = {text: "", border: [false]};
        const sum_row = [
            blank_cell,
            blank_cell,
            sum_title,
            sum_amount
        ];
        detail_table.table.body.push(sum_row);

        return detail_table;
    };

    const getLaglessDetailTable = (collect_record_details, total) => {
        // 振込依頼書PDFに表示する支払明細テーブルのpdfDocオブジェクトを生成する
        const detail_table = {
            table: {
                widths: ["5%", "32%", "16%", "17%", "30%"],
                headerRows: 1,
                body: []
            },
            margin: [0, 5, 0, 15]
        };

        const header_text_style = {
            text: "",
            fontSize: 8,
            bold: true,
            lineHeight: 1,
            alignment: "center",
            color: white,
            fillColor: orange,
            borderColor: [orange, orange, orange, black]
        };

        const columns = [
            {
                title: "No.",
                detail_style: {
                    alignment: "right",
                    borderColor: [white, black, orange, black]
                }
            },
            {
                title: "支払先",
                detail_style: {
                    value: {
                        code: tableFieldApplicantOfficialNameIV_COLLECT,
                        format: null
                    },
                    alignment: "left",
                    borderColor: [orange, black, orange, black]
                }
            },
            {
                title: "支払タイミング",
                detail_style: {
                    value: {
                        code: tableFieldPaymentTimingIV_COLLECT,
                        format: get_display_payment_timing
                    },
                    alignment: "left",
                    borderColor: [orange, black, orange, black]
                }
            },
            {
                title: "支払日",
                detail_style: {
                    value: {
                        code: tableFieldPaymentDateIV_COLLECT,
                        format: formatYMD
                    },
                    alignment: "left",
                    borderColor: [orange, black, orange, black]
                }
            },
            {
                title: "金額（税込：円）",
                detail_style: {
                    value: {
                        code: tableFieldReceivableIV_COLLECT,
                        format: addComma
                    },
                    alignment: "right",
                    borderColor: [orange, black, white, black]
                }
            },
        ];
        const header_row = columns.map((c) => {
            // オブジェクトを複製して使用する
            const pdfDoc_table_cell = JSON.parse(JSON.stringify(header_text_style));
            pdfDoc_table_cell.text = c.title;
            return pdfDoc_table_cell;
        });
        detail_table.table.body.push(header_row);

        detail_table.table.body.push(...getDetailRowsDocObject(collect_record_details, columns));

        const sum_title = JSON.parse(JSON.stringify(header_text_style));
        sum_title.text = "合計金額";
        sum_title.borderColor = [orange, orange, orange, orange];

        const sum_amount = {
            text: total,
            alignment: "right",
            borderColor: [orange, orange, orange, orange],
            bold: true
        };

        const blank_cell = {text: "", border: [false]};
        const sum_row = [
            blank_cell,
            blank_cell,
            blank_cell,
            sum_title,
            sum_amount
        ];
        detail_table.table.body.push(sum_row);

        return detail_table;
    };

    function getDetailRowsDocObject(detail_records, columns) {
        const detail_style_template = {
            text: "",
            alignment: "",
            lineHeight: 1,
            borderColor: [orange, black, orange, black]
        };
        const paid_rows = detail_records.map((record, index) => {
            return columns.map((column) => {
                const cell = JSON.parse(JSON.stringify(detail_style_template));

                const style = column.detail_style;
                if (style.value) {
                    const text = record["value"][style.value.code]["value"];
                    if (style.value.format) {
                        cell.text = style.value.format(text);
                    } else {
                        cell.text = text;
                    }
                } else if (column.title.includes("No")) {
                    // 行番号
                    cell.text = String(index + 1);
                }

                if (style.alignment) {
                    cell.alignment = style.alignment;
                }

                if (style.borderColor) {
                    cell.borderColor = style.borderColor;
                }

                return cell;
            });
        });

        // 明細は15行以上。15行より少ない場合は余白行を作り、15行以上の場合は明細の数のまま
        let details = paid_rows;
        if (paid_rows.length < 15) {
            const getBlankRow = (columns, row_num) => {
                // 行番号のみを記入し、他の列は全て空欄の行オブジェクトを得る
                return columns.map((c) => {
                    const cell = JSON.parse(JSON.stringify(detail_style_template));

                    if (c.title.includes("No")) {
                        cell.text = String(row_num);
                        cell.alignment = "right";
                    }

                    if (c.detail_style.borderColor) {
                        cell.borderColor = c.detail_style.borderColor;
                    }

                    return cell;
                });
            };

            // 15行に足りないぶんだけ、全ての行をblank_rowで埋めた配列を得る
            // 解説: https://ginpen.com/2018/12/10/create-array-with-specified-length/
            const blank_rows = [...Array(15 - paid_rows.length)]
                .map((_, i) => getBlankRow(columns, i + paid_rows.length + 1));

            // blank_rowの最初の要素にのみ「以下余白」のテキストを記入
            // 列のスタイルに関わらず中央寄せ固定
            blank_rows[0][1].text = "以下余白";
            blank_rows[0][1].alignment = "center";

            details = paid_rows.concat(blank_rows);
        }

        return details;
    }

    // 1日ずつ再帰的に日付をずらして、最も近い平日を取得
    const getNearestWeekday = function(date, handle_holiday) {
        if (dateFns.isWeekend(date) || holiday_jp.isHoliday(date)) {
            let calced_date = date;

            if (handle_holiday === "前営業日") {
                calced_date = dateFns.subDays(date, 1);
            } else if (handle_holiday === "翌営業日") {
                calced_date = dateFns.addDays(date, 1);
            } else {
                throw new Error(`休日の取扱が前営業日でも翌営業日でもありません：${handle_holiday}`);
            }

            return getNearestWeekday(calced_date, handle_holiday);
        }

        return date;
    };

    async function uploadInvoices(invoices) {
        console.log("生成した振込依頼書を各レコードに添付する");

        let count = 0;
        const processes = [];
        for (const invoice_obj of invoices) {
            const pdf_data = new FormData();
            pdf_data.append("__REQUEST_TOKEN__", kintone.getRequestToken());

            // getBlob(func)は非同期処理だけどPromiseを返さない（というかコールバック関数を省略できない）ので自前でPromiseを使う
            const process = new kintone.Promise((resolve, reject) => {
                invoice_obj.doc_generator.getBlob(async (blob) => {
                    console.log(`PDFアップロード：ファイル名 ${invoice_obj.file_name}`);
                    pdf_data.append("file", blob, invoice_obj.file_name);

                    const param = {
                        method: "POST",
                        headers: {
                            "X-Requested-With": "XMLHttpRequest"
                        },
                        body: pdf_data
                    };
                    const upload = await fetch(kintone.api.url("/k/v1/file", true), param)
                        .catch((err) => {
                            reject(err);
                        });

                    const upload_resp = await upload.json();
                    if (!upload_resp.fileKey) {
                        reject("fileKeyを取得できませんでした");
                    }

                    console.log(`PDF添付：レコード番号 ${invoice_obj.id}`);
                    const attach_pdf_body = {
                        "app": APP_ID_COLLECT,
                        "id": invoice_obj.id,
                        "record": {
                            [fieldInvoicePdf_COLLECT]: {
                                "value": [
                                    {
                                        "fileKey": upload_resp.fileKey
                                    }
                                ]
                            },
                            // 新規作成した振込依頼書について、目視確認が未完了の状態に戻す
                            [fieldConfirmStatusInvoice_COLLECT]: {
                                "value": []
                            }
                            // 状態フィールドは振込依頼書の目視確認がOKで送信が確定した段階になってから、子レコードと一緒に変更する
                        }
                    };
                    await kintone.api(kintone.api.url("/k/v1/record", true), "PUT", attach_pdf_body)
                        .catch((err) => {
                            reject(err);
                        });

                    count++;
                    resolve();
                });
            });

            processes.push(process);
        }

        await kintone.Promise.all(processes);
        return count;
    }
})();
