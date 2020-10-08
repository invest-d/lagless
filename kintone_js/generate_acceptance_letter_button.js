/*
    Version 1
    回収アプリのレコード1つにつき、債権譲渡承諾書のpdfファイルを1つ生成してレコードの当該フィールドに添付する。
    債権譲渡承諾書に記載する明細行の内容は、回収レコード内にあるサブテーブル「クラウドサイン対象の申込レコード一覧」から生成する。
    債権譲渡承諾書に承諾する工務店の企業名などの情報は、法人登記の情報（取引企業管理アプリ）を取得して表示する。
*/

// PDF生成ライブラリ
import { createPdf, PDF_FONTS } from "./pdfMake_util";
import { formatYMD, addComma, get_contractor_name, get_display_payment_timing } from "./util_forms";

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
    const fieldDaysLater_COLLECT = "daysLater";
    const fieldSubtableCS_COLLECT = "cloudSignApplies";
    const tableFieldCustomerName_COLLECT = "applicantOfficialNameCS";
    const tableFieldPaymentTiming_COLLECT = "paymentTimingCS";
    const tableFieldPaymentDate_COLLECT = "paymentDateCS";
    const tableFieldInvoiceAmount_COLLECT = "invoiceAmountCS";
    const tableFieldMemberFee_COLLECT = "membershipFeeCS";
    const tableFieldReceivableAmount_COLLECT = "receivableCS";
    const fieldTotalAmount_COLLECT = "scheduledCollectableAmount";
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

            const corporate_ids_by_constructor_id = await getCorporateIdsByConstructorId(constructor_ids)
                .catch((err) => {
                    console.error(err);
                    throw new Error("工務店レコードの取得中にエラーが発生しました。");
                });

            const corporates_by_id = await getCorporateRecordsByRecordId(Object.values(corporate_ids_by_constructor_id))
                .catch((err) => {
                    console.error(err);
                    throw new Error("取引企業管理レコードの取得中にエラーが発生しました。");
                });

            // 工務店IDから取引企業管理レコードの情報を呼び出せるようにする
            const corporates_by_constructor_id = {};
            for (const constructor_id of constructor_ids) {
                corporates_by_constructor_id[constructor_id] = corporates_by_id[corporate_ids_by_constructor_id[constructor_id]];
            }

            const file_processes = [];
            for (const record of targets) {
                if (!record[fieldSendDate_COLLECT]["value"]) {
                    blank_date_ids.push(record[fieldRecordId_COLLECT]["value"]);
                    continue;
                }

                // 各レコードについてPDFドキュメントを生成する
                const corporate_info = corporates_by_constructor_id[record[fieldConstructorId_COLLECT]["value"]]
                const letter_doc = generateInvoiceDocument(record, corporate_info);
                const generator = await createPdf(letter_doc);

                // PDFドキュメントをBlobデータに変換・アップロードする
                const file_process = new Promise((resolve) => {
                    generator.getBlob(async (blob) => {
                        const filename_closing = dayjs(record[fieldClosing_COLLECT]["value"]).format("YYYY年M月D日");
                        const letter = {
                            "id": record[fieldRecordId_COLLECT]["value"],
                            "name": `${filename_closing}締め分 対象債権リスト（${corporate_info[fieldCorporateName_CORPORATE]["value"]}様）.pdf`,
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
            console.error(err);
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
                fieldTotalAmount_COLLECT,
                fieldSendDate_COLLECT,
                fieldClosing_COLLECT,
                fieldSubtableCS_COLLECT,
                fieldConstructorId_COLLECT,
                fieldDaysLater_COLLECT
            ],
            "condition": `${fieldStatus_COLLECT} in ("${statusReadyToGenerate_COLLECT}")`
        };

        return client.record.getAllRecords(request_body);
    }

    async function getCorporateIdsByConstructorId(constructor_ids) {
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

    function generateInvoiceDocument(record, corporate_info) {
        const gray = "#888888";
        const white = "#FFFFFF";

        const contractor_name = get_contractor_name(record[fieldAccount_COLLECT]["value"], record[fieldDaysLater_COLLECT]["value"]);
        const doc = {
            info: {
                title: `譲渡対象債権リスト（${corporate_info[fieldCorporateName_CORPORATE]["value"]}様）`,
                author: contractor_name,
                subject: `${dayjs(record[fieldClosing_COLLECT]["value"]).format("YYYY年M月D日")}締め分`,
                creator: contractor_name,
                producer: contractor_name,
            },
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
                font: PDF_FONTS.default.name,
                fontSize: 11,
                lineHeight: 1.2,
            }
        };

        const send_date = {
            text: formatYMD(record[fieldSendDate_COLLECT]["value"]),
            alignment: "right"
        };
        doc.content.push(send_date);

        const recipient = {
            text: `債権譲受人 ${contractor_name} 御中`
        };
        doc.content.push(recipient);

        const sender_title = {
            text: "債務者（支払企業）",
            margin: [230, 0, 0, 0]
        };
        doc.content.push(sender_title);

        const sender = {
            text: [
                `${corporate_info[fieldCorporateName_CORPORATE]["value"]}\n`,
                `${corporate_info[fieldAddress_CORPORATE]["value"]}\n`,
                `${corporate_info[fieldCeoTitle_CORPORATE]["value"]} ${corporate_info[fieldCeoName_CORPORATE]["value"]}`
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
                `　下記の金額については、${contractor_name}にお支払いいたします。`
            ],
            preserveLeadingSpaces: true,
            margin: [0, 15, 0, 0]
        };
        doc.content.push(letter_body);

        const list_title = {
            text: [
                "＜債権譲渡希望者リスト＞\n",
                `対象となる締日：${formatYMD(record[fieldClosing_COLLECT]["value"])}\n\n`,
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

        const get_receivable_details = (record) => {
            const target_applies = record[fieldSubtableCS_COLLECT]["value"];
            const display_details = target_applies.map((apply, index) => {
                // 1行目に「1」と表示
                const row = index + 1;

                return [
                    {text: String(row),                                                                          alignment: "right"},
                    {text: apply["value"][tableFieldCustomerName_COLLECT]["value"],                              alignment: "left"},
                    {text: get_display_payment_timing(apply["value"][tableFieldPaymentTiming_COLLECT]["value"]), alignment: "left"},
                    {text: dayjs(apply["value"][tableFieldPaymentDate_COLLECT]["value"]).format("YYYY/M/D"),     alignment: "right"},
                    {text: addComma(apply["value"][tableFieldInvoiceAmount_COLLECT]["value"]),                   alignment: "right"},
                    {text: addComma(apply["value"][tableFieldMemberFee_COLLECT]["value"]),                       alignment: "right"},
                    {text: addComma(apply["value"][tableFieldReceivableAmount_COLLECT]["value"]),                alignment: "right"}
                ];
            });

            // PDFには明細行を最低でも10行以上表示する。つまり、下記のような処理となる。
            if (target_applies.length < 10) {
                // 申込が10行未満の場合：
                // 1. 「以下余白」の行を追加し、
                display_details.push([
                    {text: String(display_details.length + 1), alignment: "right"},
                    {text: "以下余白",                         alignment: "left"},
                    {text: ""},
                    {text: ""},
                    {text: ""},
                    {text: ""},
                    {text: ""}
                ]);

                // 2. 尚且つ明細行が10行になるまで空行を追加する。
                for (let now_rows = display_details.length; now_rows < 10; now_rows++) {
                    display_details.push([
                        {text: String(now_rows + 1), alignment: "right"},
                        {text: ""},
                        {text: ""},
                        {text: ""},
                        {text: ""},
                        {text: ""},
                        {text: ""},
                    ]);
                }
            }
            // 申込が10行以上の場合：
            // 特に何もしない。「以下余白」の行や空行も表示せず、PDFの2ページ目以降に11行目以降を表示する。
            return display_details;
        };
        const receivable_details = get_receivable_details(record);

        receivables_table.table.body = receivables_table.table.body.concat(receivable_details);
        doc.content.push(receivables_table);

        const total_block = {
            table: {
                widths: [ "*", "24%", "20%" ],
                heights: 10,
                body: [
                    [
                        {text: "", border: [false, false, false, false]},
                        {text: "合計金額", style: "tableHeader"},
                        {text: `${addComma(record[fieldTotalAmount_COLLECT]["value"])} 円`, alignment: "right"}
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
