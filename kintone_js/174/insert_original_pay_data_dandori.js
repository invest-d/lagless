/*
    Version 1
    アプリ174のカスタマイズjsとして作成。
    請求データを請求IDごとにまとめて、kintone申込アプリにレコードを作成する。
*/

"use strict";

const client = new KintoneRestAPIClient({baseUrl: "https://investdesign.cybozu.com"});

// CSVファイルで保存するにあたってShift-Jisに変換する
const Encoding = require("encoding-japanese");

// ダンドリワークのシステムから出力した請求データのみを扱う前提
const PRODUCT_NAME = "ダンドリペイメント";

const commonRecordID = "$id";

// FIXME: 開発環境と本番環境で、申込アプリのスキーマの読み込みを自動的に切り替えたい
import { schema_apply } from "../161/schema";
const APP_ID_APPLY                      = schema_apply.id.appId;
const fieldStatus_APPLY                 = schema_apply.fields.properties.状態.code;
const statusInserted_APPLY              = schema_apply.fields.properties.状態.options.通常払い確認待ち.label;
const statusDiscarded_APPLY             = schema_apply.fields.properties.状態.options.取下げ.label;
const fieldPaymentTiming_APPLY          = schema_apply.fields.properties.paymentTiming.code;
const statusOriginalPay_APPLY           = schema_apply.fields.properties.paymentTiming.options.通常払い.label;
const fieldBillingAmount_APPLY          = schema_apply.fields.properties.applicationAmount.code;
const fieldMemberFee_APPLY              = schema_apply.fields.properties.membership_fee.code;
const fieldReceivable_APPLY             = schema_apply.fields.properties.totalReceivables.code;
const fieldClosingDate_APPLY            = schema_apply.fields.properties.closingDay.code;
const fieldPaymentDate_APPLY            = schema_apply.fields.properties.paymentDate.code;
const fieldKyoryokuName_APPLY           = schema_apply.fields.properties.company.code;
const fieldKyoryokuPhone_APPLY          = schema_apply.fields.properties.phone.code;
const fieldConstructorName_APPLY        = schema_apply.fields.properties.billingCompany.code;
const fieldPhone_APPLY                  = schema_apply.fields.properties.phone.code;
const fieldConstructorID_APPLY          = schema_apply.fields.properties.constructionShopId.code;
const fieldKyoryokuID_APPLY             = schema_apply.fields.properties.ルックアップ.code;

import { schema_174 } from "../174/schema";
const APP_ID_DANDORI                    = kintone.app.getId();
const fieldStatus_DANDORI               = schema_174.fields.properties.status.code;
const statusReady_DANDORI               = schema_174.fields.properties.status.options.未処理.label;
const statusCompleted_DANDORI           = schema_174.fields.properties.status.options.通常払いレコード作成済み.label;
const statusIgnored_DANDORI             = schema_174.fields.properties.status.options.データ作成不要.label;
const fieldInvoiceID_DANDORI            = schema_174.fields.properties.invoiceID.code;
const fieldKyoryokuID_DANDORI           = schema_174.fields.properties.kyoryokuID.code;
const fieldClosingDate_DANDORI          = schema_174.fields.properties.closingDate.code;
const fieldPaymentDate_DANDORI          = schema_174.fields.properties.paymentDate.code;
const fieldKyoryokuName_DANDORI         = schema_174.fields.properties.kyoryokuName.code;
const fieldKyoryokuPhone_DANDORI        = schema_174.fields.properties.kyoryokuPhone.code;
const fieldBillingDetail_DANDORI        = schema_174.fields.properties.constructionBillTaxInclDetail.code;
const fieldBillingSum_DANDORI           = schema_174.fields.properties.constructionBillTaxInclSum.code;
const fieldMemberFeeSum_DANDORI         = schema_174.fields.properties.memberShipFeeSum.code;
const fieldReceivableSum_DANDORI        = schema_174.fields.properties.receivableAmountSum.code;
const fieldDandoriID_DANDORI            = schema_174.fields.properties.kyoryokuID.code;

import { schema_96 } from "../96/schema";
const APP_ID_CONSTRUCTOR                = schema_96.id.appId;
const fieldConstructorID_CONSTRUCTOR    = schema_96.fields.properties.id.code;
const fieldConstructorName_CONSTRUCTOR  = schema_96.fields.properties.工務店正式名称.code;

import { schema_88 } from "../88/schema";
const APP_ID_KYORYOKU                   = schema_88.id.appId;
const fieldKyoryokuID_KYORYOKU          = schema_88.fields.properties.支払企業No_.code;
const fieldConstructorID_KYORYOKU       = schema_88.fields.properties.工務店ID.code;
const fieldCommonName_KYORYOKU          = schema_88.fields.properties.支払先.code;
const fieldFormalName_KYORYOKU          = schema_88.fields.properties.支払先正式名称.code;
const fieldPhone_KYORYOKU               = schema_88.fields.properties.電話番号.code;
const fieldBankCode_KYORYOKU            = schema_88.fields.properties.金融機関コード.code;
const fieldBranchCode_KYORYOKU          = schema_88.fields.properties.支店コード.code;
const fieldDepositType_KYORYOKU         = schema_88.fields.properties.預金種目.code;
const fieldAccountNumber_KYORYOKU       = schema_88.fields.properties.口座番号.code;
const fieldAccountName_KYORYOKU         = schema_88.fields.properties.口座名義.code;
const statusUndefinedDeposit_KYORYOKU   = schema_88.fields.properties.預金種目.options["(未設定)"].label;
const fieldDandoriID_KYORYOKU           = schema_88.fields.properties.dandoriID.code;

export const confirmBeforeExec = () => {
    const message = `${schema_174.fields.properties.status.label}が${statusReady_DANDORI}のレコードを請求IDごとに集計し、申込アプリに新規レコードを作成します。`;
    return confirm(message);
};

export const getConstructor = async (id) => {
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

export const getTargetRecords = () => {
    // 請求データアプリの中で状態が未処理のレコードを全件取得する
    const request_body = {
        "app": APP_ID_DANDORI,
        "condition": `${fieldStatus_DANDORI} in ("${statusReady_DANDORI}")`,
    };

    return client.record.getAllRecords(request_body);
};

export const getInvoiceKyoryokuList = (invoice_records) => {
    const dandori_kyoryoku_id_set = Array
        .from(new Set(invoice_records
            .map((r) => r[fieldKyoryokuID_DANDORI]["value"])
        ));

    const kyoryoku_set = {};
    for (const dandori_kyoryoku_id of dandori_kyoryoku_id_set) {
        const record = invoice_records.find((r) => r[fieldKyoryokuID_DANDORI]["value"] === dandori_kyoryoku_id);
        kyoryoku_set[dandori_kyoryoku_id] = {
            name: record[fieldKyoryokuName_DANDORI]["value"],
            phone: record[fieldKyoryokuPhone_DANDORI]["value"]
        };
    }

    return kyoryoku_set;
};

export const getUndefinedKyoryokuList = async (invoice_kyoryoku_list, master) => {
    // kintoneの協力会社マスタ情報と突き合わせて比較する。口座情報がない場合、配列に加える
    const undefined_kyoryoku_list = {};

    for (const dandori_kyoryoku_id of Object.keys(invoice_kyoryoku_list)) {
        const invoice_name = invoice_kyoryoku_list[dandori_kyoryoku_id]["name"];
        const invoice_phone = invoice_kyoryoku_list[dandori_kyoryoku_id]["phone"];
        const kintone_kyoryoku_id = await getKyoryokuID(dandori_kyoryoku_id, invoice_name, invoice_phone, master);
        if (!kintone_kyoryoku_id) {
            // そもそもkintoneに未登録の場合
            undefined_kyoryoku_list[dandori_kyoryoku_id] = {
                kintone_id: "",
                dandori_id: dandori_kyoryoku_id,
                name: invoice_name,
                phone: invoice_phone
            };
        } else {
            const master_record = master.find((m) => m[fieldKyoryokuID_KYORYOKU]["value"] === kintone_kyoryoku_id);

            const bank_code = master_record[fieldBankCode_KYORYOKU]["value"];
            const branch_code = master_record[fieldBranchCode_KYORYOKU]["value"];
            const deposit_type = master_record[fieldDepositType_KYORYOKU]["value"];
            const account_number = master_record[fieldAccountNumber_KYORYOKU]["value"];
            const account_name = master_record[fieldAccountName_KYORYOKU]["value"];

            if (!(bank_code && branch_code && (deposit_type !== statusUndefinedDeposit_KYORYOKU) && account_number && account_name)) {
                // kintoneには登録しているが、銀行情報が未登録の場合
                undefined_kyoryoku_list[dandori_kyoryoku_id] = {
                    kintone_id: kintone_kyoryoku_id,
                    dandori_id: dandori_kyoryoku_id,
                    name: invoice_name,
                    phone: invoice_phone
                };
            }
        }
    }

    return undefined_kyoryoku_list;
};

export const downloadUndefinedKyoryokuCsv = (undefined_kyoryoku_list, constructor_id) => {
    const generateCsvData = (undefined_kyoryoku_list, constructor_id) => {
        const original_pay_require_fields = [
            schema_88.fields.properties.支払企業No_.label,
            schema_88.fields.properties.支払先.label,
            schema_88.fields.properties.支払先正式名称.label,
            schema_88.fields.properties.電話番号.label,
            schema_88.fields.properties.銀行名.label,
            schema_88.fields.properties.金融機関コード.label,
            schema_88.fields.properties.支店名.label,
            schema_88.fields.properties.支店コード.label,
            schema_88.fields.properties.預金種目.label,
            schema_88.fields.properties.口座番号.label,
            schema_88.fields.properties.口座名義.label,
            schema_88.fields.properties.工務店ID.label,
            schema_88.fields.properties.工務店名.label,
            schema_88.fields.properties.商品名.label,
        ];

        const other_required_fields = Object.values(schema_88.fields.properties)
            .filter((prop) => prop.required && !(original_pay_require_fields.includes(prop.label)));

        const app_require_fields = other_required_fields.map((prop) => prop.label);

        const csv_format = (col) => `"${col}"`;

        const csv_header = original_pay_require_fields.concat(app_require_fields)
            .map(csv_format)
            .join(",");

        const csv_rows = Object.keys(undefined_kyoryoku_list).map((dandori_kyoryoku_id) => {
            const target = undefined_kyoryoku_list[dandori_kyoryoku_id];
            return [
                target.kintone_id,
                target.name, //通名
                target.name, //正式名称。とりあえず同じにしておく
                target.phone,
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                constructor_id,
                "",
                PRODUCT_NAME
            ].concat(other_required_fields.map((prop) => prop.defaultValue))
                .map(csv_format)
                .join(",");
            // mapは順番が同じ https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Map
        });

        // 配列の先頭要素として追加
        csv_rows.unshift(csv_header);

        // 最終行の最後にもCRLFを追加
        return `${csv_rows.join("\r\n")}\r\n`;
    };

    const encodeToSjis = (csv_data) => {
        // 1文字ずつ格納
        const unicode_list = [];
        for (let i = 0; i < csv_data.length; i++) {
            unicode_list.push(csv_data.charCodeAt(i));
        }

        // 1文字ずつSJISに変換する
        return Encoding.convert(unicode_list, "sjis", "unicode");
    };

    const csv_data = generateCsvData(undefined_kyoryoku_list, constructor_id);
    const sjis_list = encodeToSjis(csv_data);

    // 生成したデータをCSVファイルとしてローカルにダウンロードする。
    const downloadFile = (sjis_code_list, file_name) => {
        const uint8_list = new Uint8Array(sjis_code_list);
        const write_data = new Blob([uint8_list], { type: "text/csv" });

        // 保存
        const download_link = document.createElement("a");
        download_link.download = file_name;
        download_link.href = (window.URL || window.webkitURL).createObjectURL(write_data);

        const setText = (element, str) => {
            if(element.textContent !== undefined){
                element.textContent = str;
            }
            if(element.innerText !== undefined){
                element.innerText = str;
            }
        };

        // DLリンクを生成して自動でクリックまでして、生成したDLリンクはその都度消す
        kintone.app.getHeaderMenuSpaceElement().appendChild(download_link);
        setText(download_link, "download csv");
        download_link.click();
        kintone.app.getHeaderMenuSpaceElement().removeChild(download_link);
    };

    const file_name = "口座情報が必要な協力会社一覧.csv";
    downloadFile(sjis_list, file_name);
};

const groupByInvoiceID = (records) => {
    const invoice_ids = Array.from(new Set(records.map((r) => r[fieldInvoiceID_DANDORI]["value"])));

    const invoice_groups = {};
    for (const invoice_id of invoice_ids) {
        invoice_groups[invoice_id] = records.filter((r) => r[fieldInvoiceID_DANDORI]["value"] === invoice_id);
    }

    return invoice_groups;
};

export const groupDandoriInvoices = (records) => {
    // アプリにインポートされる1レコードは請求書に記載する明細の1行に相当するため、請求書単位（請求ID単位）にグループ化する
    const invoice_groups = groupByInvoiceID(records);

    const aggregated = [];
    Object.values(invoice_groups).forEach((group) => {
        // グループごとに、①案件の合計額、②協力会費差し引き後振込金額が一致しているか検算する。
        // インポートされたレコードそれぞれに合計の値が記載してあるため、どのレコードを使ってもよい。従ってここでは[0]を使う。
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
            aggregated.push({
                main: group[0],
                details: group
            });
        } catch (e) {
            alert(`${e}\n\nこの請求書の処理をスキップします`);
        }
    });

    return aggregated;
};

export const getKyoryokuMaster = (constructor_id) => {
    const request_body = {
        "app": APP_ID_KYORYOKU,
        "condition": `${fieldConstructorID_KYORYOKU} = "${constructor_id}"`,
    };
    return client.record.getAllRecords(request_body);
};

export const getKyoryokuID = async (dandori_id, dandori_name, dandori_phone, kyoryoku_master) => {
    // 1. 請求データのダンドリワークIDを、マスタの中からサーチ。見つかったレコードのIDを返す
    // 2. 通名もしくは正式名称のフィールドと、電話番号のフィールドの両方が完全一致するレコードがあればそれを返す
    // 1, 2どちらもなければ空文字を返す
    const found_master_data = kyoryoku_master.find((master) => {
        const equal_id = (master[fieldDandoriID_KYORYOKU]["value"] === dandori_id);
        if (equal_id) {
            return true;
        }

        const equal_name = (master[fieldCommonName_KYORYOKU]["value"] === dandori_name)
                || (master[fieldFormalName_KYORYOKU]["value"] === dandori_name);

        const equal_phone = ((invoice_phone) => {
            if (!invoice_phone) {
                return false;
            }
            return master[fieldPhone_KYORYOKU]["value"] === invoice_phone;
        })(invoice_phone);

        return equal_name && equal_phone;
    });

    if (found_master_data) {
        return found_master_data[fieldKyoryokuID_KYORYOKU]["value"];
    } else {
        return "";
    }
};

const existsApplyRecord = async (dandori_record, constructor_id) => {
    const id = dandori_record[fieldDandoriID_DANDORI]["value"];
    const name = dandori_record[fieldKyoryokuName_DANDORI]["value"];
    const phone = dandori_record[fieldKyoryokuPhone_DANDORI]["value"];
    const master = await getKyoryokuMaster(constructor_id);
    const kintone_kyoryoku_id = await getKyoryokuID(id, name, phone, master);

    const closing_date = dandori_record[fieldClosingDate_DANDORI]["value"];
    const applies = await getApplyRecordsThisClosing(closing_date, constructor_id);
    if (kintone_kyoryoku_id) {
        // 同じ協力会社IDを持つレコードがあるか
        // 既に協力会社マスタに登録されているのに、申込レコードに協力会社IDが未記入というパターンは想定しない
        const apply = applies.find((r) => r[fieldKyoryokuID_APPLY]["value"] === kintone_kyoryoku_id);
        return !(apply === undefined);
    } else {
        // 社名と電話番号の両方が一致するレコードがあるか
        const apply = applies.find((r) => r[fieldKyoryokuName_APPLY]["value"] === name && r[fieldKyoryokuPhone_APPLY]["value"] === phone);
        return !(apply === undefined);
    }
};

const getApplyRecordsThisClosing = async (closing_date, constructor_id) => {
    const request_body = {
        "app": APP_ID_APPLY,
        "condition": `${fieldClosingDate_APPLY} = "${closing_date}"
            and ${fieldConstructorID_APPLY} = "${constructor_id}"
            and ${fieldStatus_APPLY} not in ("${statusDiscarded_APPLY}")`,
        // 申込したけど取り下げになったレコードは通常払いする必要がある
    };

    return client.record.getAllRecords(request_body);
};

export const divideInvoices = async (invoice_groups, constructor_id) => {
    // ダンドリワークのデータを、通常払いすべき請求とすべきでない請求に振り分ける。
    // 通常払いすべきでない請求とは、早払いもしくは遅払いで処理するように既に申込を受け付けている請求のこと。
    const search_exists_result = await Promise.all(invoice_groups.map((i) => existsApplyRecord(i.main, constructor_id)));
    const using_factoring_groups = invoice_groups.filter((_, i) => search_exists_result[i]);
    const original_pay_groups = invoice_groups.filter((_, i) => !search_exists_result[i]);

    return {
        original_pay_groups: original_pay_groups,
        using_factoring_groups: using_factoring_groups
    };
};

export const convertToApplyRecord = async (invoice_groups, constructor) => {
    // ダンドリワーク請求データアプリのレコードを加工して、ラグレス申込アプリにinsertできるオブジェクトにする
    const processes = invoice_groups.map(async (invoice_group) => {
        const id = invoice_group.main[fieldDandoriID_DANDORI]["value"];

        const name = invoice_group.main[fieldKyoryokuName_DANDORI]["value"];

        const phone = (invoice_group.main[fieldKyoryokuPhone_DANDORI]["value"] === "")
            ? "000-0000-0000"
            : invoice_group.main[fieldKyoryokuPhone_DANDORI]["value"];

        const kyoryoku_master = await getKyoryokuMaster(constructor.id);

        const kyoryoku_id = await getKyoryokuID(id, name, phone, kyoryoku_master);

        return {
            [fieldStatus_APPLY]: {
                "value": statusInserted_APPLY
            },
            [fieldPaymentTiming_APPLY]: {
                "value": statusOriginalPay_APPLY
            },
            [fieldBillingAmount_APPLY]: {
                "value": invoice_group.main[fieldBillingSum_DANDORI]["value"]
            },
            [fieldMemberFee_APPLY]: {
                "value": invoice_group.main[fieldMemberFeeSum_DANDORI]["value"]
            },
            [fieldReceivable_APPLY]: {
                "value": invoice_group.main[fieldReceivableSum_DANDORI]["value"]
            },
            [fieldClosingDate_APPLY]: {
                "value": invoice_group.main[fieldClosingDate_DANDORI]["value"]
            },
            [fieldPaymentDate_APPLY]: {
                "value": invoice_group.main[fieldPaymentDate_DANDORI]["value"]
            },
            [fieldKyoryokuName_APPLY]: {
                "value": name
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

    return Promise.all(processes);
};

export async function insertApplyRecords(records) {
    const request_body = {
        "app": APP_ID_APPLY,
        "records": records
    };

    const resp = await client.record.addAllRecords(request_body);
    return resp.records.map((r) => r.id);
}

export const updateToDone = (invoice_groups) => {
    return updateStatus(invoice_groups, statusCompleted_DANDORI);
};

export const updateToIgnored = (invoice_groups) => {
    return updateStatus(invoice_groups, statusIgnored_DANDORI);
};

const updateStatus = (invoice_groups, status) => {
    // 請求書単位でまとめられているレコードを展開
    const records = invoice_groups.flatMap((g) => g.details);

    const request_body = {
        "app": APP_ID_DANDORI,
        "records": records.map((r) => {
            return {
                "id": r[commonRecordID]["value"],
                "record": {
                    [fieldStatus_DANDORI]: {
                        "value": status
                    }
                }
            };
        })
    };

    return client.record.updateAllRecords(request_body);
};

export const getNoDandoriIdList = async (invoice_kyoryoku_list, master) => {
    /* return is:
    {
        [dandori_id]: kyoryoku_master_record_number
    }
    */
    const no_id_list = {};

    for (const dandori_id of Object.keys(invoice_kyoryoku_list)) {
        const invoice_kyoryoku = invoice_kyoryoku_list[dandori_id];
        const kyoryoku_id = await getKyoryokuID(dandori_id, invoice_kyoryoku.name, invoice_kyoryoku.phone, master);

        if (kyoryoku_id) {
            const master_record = master.find((r) => r[fieldKyoryokuID_KYORYOKU]["value"] === kyoryoku_id);
            if (!master_record[fieldDandoriID_KYORYOKU]["value"]) {
                no_id_list[dandori_id] = master_record[commonRecordID]["value"];
            }
        }
    }

    return no_id_list;
};

export const updateDandoriId = (no_dandori_id_list) => {
    const records = Object.keys(no_dandori_id_list).map((dandori_id) => {
        return {
            id: no_dandori_id_list[dandori_id],
            record: {
                [fieldDandoriID_KYORYOKU]: {
                    value: dandori_id
                }
            }
        };
    });

    return client.record.updateRecords({
        app: APP_ID_KYORYOKU,
        records: records
    });
};
