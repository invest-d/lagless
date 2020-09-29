// PDF生成ライブラリ
const pdfMake = require("pdfmake");
const PDF_FONT_NAME = "Koruri";

import { build_font } from "./generate_invoice_button";

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
            console.warn(`Unknown app: ${ app_id }`);
        }
    })(kintone.app.getId());

    const APP_ID_COLLECT = APP_ID.COLLECT;
    const fieldRecordId_COLLECT = "$id";
    const fieldStatus_COLLECT = "collectStatus";
    const statusReadyToGenerate_COLLECT = "クラウドサイン作成待ち";
    const fieldConstructorId_COLLECT = "constructionShopId";
    const fieldAccount_COLLECT = "account";
    const fieldSendDate_COLLECT = "cloudSignSendDate";
    const fieldClosing_COLLECT = "closingDate";
    const fieldSubtableCS_COLLECT = "cloudSignApplies";
    const fieldAcceptanceLetterPdf_COLLECT = "cloudSignPdf";

    const APP_ID_CONSTRUCTOR = "96";
    const fieldConstructorId_CONSTRUCTOR = "id";
    const fieldCorporateId_CONSTRUCTOR = "customerCode";

    const APP_ID_CORPORATE = "28";
    const fieldRecordId_CORPORATE = "$id";
    const fieldCorporateName_CORPORATE = "法人名・屋号";
    const fieldAddress_CORPORATE = "住所_本店";
    const fieldCeoTitle_CORPORATE = "代表者名_役職";
    const fieldCeoName_CORPORATE = "代表者名";

    const client = new KintoneRestAPIClient({baseUrl: "https://investdesign.cybozu.com"});

    kintone.events.on("app.record.index.show", (event) => {
        // ボタンを表示するか判定
        if (needShowButton()) {
            const button = createButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    const button_id = "generate_acceptance_letter";
    function needShowButton() {
        // 一旦は常にボタンを表示する。増殖バグだけ防止
        return document.getElementById(button_id) === null;
    }

    function createButton() {
        const button = document.createElement("button");
        button.id = button_id;
        button.innerText = "各レコードに債権譲渡承諾書を作成する";
        button.addEventListener("click", clickButton);
        return button;
    }

    // ボタンクリック時の処理を定義
    async function clickButton() {
        const text_ready = this.innerText;
        this.innerText = "作成中...";

        const clicked_ok = confirm(`「${statusReadyToGenerate_COLLECT}」の各レコードに、債権譲渡承諾書のPDFファイルを作成しますか？\n\n` +
            "※各レコードに「クラウドサイン送信予定日」を入力してください。PDF右上の日付として作成されます。ブランクのレコードにはPDFを作成しません。\n" +
            "※既に債権譲渡承諾書が添付されている場合、ファイルは上書きします。");
        if (!clicked_ok) {
            alert("処理は中断されました。");
            this.innerText = text_ready;
            return;
        }

        const blank_date_ids = [];
        try {
            const targets = await getTargetRecords()
                .catch((err) => {
                    console.error(err);
                    throw new Error("回収レコードの取得中にエラーが発生しました。");
                });

            const constructor_ids = Array.from(new Set(targets.map((record) => record[fieldConstructorId_COLLECT]["value"])));
            const corporate_ids_by_constructor = await getCorporateIdsByConstructor(constructor_ids)
                .catch((err) => {
                    console.error(err);
                    throw new Error("工務店レコードの取得中にエラーが発生しました。");
                });

            const corporates_by_id = await getCorporateRecordsByRecordId(Object.values(corporate_ids_by_constructor))
                .catch((err) => {
                    console.error(err);
                    throw new Error("取引企業管理レコードの取得中にエラーが発生しました。");
                });

            // フォント設定
            await build_font();

            const file_processes = [];
            for (const record of targets) {
                if (!record[fieldSendDate_COLLECT]["value"]) {
                    blank_date_ids.push(record[fieldRecordId_COLLECT]["value"]);
                    continue;
                }

                // 各レコードについてPDFドキュメントを生成する
                const letter_doc = generateInvoiceDocument();

                // PDFドキュメントをBlobデータに変換・アップロードする
                const file_process = new Promise((resolve) => {
                    pdfMake.createPdf(letter_doc).getBlob(async (blob) => {
                        const letter = {
                            "id": record[fieldRecordId_COLLECT]["value"],
                            "name": "test_pdf_data.pdf",
                            "data": blob
                        };

                        await attachPdf(letter)
                            .catch((err) => {
                                console.error(err);
                                throw new Error("債権譲渡承諾書の添付中にエラーが発生しました。");
                            });

                        resolve();
                    });
                });

                file_processes.push(file_process);
            }

            await Promise.all(file_processes);
            alert(`${file_processes.length}件 債権譲渡承諾書の作成が完了し、各レコードの添付ファイルとして保存しました。\n\n内容の目視確認は別途実施してください。`);
        } catch(err) {
            alert(err);
        } finally {
            if (blank_date_ids.length > 0) {
                alert("クラウドサイン送信日時を入力していないため、次のレコード番号のレコードは処理されませんでした：\n\n"
                    + `${blank_date_ids.join(", ")}`);
            }
            this.innerText = text_ready;
        }
    }

    function getTargetRecords() {
        // 送信予定日時フィールドが入っているもののみ処理するが、入っていないものには警告を出したいので両方レコード取得する
        const request_body = {
            "app": APP_ID_COLLECT,
            "fields":[
                fieldRecordId_COLLECT,
                fieldAccount_COLLECT,
                fieldSendDate_COLLECT,
                fieldClosing_COLLECT,
                fieldSubtableCS_COLLECT,
                fieldConstructorId_COLLECT
            ],
            "condition": `${fieldStatus_COLLECT} in ("${statusReadyToGenerate_COLLECT}")`
        };

        return client.record.getAllRecords(request_body);
    }

    async function getCorporateIdsByConstructor(constructor_ids) {
        const ids = constructor_ids.map((id) => `"${id}"`).join(",");

        const request_body = {
            "app": APP_ID_CONSTRUCTOR,
            "fields":[
                fieldConstructorId_CONSTRUCTOR,
                fieldCorporateId_CONSTRUCTOR
            ],
            "condition": `${fieldConstructorId_CONSTRUCTOR} in (${ids})`,
        };

        const records = await client.record.getAllRecords(request_body);

        const result = {};
        for (const record of records) {
            result[record[fieldConstructorId_CONSTRUCTOR]["value"]] = record[fieldCorporateId_CONSTRUCTOR]["value"];
        }

        return result;
    }

    async function getCorporateRecordsByRecordId(corporate_ids) {
        // corporate_idsには重複の可能性がある（支払サイトが複数あるなどで、複数の工務店IDが同一の取引企業を指す場合がある）
        const unique_corporate_ids = Array.from(new Set(corporate_ids));
        const quoted_ids = unique_corporate_ids.map((id) => `"${id}"`).join(",");

        const request_body = {
            "app": APP_ID_CORPORATE,
            "fields":[
                fieldRecordId_CORPORATE,
                fieldCorporateName_CORPORATE,
                fieldAddress_CORPORATE,
                fieldCeoTitle_CORPORATE,
                fieldCeoName_CORPORATE
            ],
            "condition": `${fieldRecordId_CORPORATE} in (${quoted_ids})`,
        };

        const records = await client.record.getAllRecords(request_body);

        const result = {};
        for (const record of records) {
            result[record[fieldRecordId_CORPORATE]["value"]] = record;
        }

        return result;
    }

    function generateInvoiceDocument() {
        const gray = "#888888";
        const white = "#FFFFFF";

        const doc = {
            content: [],
            pageSize: "A4",
            pageMargins: [ 55, 55 ],
            styles: {
                tableHeader: {
                    bold: true,
                    fillColor: gray,
                    color: white,
                    alignment: "center",
                }
            },
            defaultStyle: {
                font: PDF_FONT_NAME,
                fontSize: 11,
                lineHeight: 1.2,
            }
        };

        const send_date = {
            text: "2020/10/5",
            alignment: "right"
        };
        doc.content.push(send_date);

        const recipient = {
            text: "債権譲受人 ラグレス2合同会社 御中"
        };
        doc.content.push(recipient);

        const sender_title = {
            text: "債務者（支払企業）",
            margin: [230, 0, 0, 0]
        };
        doc.content.push(sender_title);

        const sender = {
            text: [
                "株式会社テスト工務店\n",
                "京都府京都市上京区智恵光院通り芦山寺上る西入る西社町55番地55\n",
                "代表取締役 石田峻輝"
            ],
            margin: [242, 0, 0, 0]
        };
        doc.content.push(sender);

        const title = {
            text: "債権譲渡承諾書",
            fontSize: 16,
            bold: true,
            alignment: "center",
            margin: [0, 25, 0, 0]
        };
        doc.content.push(title);

        const letter_body = {
            text: [
                "　当社は、下記リストに記載の当社に対する対象債権の債権譲渡につき、異議なく承諾し、"
                + "対象債権の全部又は一部の支払を拒絶することができる事由"
                + "（対象債権の無効・取消、弁済・免除・相殺等の抗弁、"
                + "原契約における義務違反・担保責任に基づく対象債権の減額・原契約の解除を含みます）に基づき、"
                + "対象債権の全部又は一部の協力企業に対する支払を拒絶し得る一切の抗弁権を、放棄します。\n",
                "　下記の金額については、ラグレス2合同会社にお支払いいたします。"
            ],
            preserveLeadingSpaces: true,
            margin: [0, 15, 0, 0]
        };
        doc.content.push(letter_body);

        const list_title = {
            text: [
                "＜債権譲渡希望者リスト＞\n",
                "対象となる締日：2020年9月30日\n\n",
                "※対象債権内容の詳細は、別途添付の請求書に記載しております。"
            ],
            margin: [0, 15, 0, 0]
        };
        doc.content.push(list_title);

        const receivables_table = {
            table: {
                headerRows: 1,
                widths: [ "6%", "21%", "12%", "15%", "18%", "13%", "15%" ],
                // 行の高さはヘッダー行のみ少し高くする
                heights: (row) => (row === 0) ? 30 : 10,
                body: []
            },
            layout: {
                // 明細行どうしの境界線のみ細くする
                hLineWidth: (i, node) => (i > 1 && i < node.table.body.length) ? 0.5 : 1,
                vLineWidth: (i, node) => 1
            }
        };

        const header_row = [
            {
                text: "No.",
                style: "tableHeader",
                fontSize: 10,
                margin: [ 0, 10, 0, 0 ]
            },
            {
                text: "協力会社名\n（対象債権譲渡企業）",
                style: "tableHeader",
                fontSize: 8,
                margin: [ 0, 6, 0, 0 ]
            },
            {
                text: "支払\nタイミング",
                style: "tableHeader",
                fontSize: 10,
                margin: [ 0, 2, 0, 0 ]
            },
            {
                text: "支払予定日",
                style: "tableHeader",
                fontSize: 10,
                margin: [ 0, 10, 0, 0 ]
            },
            {
                text: "請求書金額\n（税込）",
                style: "tableHeader",
                fontSize: 10,
                margin: [ 0, 2, 0, 0 ]
            },
            {
                text: "差引額\n（協力会費・\n立替金等）",
                style: "tableHeader",
                fontSize: 7,
                margin: [ 0, 0, 0, 0 ]
            },
            {
                text: "債権譲渡の\n対象となる金額",
                style: "tableHeader",
                fontSize: 8,
                margin: [ 0, 6, 0, 0 ]
            }
        ];
        receivables_table.table.body.push(header_row);

        const sample_detail_row = [
            {text: "1", alignment: "right"},
            {text: "company 1", alignment: "left"},
            {text: "早払い", alignment: "left"},
            {text: "2020/8/10", alignment: "right"},
            {text: "110,000", alignment: "right"},
            {text: "1,000", alignment: "right"},
            {text: "109,000", alignment: "right"}
        ];
        // ディープコピーしてダミーの明細行を10行作る
        for (let i = 0; i < 10; i++) {
            receivables_table.table.body.push(JSON.parse(JSON.stringify(sample_detail_row)));
        }
        doc.content.push(receivables_table);

        const total_block = {
            table: {
                widths: [ "*", "24%", "20%" ],
                heights: 10,
                body: [
                    [
                        {text: "", border: [false, false, false, false]},
                        {text: "合計金額", style: "tableHeader"},
                        {text: "439,000 円", alignment: "right"}
                    ]
                ]
            },
            margin: [ 0, 5, 0, 0 ]
        };
        doc.content.push(total_block);

        return doc;
    }

    async function attachPdf(letter) {
        console.log("債権譲渡承諾書ファイルをアップロードし、レコードに添付する。");
        const { fileKey } = await client.file.uploadFile({
            file: letter
        });

        const attach_pdf_body = {
            "app": APP_ID_COLLECT,
            "id": letter.id,
            "record": {
                [fieldAcceptanceLetterPdf_COLLECT]: {
                    "value": [{ fileKey }]
                }
            }
        };

        client.record.updateRecord(attach_pdf_body);
    }

})();
