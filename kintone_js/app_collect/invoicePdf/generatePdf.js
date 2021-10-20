// PDF生成ライブラリ
import { Decimal } from "decimal.js";
import { KE_BAN_CONSTRUCTORS, KE_BAN_PRODUCT_NAME } from "../../96/common";
import { getCollectAppSchema, getOrdererAppSchema } from "../../util/environments";
import { isGigConstructorID } from "../../util/gig_utils";
import * as kintoneAPI from "../../util/kintoneAPI";
import { createPdf } from "../../util/pdfMake_util";
import { addComma, formatYMD, get_contractor_name, get_display_payment_timing } from "../../util/util_forms";
import { getInvoiceTargetQuery } from "./selectRecords";



// 祝日判定ライブラリ
const holiday_jp = require("@holiday-jp/holiday_jp");
const dateFns = require("date-fns");

const dayjs = require("dayjs");
dayjs.locale("ja");


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


// import { schema_96 } from "../../96/schema";
const schema_96 = getOrdererAppSchema(kintone.app.getId());
if (!schema_96) throw new Error();
const APP_ID_CONSTRUCTOR                        = schema_96.id.appId;
const fieldDaysLater_CONSTRUCTOR                = schema_96.fields.properties.daysLater.code;

const collectAppSchema = getCollectAppSchema(kintone.app.getId());
if (!collectAppSchema) throw new Error();
const collectFields = collectAppSchema.fields.properties;
const APP_ID_COLLECT                            = collectAppSchema.id.appId;
const fieldRecordId_COLLECT                     = collectFields.レコード番号.code;
const fieldDeadline_COLLECT                     = collectFields.deadline.code;
const fieldProductName_COLLECT                  = collectFields.productName.code;
const fieldConstructionShopId_COLLECT           = collectFields.constructionShopId.code;
const fieldConstructionShopName_COLLECT         = collectFields.constructionShopName.code;
const fieldCeoTitle_COLLECT                     = collectFields.ceoTitle.code;
const fieldCeo_COLLECT                          = collectFields.ceo.code;
const fieldMailToInvest_COLLECT                 = collectFields.mailToInvest.code;
const fieldClosingDate_COLLECT                  = collectFields.closingDate.code;
const fieldAccount_COLLECT                      = collectFields.account.code;
const fieldDaysLater_COLLECT                    = collectFields.daysLater.code;
const fieldParentCollectRecord_COLLECT          = collectFields.parentCollectRecord.code;
const statusParent_COLLECT                      = collectFields.parentCollectRecord.options.true.label;
const fieldTotalBilledAmount_COLLECT            = collectFields.totalBilledAmount.code;
const tableInvoiceTargets_COLLECT               = collectFields.invoiceTargets.code;
const tableFieldPaymentTimingIV_COLLECT         = collectFields.invoiceTargets.fields.paymentTimingIV.code;
const tableFieldApplicantOfficialNameIV_COLLECT = collectFields.invoiceTargets.fields.applicantOfficialNameIV.code;
const tableFieldReceivableIV_COLLECT            = collectFields.invoiceTargets.fields.receivableIV.code;
const tableFieldPaymentDateIV_COLLECT           = collectFields.invoiceTargets.fields.paymentDateIV.code;
const tableFieldBackRateIV_COLLECT              = collectFields.invoiceTargets.fields.backRateIV.code;
const tableFieldBackAmountIV_COLLECT            = collectFields.invoiceTargets.fields.backAmountIV.code;
const tableFieldBackedReceivableIV_COLLECT      = collectFields.invoiceTargets.fields.backedReceivableIV.code;
const tableFieldActuallyOrdererIV_COLLECT       = collectFields.invoiceTargets.fields.actuallyOrdererIV.code;
const fieldHandleForHolidays_COLLECT            = collectFields.handleForHolidays.code;
const fieldPdfDate_COLLECT                      = collectFields.invoicePdfDate.code;

const orange = "#ff9a33";
const white = "#ffffff";
const black = "#000000";

const green = "#008080";
const light_green = "#009999";


export async function generateInvoices() {
    // PDF生成対象かつ親レコードを全て取得
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
            fieldHandleForHolidays_COLLECT,
            fieldPdfDate_COLLECT,
        ],
        "query": `(${getInvoiceTargetQuery()}) and ${fieldParentCollectRecord_COLLECT} in ("${statusParent_COLLECT}")`
    };
    const target_parents = await kintoneAPI.CLIENT.record.getRecords(get_parents);

    const get_constructors = {
        "app": APP_ID_CONSTRUCTOR
    };
    // getRecordsは500レコードが上限なので、確実に全件取得するようにgetAllRecordsを使用する
    const constructors = await kintoneAPI.CLIENT.record.getAllRecords(get_constructors);

    const attachment_pdfs = [];
    for(const parent_record of target_parents.records) {
        // 回収レコードに遅払い日数フィールドを紐づける
        const constructor = constructors.find((r) => r["id"]["value"] === parent_record[fieldConstructionShopId_COLLECT]["value"]);
        if (!constructor) {
            // ダイアログを表示するが、他のPDFは引き続き作成を試みる
            alert(`工務店レコードが見つかりませんでした。回収レコードID: ${parent_record["$id"]["value"]}`);
            continue;
        }

        parent_record[fieldDaysLater_COLLECT] = { "value": constructor[fieldDaysLater_CONSTRUCTOR]["value"] };

        const invoice_doc = generateInvoiceDocument(parent_record);
        const file_name = ((constructor_id, constructor_name, closing_date) => {
            if (KE_BAN_CONSTRUCTORS.includes(constructor_id)) {
                // 軽バン.comの場合は締め分ではなく対象月「YYYY年M月分」
                return `${constructor_name}様用 支払明細書兼振込依頼書${dayjs(closing_date).format("YYYY年M月")}分.pdf`;
            } else {
                return `${constructor_name}様用 支払明細書兼振込依頼書${formatYMD(closing_date)}締め分.pdf`;
            }
        })(parent_record[fieldConstructionShopId_COLLECT]["value"],
            parent_record[fieldConstructionShopName_COLLECT]["value"],
            parent_record[fieldClosingDate_COLLECT]["value"]);

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

    // GIGはレイアウトが大きく異なる。別処理にする
    if (isGigConstructorID(parent_record[fieldConstructionShopId_COLLECT]["value"])) {
        return getGigDoc(parent_record);
    }

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

    const system_name = ((product_name) => {
        if (product_name === KE_BAN_PRODUCT_NAME) {
            return "軽バン.com【売上前払いシステム】";
        } else {
            return product_name;
        }
    })(product_name);

    const office_name = ((product_name) => {
        if (product_name === KE_BAN_PRODUCT_NAME) {
            return "軽バン.com前払い事務局";
        } else {
            return `${product_name}事務局`;
        }
    })(product_name);

    const subject = ((product_name, closing_date) => {
        if (product_name === KE_BAN_PRODUCT_NAME) {
            // 軽バン.comの場合は締め分ではなく対象月「YYYY年M月分」
            return `${dayjs(closing_date).format("YYYY年M月")}分`;
        } else {
            return `${formatYMD(closing_date)}締め分`;
        }
    })(product_name, parent_record[fieldClosingDate_COLLECT]["value"]);

    const doc = {
        info: {
            title: `${company}様宛${system_name}利用分振込依頼書`,
            author: `${office_name} ${contact_company}`,
            subject: subject,
            creator: `${office_name} ${contact_company}`,
            producer: `${office_name} ${contact_company}`,
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
        text: `${system_name} 振込依頼書 兼 支払明細書`,
        fontSize: 14,
        bold: true,
        alignment: "center",
        margin: [0, 15, 0, 0]
    };
    doc.content.push(title);

    // 振込依頼書に記載する日付。Y年M月D日
    const send_date = {
        text: dayjs(parent_record[fieldPdfDate_COLLECT]["value"]).format("YYYY年M月D日"),
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

    const body_service_name_1 = ((product_name) => {
        if (product_name === KE_BAN_PRODUCT_NAME) {
            // 軽バン.comの場合のみ「下記のとおりお申込み受付を……」と表示
            return "";
        } else {
            // その他は「下記のとおりラグレスのお申込み受付を……」と表示
            return `${product_name}の`;
        }
    })(product_name);
    const body_service_name_2 = (product_name === KE_BAN_PRODUCT_NAME)
        ? ""
        : product_name;
    const letter_body = {
        rowSpan: 2,
        border: [false],
        text: [
            "拝啓　時下ますますご清栄のこととお慶び申し上げます。\n",
            "平素は格別のご高配を賜り厚く御礼申し上げます。\n",
            `さて、下記のとおり${body_service_name_1}お申込み受付をいたしましたのでご案内いたします。\n`,
            `つきましては、${body_service_name_2}利用分の合計金額を、お支払期限までに下記振込先口座へお振込み頂きますよう、お願い申し上げます。\n`,
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
    // FIXME: 軽バン.comかどうかの判定をするコードを一箇所にまとめたい
    const tel = (KE_BAN_CONSTRUCTORS.includes(parent_record[fieldConstructionShopId_COLLECT]["value"]))
        ? "050-3188-8481"
        : "050-3188-6800";
    const invoice_from = {
        text: [
            `【${office_name}】\n`,
            {
                text: `${contact_company}\n`,
                bold: true
            },
            "東京都千代田区神田神保町三丁目\n",
            "5番地 住友不動産九段下ビル7F\n",
            `Mail:${mail}\n`,
            `TEL:${tel}\n`
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
    const closing_date_title = ((product_name) => {
        const closing_date_title = JSON.parse(JSON.stringify(billing_title_template));
        closing_date_title.borderColor = [orange, orange, orange, white];

        if (product_name === KE_BAN_PRODUCT_NAME) {
            closing_date_title.text = "対象月";
        } else{
            closing_date_title.text = "対象となる締め日";
        }

        return closing_date_title;
    })(product_name);

    const closing_date = ((product_name) => {
        const closing_date = JSON.parse(JSON.stringify(billing_value_template));

        if (product_name === KE_BAN_PRODUCT_NAME) {
            closing_date.text = dayjs(parent_record[fieldClosingDate_COLLECT]["value"]).format("YYYY年M月");
        } else {
            closing_date.text = formatYMD(parent_record[fieldClosingDate_COLLECT]["value"]);
        }

        return closing_date;
    })(product_name);

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
    })(parent_record[fieldConstructionShopId_COLLECT]["value"], parent_record[tableInvoiceTargets_COLLECT]["value"], total);
    doc.content.push(detail_table);

    doc.content.push(bar);

    return doc;
}

const getGigDoc = (parent_record) => {
    // GIG案件用の振込依頼書に使用するレイアウトを生成する
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

    const system_name = product_name;
    const office_name = product_name;
    const subject = `${formatYMD(parent_record[fieldClosingDate_COLLECT]["value"])}締め分`;

    const doc = {
        info: {
            title: `${company}様宛${system_name}利用分振込依頼書`,
            author: `${office_name} ${contact_company}`,
            subject: subject,
            creator: `${office_name} ${contact_company}`,
            producer: `${office_name} ${contact_company}`,
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
                [ { text: "", fillColor: green, borderColor: [green, green, green, green] } ]
            ]
        }
    };
    doc.content.push(bar);

    // 文書のタイトル
    const title = {
        text: `${system_name} 請求書`,
        fontSize: 14,
        bold: true,
        alignment: "center",
        margin: [0, 15, 0, 0]
    };
    doc.content.push(title);

    // 振込依頼書に記載する日付。YYYY/MM/DD
    const send_date = {
        text: dayjs(parent_record[fieldPdfDate_COLLECT]["value"]).format("YYYY/MM/DD"),
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
            "平素は格別のご高配を賜り厚く御礼申し上げます。\n",
            "\n",
            `さて、下記のとおり${product_name}を実行いたしましたのでご案内いたします。\n`,
            "つきましては、下記の通りお支払いいただきますようお願い申し上げます。\n",
            "\n",
            "ご不明な点などがございましたら、右記連絡先までお問い合わせください。\n",
            "今後とも、どうぞ宜しくお願いいたします。\n",
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

    const mail = "lagless@invest-d.com";
    const tel = "050-3188-8481";
    const invoice_from = {
        text: [
            `【${office_name}】\n`,
            {
                text: `運営会社：${contact_company}\n（インベストデザイン株式会社）`,
                bold: true
            },
            `Mail：${mail}\n`,
            `TEL：${tel}\n`
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
                [{},          {text: "", border: [false], fillColor: green},  invoice_from ]
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
        fillColor: green,
        borderColor: [green, green, green, green],
        rowSpan: 1
    };
    const billing_value_template = {
        text: "",
        fontSize: 10,
        alignment: "center",
        borderColor: [green, green, green, green],
        border: false,
        rowSpan: 1
    };

    // テンプレートのオブジェクトをディープコピーして必要な部分だけ設定
    const closing_date_title = (() => {
        const closing_date_title = JSON.parse(JSON.stringify(billing_title_template));
        closing_date_title.borderColor = [green, green, green, white];
        closing_date_title.text = "対象となる締め日";
        return closing_date_title;
    })();

    const closing_date = (() => {
        const closing_date = JSON.parse(JSON.stringify(billing_value_template));
        closing_date.text = formatYMD(parent_record[fieldClosingDate_COLLECT]["value"]);
        return closing_date;
    })();

    const deadline_title = JSON.parse(JSON.stringify(billing_title_template));
    deadline_title.text = "お支払期限";
    deadline_title.borderColor = [green, white, green, white];

    const deadline = JSON.parse(JSON.stringify(billing_value_template));
    const ymd_arr = parent_record[fieldDeadline_COLLECT]["value"].split("-").map((num) => Number(num));
    const base_deadline_date = new Date(ymd_arr[0], ymd_arr[1]-1, ymd_arr[2]);
    const actual_deadline_date = getNearestWeekday(base_deadline_date, parent_record[fieldHandleForHolidays_COLLECT]["value"]);
    deadline.text = `${actual_deadline_date.getFullYear()}年${actual_deadline_date.getMonth()+1}月${actual_deadline_date.getDate()}日`;

    const billed_amount_title = JSON.parse(JSON.stringify(billing_title_template));
    billed_amount_title.text = "ご請求金額\n（消費税込み）";
    billed_amount_title.borderColor = [green, white, green, green];

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

    const note = {
        text: [
            "※お振込手数料はお客様にてご負担をお願いいたします。\n",
            "※お支払期限の12時までに着金するようにお振込みをお願いいたします。"
        ],
        bold: true
    };
    doc.content.push(note);

    const detail_table_title = {
        text: "前払い実行明細",
        bold: true,
        margin: [0, 20, 0, 0]
    };
    doc.content.push(detail_table_title);

    const detail_table = ((details, total) => {
        // GIG用の明細テーブルを生成する
        const detail_table = {
            table: {
                widths: ["4%", "17%", "21%", "11%", "12%", "11%", "12%", "12%"],
                headerRows: 1,
                body: []
            },
            margin: [0, 5, 0, 15]
        };

        const header_text_style = {
            text: "",
            fontSize: 7,
            bold: true,
            lineHeight: 1,
            alignment: "center",
            color: white,
            borderColor: [green, green, green, green]
        };

        const formatDate = (v) => dayjs(v).format("YYYY/M/D");
        // details.forEach((d) => d["value"]["gigrate"]["value"] = formatPercent(total_rate));
        const columns = [
            {
                title: "No",
                margin: [0, 8, 0, 0],
                header_style: {
                    fillColor: green,
                },
                detail_style: {
                    alignment: "right",
                    borderColor: [green, green, green, green]
                }
            },
            {
                title: "支払先",
                margin: [0, 8, 0, 0],
                header_style: {
                    fillColor: green,
                },
                detail_style: {
                    value: {
                        code: tableFieldApplicantOfficialNameIV_COLLECT,
                        format: null
                    },
                    alignment: "left",
                    borderColor: [green, green, green, green]
                }
            },
            {
                title: "発注元\n(掲載企業)",
                margin: [0, 3, 0, 0],
                header_style: {
                    fillColor: green,
                },
                detail_style: {
                    value: {
                        code: tableFieldActuallyOrdererIV_COLLECT,
                        format: null
                    },
                    alignment: "left",
                    fontSize: 6,
                    borderColor: [green, green, green, green]
                }
            },
            {
                title: "前払い日",
                margin: [0, 8, 0, 0],
                header_style: {
                    fillColor: green,
                },
                detail_style: {
                    value: {
                        code: tableFieldPaymentDateIV_COLLECT,
                        format: formatDate
                    },
                    alignment: "left",
                    borderColor: [green, green, green, green]
                }
            },
            {
                title: "前払い申込金額\n（税込：円）\n①",
                header_style: {
                    fillColor: light_green,
                },
                detail_style: {
                    value: {
                        code: tableFieldReceivableIV_COLLECT,
                        format: addComma
                    },
                    alignment: "right",
                    borderColor: [green, green, green, green]
                }
            },
            {
                title: "手数料率\n(貴社シェア分)",
                header_style: {
                    fillColor: light_green,
                },
                detail_style: {
                    value: {
                        code: tableFieldBackRateIV_COLLECT,
                        format: (rate) => `${(new Decimal(Number(rate))).times(100).toFixed(2)}%`
                    },
                    alignment: "right",
                    borderColor: [green, green, green, green]
                }
            },
            {
                title: "手数料額\n(貴社シェア分)\n②",
                header_style: {
                    fillColor: light_green,
                },
                detail_style: {
                    value: {
                        code: tableFieldBackAmountIV_COLLECT,
                        format: addComma
                    },
                    alignment: "right",
                    borderColor: [green, green, green, green]
                }
            },
            {
                title: "請求金額\n(税込：円)\n① - ②",
                header_style: {
                    fillColor: green,
                },
                detail_style: {
                    value: {
                        code: tableFieldBackedReceivableIV_COLLECT,
                        format: addComma
                    },
                    alignment: "right",
                    borderColor: [green, green, green, green]
                }
            },
        ];

        const header_row = columns.map((c) => {
            // オブジェクトを複製して使用する
            const pdfDoc_table_cell = JSON.parse(JSON.stringify(header_text_style));
            pdfDoc_table_cell.text = c.title;
            if (c.margin) pdfDoc_table_cell.margin = c.margin;
            pdfDoc_table_cell.fillColor = c.header_style.fillColor;
            return pdfDoc_table_cell;
        });
        detail_table.table.body.push(header_row);

        const detail_style_template = {
            text: "",
            alignment: "",
            lineHeight: 1,
            borderColor: [green, green, green, green]
        };
        detail_table.table.body.push(...getDetailRowsDocObject(details, columns, detail_style_template));

        const sum_title = JSON.parse(JSON.stringify(header_text_style));
        sum_title.text = "合計金額";
        sum_title.fillColor = green;
        sum_title.borderColor = [green, green, green, green];

        const sum_amount = {
            text: total,
            alignment: "right",
            borderColor: [green, green, green, green],
            bold: true
        };

        const blank_cell = {text: "", border: [false]};
        const sum_row = [
            blank_cell,
            blank_cell,
            blank_cell,
            blank_cell,
            blank_cell,
            blank_cell,
            sum_title,
            sum_amount
        ];
        detail_table.table.body.push(sum_row);

        return detail_table;
    })(parent_record[tableInvoiceTargets_COLLECT]["value"], total);
    doc.content.push(detail_table);

    doc.content.push(bar);

    return doc;
};

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

    const detail_style_template = {
        text: "",
        alignment: "",
        lineHeight: 1,
        borderColor: [orange, black, orange, black]
    };
    detail_table.table.body.push(...getDetailRowsDocObject(collect_record_details, columns, detail_style_template));

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

    const detail_style_template = {
        text: "",
        alignment: "",
        lineHeight: 1,
        borderColor: [orange, black, orange, black]
    };
    detail_table.table.body.push(...getDetailRowsDocObject(collect_record_details, columns, detail_style_template));

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

function getDetailRowsDocObject(detail_records, columns, detail_style_template) {
    const paid_rows = detail_records
        .sort((a, b) => {
            // 支払日が古い順にソートしてから処理
            const a_date = a["value"][tableFieldPaymentDateIV_COLLECT]["value"];
            const b_date = b["value"][tableFieldPaymentDateIV_COLLECT]["value"];
            return dayjs(a_date).unix() - dayjs(b_date).unix();
        })
        .map((record, index) => {
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

                if (style.fontSize) {
                    cell.fontSize = style.fontSize;
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
