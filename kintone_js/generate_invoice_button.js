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
const pdfMake = require("./lib/pdfmake.min.js");
require("./lib/vfs_fonts.js");
const PDF_FONT = "Koruri";
pdfMake.fonts = {
    [PDF_FONT]: {
        normal: "Koruri-Light.ttf",
        bold: "Koruri-Bold.ttf"
    }
};

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
                fieldMailToInvest_COLLECT
            ],
            "query": `${fieldStatus_COLLECT} in ("${statusPaid_COLLECT}") and ${fieldParentCollectRecord_COLLECT} in ("${statusParent_COLLECT}")`
        };
        const target_parents = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", get_parents);

        const attachment_pdfs = [];
        for(const parent_record of target_parents.records) {
            const invoice_doc = await generateInvoiceDocument(parent_record);
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

    async function generateInvoiceDocument(parent_record) {
        // pdfmakeのライブラリ用のオブジェクトを生成する。
        const product_name = parent_record[fieldProductName_COLLECT]["value"];
        const company = parent_record[fieldConstructionShopName_COLLECT]["value"];
        const doc = {
            info: {
                title: `${company}様宛${product_name}利用分振込依頼書`,
                author: `${product_name}事務局 インベストデザイン株式会社`,
                subject: `${formatYMD(parent_record[fieldClosingDate_COLLECT]["value"])}締め分`,
                creator: `${product_name}事務局 インベストデザイン株式会社`,
                producer: `${product_name}事務局 インベストデザイン株式会社`,
            },
            content: [],
            pageSize: "A4",
            pageMargins: [55, 30, 55, 30],
            defaultStyle: {
                font: PDF_FONT,
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
        const today = new Date();
        const send_date = {
            text: `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`,
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
            image: "data:image/png;base64,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eXTx33/AONsI5p3f//Z",
            width: 50,
            border: [false],
            alignment: "center"
        };

        const mail = parent_record[fieldMailToInvest_COLLECT]["value"];
        const invoice_from = {
            text: [
                `【${product_name}事務局】\n`,
                {
                    text: "インベストデザイン株式会社\n",
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
                    [letter_body, {text: "", border: [false]},                    logo ],
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
        deadline.text = formatYMD(parent_record[fieldDeadline_COLLECT]["value"]);

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
                    [deadline_title,      deadline,       "",            ""],
                    [billed_amount_title, billed_amount,  "",            ""]
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

        const detail_rows = await getDetailRows(parent_record);
        detail_table_body.push(...detail_rows);

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

    async function getDetailRows(parent_record) {
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
        const apply_resp = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", get_apply);

        const detail_value_template = {
            text: "",
            alignment: "",
            lineHeight: 1,
            borderColor: [orange, black, orange, black]
        };
        const details = apply_resp.records.map((record, index) => {
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
            // 一行だけ「以下余白」の行を挿入
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
})();
