/*
    Version 1.1
    振込依頼書をPDF形式で作成し、kintoneの添付ファイルフィールドに保存する。

    Version 1
    1: 回収アプリの支払実行済みレコードを、工務店IDと回収期限が同一のグループでまとめる。
    まとめた中でレコード番号が最も小さいものを親レコードとし、振込依頼書作成に必要な申込レコードの情報と最終的な振込金額の合計を集約する。
    2: 工務店への振込依頼書を作成する。親レコード1件に対して振込依頼書を1通。子レコードに対しては何もしない。
    作成した振込依頼書はプレーンテキストでローカルに保存する。
*/

// PDF生成ライブラリ
const pdfMake = require("pdfmake");
const PDF_FONT_NAME = "Koruri";

// PDF内で使う画像
const id_logo = require("./images/id_logo.png");

// 祝日判定ライブラリ
const holiday_jp = require("@holiday-jp/holiday_jp");
const dateFns = require("date-fns");

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
        "ID": "三井住友銀行　神田支店\n普通預金　3 3 9 1 1 9 5\nインベストデザイン（カ",
        "LAGLESS": "三井住友銀行　神田支店\n普通預金　3 4 0 9 1 3 4\nラグレス（ド，マスターコウザ"
    };

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
    const fieldStatus_COLLECT = "collectStatus";
    const statusPaid_COLLECT = "支払実行済み";
    const fieldParentCollectRecord_COLLECT = "parentCollectRecord";
    const statusParent_COLLECT = "true";
    const fieldTotalBilledAmount_COLLECT = "totalBilledAmount";
    const tableCloudSignApplies_COLLECT = "cloudSignApplies";
    const tableFieldApplyRecordNoCS_COLLECT = "applyRecordNoCS";
    const tableFieldApplicantOfficialNameCS_COLLECT = "applicantOfficialNameCS";
    const tableFieldReceivableCS_COLLECT = "receivableCS";
    const tableInvoiceTargets_COLLECT = "invoiceTargets";
    const tableFieldApplyRecordNoIV_COLLECT = "applyRecordNoIV";
    const tableFieldApplicantOfficialNameIV_COLLECT = "applicantOfficialNameIV";
    const tableFieldReceivableIV_COLLECT = "receivableIV";
    const fieldInvoicePdf_COLLECT = "invoicePdf";
    const fieldHandleForHolidays_COLLECT = "handleForHolidays";

    const APP_ID_APPLY = APP_ID.APPLY;
    const fieldRecordId_APPLY = "$id";
    const fieldPayDestName_APPLY = "支払先正式名称";
    const fieldPayDate_APPLY = "paymentDate";
    const fieldReceivables_APPLY = "totalReceivables";

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
        const clicked_ok = confirm("支払実行済みのレコードに対して、振込依頼書を作成しますか？");
        if (!clicked_ok) {
            alert("処理は中断されました。");
            return;
        }

        const text_ready = this.innerText;
        this.innerText = "振込依頼書を作成中...";

        try {
            // 状態が支払実行済みのレコードを取得
            const paid = await getPaidRecords()
                .catch((err) => {
                    console.error(err);
                    throw new Error("支払実行済みの回収レコードの取得中にエラーが発生しました。");
                });

            if (paid.records.length === 0) {
                alert("支払実行済みのレコードはありませんでした。");
                return;
            }

            // updateのための、明細や金額を集約したあとの親レコード配列を取得
            const parents = getAggregatedParentRecords(paid.records);

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

            alert(`${completed_count}件 振込依頼書の作成が完了しました。\n\nそれぞれのレコードの添付ファイルを確認したのち、\nレコード詳細画面の確認OKボタンを押してください。\n確認OKになったレコードの振込依頼書が自動的に送信されます。`);

        } catch(err) {
            alert(err);
        } finally {
            this.innerText = text_ready;
        }
    }

    function getPaidRecords() {
        console.log("回収アプリから支払実行済みのレコードを全て取得する");

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
                fieldParentCollectRecord_COLLECT,
                fieldTotalBilledAmount_COLLECT,
                tableCloudSignApplies_COLLECT,
                tableInvoiceTargets_COLLECT
            ],
            "query": `${fieldStatus_COLLECT} in ("${statusPaid_COLLECT}")`
        };

        return kintone.api(kintone.api.url("/k/v1/records", true), "GET", request_body);
    }

    function getAggregatedParentRecords(paid_records) {
        console.log("支払い済みレコードを締日と工務店IDごとにまとめ、明細の情報を親に集約する");
        // まず工務店IDと締日だけ全て抜き出す
        const key_pairs = paid_records.map((record) => {
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
            const invoice_group = paid_records.filter((record) => {
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
        // 支払実行済みの親レコードを全て取得
        const get_parents = {
            "app": APP_ID_COLLECT,
            "fields": [
                fieldRecordId_COLLECT,
                fieldConstructionShopName_COLLECT,
                fieldCeoTitle_COLLECT,
                fieldCeo_COLLECT,
                fieldProductName_COLLECT,
                fieldClosingDate_COLLECT,
                fieldDeadline_COLLECT,
                fieldTotalBilledAmount_COLLECT,
                tableInvoiceTargets_COLLECT,
                fieldAccount_COLLECT,
                fieldMailToInvest_COLLECT,
                fieldHandleForHolidays_COLLECT
            ],
            "query": `${fieldStatus_COLLECT} in ("${statusPaid_COLLECT}") and ${fieldParentCollectRecord_COLLECT} in ("${statusParent_COLLECT}")`
        };
        const target_parents = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", get_parents);

        // フォント設定
        await build_font();

        const attachment_pdfs = [];
        for(const parent_record of target_parents.records) {
            const details_resp = await getDetailRows(parent_record);
            parent_record.detail_records = details_resp.records;
            const invoice_doc = generateInvoiceDocument(parent_record);
            const file_name = `${parent_record[fieldConstructionShopName_COLLECT]["value"]}様用 支払明細書兼振込依頼書${formatYMD(parent_record[fieldClosingDate_COLLECT]["value"])}締め分.pdf`;

            console.log("作成した振込依頼書をPDF形式で生成");
            // 添付先のレコード番号と添付するファイルをオブジェクトにして返す
            attachment_pdfs.push({
                "id": parent_record[fieldRecordId_COLLECT]["value"],
                "file_name": file_name,
                "doc_generator": pdfMake.createPdf(invoice_doc)
            });
        }

        return attachment_pdfs;
    }

    function generateInvoiceDocument(parent_record) {
        // pdfmakeのライブラリ用のオブジェクトを生成する。
        const product_name = parent_record[fieldProductName_COLLECT]["value"];
        const company = parent_record[fieldConstructionShopName_COLLECT]["value"];
        const contact_company = {
            "ID": "インベストデザイン株式会社",
            "LAGLESS": "ラグレス合同会社"
        }[parent_record[fieldAccount_COLLECT]["value"]];

        if (!contact_company) {
            throw new Error(`不明な支払元口座です: ${parent_record[fieldAccount_COLLECT]["value"]}`);
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
                font: PDF_FONT_NAME,
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
        const detail_payment_dates =  parent_record.detail_records.map((record) => {
            const ymd_array = (record[fieldPayDate_APPLY]["value"]).split("-").map((n) => Number(n));
            return new Date(ymd_array[0], ymd_array[1]-1, ymd_array[2]);
        });
        const latest_date = new Date(Math.max(...(detail_payment_dates.map((dt) => dt.getTime()))));
        const send_date = {
            text: `${latest_date.getFullYear()}年${latest_date.getMonth() + 1}月${latest_date.getDate()}日`,
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
                "さて、下記のとおり早期支払を実行いたしましたのでご案内いたします。\n",
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

        const logo = {
            image: id_logo.default,
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
                "東京都千代田区一番町15番地1\n",
                "一番町ファーストビル6階\n",
                `Mail:${mail}\n`,
                "TEL:03-6261-6818\n"
            ],
            border: [false]
        };

        // 文章と連絡先を横並びに
        const bodies = {
            table: {
                headerRows: 0,
                // autoの列はセルを塗りつぶして擬似的に縦のラインを作るためのもの
                widths: ["75%", "auto", "25%"],
                body: [
                    [letter_body, {text: "", border: [false]},                    logo         ],
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

        const account_id = parent_record[fieldAccount_COLLECT]["value"];
        if (!(account_id in ACCOUNTS)) {
            throw new Error(`不明な支払先口座IDです：${account_id}`);
        }

        const account_value = JSON.parse(JSON.stringify(billing_value_template));
        account_value.text = ACCOUNTS[account_id];
        account_value.rowSpan = 3;
        account_value.fontSize = 9;
        account_value.margin = [0, 14, 0, 0];

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

        const detail_title_template = {
            text: "",
            fontSize: 8,
            bold: true,
            lineHeight: 1,
            alignment: "center",
            color: white,
            fillColor: orange,
            borderColor: [orange, orange, orange, black]
        };

        const row_num_title = JSON.parse(JSON.stringify(detail_title_template));
        row_num_title.text = "No.";

        const paid_dist_title = JSON.parse(JSON.stringify(detail_title_template));
        paid_dist_title.text = "支払先";

        const paid_date_title = JSON.parse(JSON.stringify(detail_title_template));
        paid_date_title.text = "早期支払日";

        const paid_amount_title = JSON.parse(JSON.stringify(detail_title_template));
        paid_amount_title.text = "金額（税込：円）";

        const detail_header_row = [row_num_title , paid_dist_title, paid_date_title, paid_amount_title];

        const detail_table_body = [];
        detail_table_body.push(detail_header_row);

        const detail_doc = getDetailDoc(parent_record.detail_records);
        detail_table_body.push(...detail_doc);

        const sum_title = JSON.parse(JSON.stringify(detail_title_template));
        sum_title.text = "合計金額";
        sum_title.borderColor = [orange, orange, orange, orange];

        const sum_amount = {
            text: total,
            alignment: "right",
            borderColor: [orange, orange, orange, orange],
            bold: true
        };

        const blank_cell = {text: "", border: [false]};
        const sum_row = [ blank_cell, blank_cell, sum_title, sum_amount ];
        detail_table_body.push(sum_row);

        const detail_table = {
            table: {
                widths: ["5%", "45%", "20%", "30%"],
                headerRows: 1,
                body: detail_table_body
            },
            margin: [0, 5, 0, 15]
        };

        doc.content.push(detail_table);

        doc.content.push(bar);

        return doc;
    }

    function getDetailRows(parent_record) {
        // 支払日等を申込アプリから取得。支払日以外は既に親レコードの中に持ってるけど、どうせ取るなら全部取ってしまうことにした
        const get_apply = {
            "app": APP_ID_APPLY,
            "fields": [
                fieldPayDestName_APPLY,
                fieldPayDate_APPLY,
                fieldReceivables_APPLY
            ],
            "query": `${fieldRecordId_APPLY} in ("${parent_record[tableInvoiceTargets_COLLECT]["value"].map((apply) => apply["value"][tableFieldApplyRecordNoIV_COLLECT]["value"]).join("\",\"")}")`
        };
        return kintone.api(kintone.api.url("/k/v1/records", true), "GET", get_apply);
    }

    function getDetailDoc(detail_records) {
        const detail_value_template = {
            text: "",
            alignment: "",
            lineHeight: 1,
            borderColor: [orange, black, orange, black]
        };
        const details = detail_records.map((record, index) => {
            const row_num = JSON.parse(JSON.stringify(detail_value_template));
            row_num.text = String(index + 1);
            row_num.alignment = "right";
            row_num.borderColor = [white, black, orange, black];

            const paid_dist = JSON.parse(JSON.stringify(detail_value_template));
            paid_dist.text = record[fieldPayDestName_APPLY]["value"];
            paid_dist.alignment = "left";

            const paid_date = JSON.parse(JSON.stringify(detail_value_template));
            paid_date.text = formatYMD(record[fieldPayDate_APPLY]["value"]);
            paid_date.alignment = "left";

            const paid_amount = JSON.parse(JSON.stringify(detail_value_template));
            paid_amount.text = addComma(record[fieldReceivables_APPLY]["value"]);
            paid_amount.alignment = "right";
            paid_amount.borderColor = [orange, black, white, black];

            return [row_num, paid_dist, paid_date, paid_amount];
        });

        // 明細は15行以上。15行より少ない場合は余白行を作り、15行以上の場合は明細の数のまま
        if (details.length < 15) {
            // 初めに一行だけ「以下余白」の行を挿入
            const row_num = JSON.parse(JSON.stringify(detail_value_template));
            row_num.text = String(details.length + 1);
            row_num.alignment = "right";
            row_num.borderColor = [white, black, orange, black];

            const following_are_blank = JSON.parse(JSON.stringify(detail_value_template));
            following_are_blank.text = "以下余白";
            following_are_blank.alignment = "center";

            const blank_cell = {text: "", borderColor: [orange, black, orange, black]};
            const blank_cell_right_edge = {text: "", borderColor: [orange, black, white, black]};

            details.push([row_num, following_are_blank, blank_cell, blank_cell_right_edge]);

            for (let i = details.length; i < 15; i++) {
                const row_num = JSON.parse(JSON.stringify(detail_value_template));
                row_num.text = String(i + 1);
                row_num.alignment = "right";
                row_num.borderColor = [white, black, orange, black];

                details.push([row_num, blank_cell, blank_cell, blank_cell_right_edge]);
            }
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

    function formatYMD(yyyy_mm_dd) {
        // Numberでキャストしてゼロ埋めされているのを取り除く
        const date = String(yyyy_mm_dd).split("-");
        return `${String(Number(date[0]))}年${String(Number(date[1]))}月${String(Number(date[2]))}日`;
    }

    function addComma(num) {
        // 数字に3桁区切りのコンマを挿入した文字列を返す。整数のみ考慮
        return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }

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

    const convertBlobToBase64 = blob => new Promise((resolve, reject) => {
        const reader = new FileReader;
        reader.onerror = reject;
        reader.onload = () => {
            resolve(reader.result.replace(/^data:text\/plain;([^,]+)?base64,/, ''));
        };
        reader.readAsDataURL(blob)
    });

    async function build_font() {
        const make_url = name => {
            return "https://firebasestorage.googleapis.com/v0/b/lagless.appspot.com/o/fonts%2F" + name + "?alt=media";
        };

        if (pdfMake.vfs && pdfMake.vfs["Koruri-Light.ttf"] && pdfMake.vfs["Koruri-Bold.ttf"]) {
            console.log("フォントをダウンロード済みのため、設定をスキップします");
            return;
        }

        await Promise.all([
            fetch(make_url("Koruri-Light.ttf"))
            .then(response => response.blob())
            .then(convertBlobToBase64),
            fetch(make_url("Koruri-Bold.ttf"))
            .then(response => response.blob())
            .then(convertBlobToBase64),
        ])
        .then(result => {
            pdfMake.vfs = {
                // base64よりあとのdata部分だけが必要
                "Koruri-Light.ttf": result[0].split("base64,")[1],
                "Koruri-Bold.ttf": result[1].split("base64,")[1],
            };
            pdfMake.fonts = {
                [PDF_FONT_NAME]: {
                    normal: "Koruri-Light.ttf",
                    bold: "Koruri-Bold.ttf",
                }
            };
        })
        .catch((err) => {
            console.log(err);
            throw new Error("フォントのダウンロード・設定中にエラーが発生しました。");
        });
    }
})();
