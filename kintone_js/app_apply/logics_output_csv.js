"use strict";

// CSVファイルで保存するにあたってShift-Jisに変換する
const Encoding = require("encoding-japanese");

import { schema_apply as schema_apply_dev } from "../159/schema";
import { schema_apply as schema_apply_prod } from "../161/schema";

const APP_ID_APPLY                      = kintone.app.getId();

const schema_apply = ((app_id) => {
    if (app_id === 159) {
        return schema_apply_dev;
    } else if (app_id === 161) {
        return schema_apply_prod;
    } else {
        throw new Error(`Invalid app: ${app_id}`);
    }
})(APP_ID_APPLY);

const fieldRecordId_APPLY               = schema_apply.fields.properties.レコード番号.code;
const fieldBankCode_APPLY               = schema_apply.fields.properties.bankCode.code;
const fieldBranchCode_APPLY             = schema_apply.fields.properties.branchCode.code;
const fieldDepositType_APPLY            = schema_apply.fields.properties.deposit.code;
const fieldAccountNumber_APPLY          = schema_apply.fields.properties.accountNumber.code;
const fieldAccountName_APPLY            = schema_apply.fields.properties.accountName.code;
const fieldTotalReceivables_APPLY       = schema_apply.fields.properties.totalReceivables.code;
const fieldTransferAmount_APPLY         = schema_apply.fields.properties.transferAmount.code;
const fieldTransferAmountLate_APPLY     = schema_apply.fields.properties.transferAmount_late.code;
export const fieldStatus_APPLY          = schema_apply.fields.properties.状態.code;
const statusReady_APPLY                 = schema_apply.fields.properties.状態.options.振込前確認完了.label;
const statusDone_APPLY                  = schema_apply.fields.properties.状態.options.振込データ出力済.label;
const fieldPaymentDate_APPLY            = schema_apply.fields.properties.paymentDate.code;
const fieldPaymentAccount_APPLY         = schema_apply.fields.properties.paymentAccount.code;
const fieldPaymentTiming_APPLY          = schema_apply.fields.properties.paymentTiming.code;
const statusPaymentLate_APPLY           = schema_apply.fields.properties.paymentTiming.options.遅払い.label;
const statusPaymentOriginal_APPLY       = schema_apply.fields.properties.paymentTiming.options.通常払い.label;
const fieldConstructionShopId_APPLY     = schema_apply.fields.properties.constructionShopId.code;
const fieldKyoryokuId_APPLY             = schema_apply.fields.properties.ルックアップ.code;

export const AVAILABLE_CONSTRUCTORS = {
    REALTOR_SOLUTIONS: {
        ID: "100",
        NAME: "株式会社RealtorSolutions",
        BANK_CODE: "0157",
        BRANCH_CODE: "261"
    }
};

export const confirmBeforeExec = () => {
    const message = "振込用のcsvデータをダウンロードします。よろしいですか？\n\n"
        + "※このあとに支払日を指定し、\n"
        + "未出力のものだけ出力 OR 出力済みも含めて全て出力 のどちらかを選択できます。";
    return confirm(message);
};

export const inputPaymentDate = () => {
    prompt("YYYY-MM-DDの形式で支払日を入力してください。\n例：2020-01-23");
};

export const getTargetConditions = () => {
    const message = "未出力の振込データだけを出力しますか？\n"
        + "OK：未出力のものは出力し、出力済みのものは出力しない\n"
        + "キャンセル：未出力のものも、未出力のものも、全て出力する";
    const only_undownloaded = confirm(message);

    const conditions = [
        statusReady_APPLY
    ];

    if (!only_undownloaded) {
        conditions.push(statusDone_APPLY);
    }

    return conditions;
};

export const getKintoneRecords = (account, target_date, conditions) => {
    console.log(`申込レコード一覧から、CSVファイルへの出力対象レコードを取得する。対象口座：${account}`);

    const in_query = conditions.map((c) => `"${c}"`).join(",");

    const test_constructors = Object.values(AVAILABLE_CONSTRUCTORS).map((c) => `"${c.ID}"`).join(", ");

    // 債権譲渡登記の取得が必要な申込についてもCSV出力する。GMOあおぞらの振込であれば当日着金が可能なため。
    const request_body = {
        "app": APP_ID_APPLY,
        "fields": [
            fieldPaymentTiming_APPLY,
            fieldRecordId_APPLY,
            fieldBankCode_APPLY,
            fieldBranchCode_APPLY,
            fieldDepositType_APPLY,
            fieldAccountNumber_APPLY,
            fieldAccountName_APPLY,
            fieldTransferAmount_APPLY,
            fieldTransferAmountLate_APPLY,
            fieldTotalReceivables_APPLY,
            fieldConstructionShopId_APPLY,
            fieldKyoryokuId_APPLY
        ],
        "query": `${fieldStatus_APPLY} in (${in_query})
                and ${fieldPaymentDate_APPLY} = "${target_date}"
                and ${fieldPaymentAccount_APPLY} = "${account}"
                and ${fieldConstructionShopId_APPLY} in (${test_constructors})`
    };

    return kintone.api(kintone.api.url("/k/v1/records", true), "GET", request_body);
};

export const generateCsvData = (applies) => {
    // 申込レコード1つを1行の文字列として、CRLFで連結した文字列を返す
    const csv_rows = applies.map((apply) => getAozoraCsvRow(apply));
    // 最終行の最後にもCRLFを追加
    return `${csv_rows.join("\r\n")}\r\n`;
};

export const getAozoraCsvRow = (record) => {
    // 仕様： https://gmo-aozora.com/support/guide/tranfer-upload.pdf 5/10ページ
    const fields = [];
    // 先にゼロ埋め
    record[fieldBankCode_APPLY]["value"] = (`0000${record[fieldBankCode_APPLY]["value"]}`).slice(-4);
    record[fieldBranchCode_APPLY]["value"] = (`000${record[fieldBranchCode_APPLY]["value"]}`).slice(-3);
    record[fieldAccountNumber_APPLY]["value"] = (`0000000${record[fieldAccountNumber_APPLY]["value"]}`).slice(-7);

    fields.push(record[fieldBankCode_APPLY]["value"]);
    fields.push(record[fieldBranchCode_APPLY]["value"]);
    const deposit_type = (record[fieldDepositType_APPLY]["value"] === "普通")
        ? "1"
        : "2";
    fields.push(deposit_type);
    fields.push(record[fieldAccountNumber_APPLY]["value"]);
    fields.push(zenkakuToHankaku(record[fieldAccountName_APPLY]["value"]));
    fields.push(getAmountByTiming(record));
    fields.push(record[fieldKyoryokuId_APPLY]["value"]); // 顧客情報フィールド。任意入力フィールドであり、協力会社IDを記入する。
    fields.push(" "); // 識別表示フィールド。不使用

    return fields.join(",");
};

export const getAmountByTiming = (record) => {
    // 支払タイミングそれぞれに応じた振込金額を取得する
    const TIMING = record[fieldPaymentTiming_APPLY]["value"];

    if (TIMING === statusPaymentLate_APPLY) {
        return record[fieldTransferAmountLate_APPLY]["value"];
    } else if (TIMING === statusPaymentOriginal_APPLY) {
        return getOriginalPaymentAmount(record);
    } else {
        return record[fieldTransferAmount_APPLY]["value"];
    }
};

export const getOriginalPaymentAmount = (record) => {
    // 通常払いの場合、下記のように特殊な金額計算を行う。
    // ①サービス利用手数料を差し引かない（対象債権金額をそのまま利用する）
    // ②工務店が支払する場合と同額の振込手数料を差し引く
    const constructor_id = record[fieldConstructionShopId_APPLY]["value"];
    const receiver_account = {
        bank_code: record[fieldBankCode_APPLY]["value"],
        branch_code: record[fieldBranchCode_APPLY]["value"],
    };
    const receivable_amount = Number(record[fieldTotalReceivables_APPLY]["value"]);

    if (constructor_id === AVAILABLE_CONSTRUCTORS.REALTOR_SOLUTIONS.ID) {
        const transfer_fee_original = ((receiver_account, transfer_amount) => {
            const LOWER_FEE_BORDER = 30000;

            if ((receiver_account.bank_code === AVAILABLE_CONSTRUCTORS.REALTOR_SOLUTIONS.BANK_CODE)
            && (receiver_account.branch_code === AVAILABLE_CONSTRUCTORS.REALTOR_SOLUTIONS.BRANCH_CODE)) {
                // 同一店内
                return 0;
            } else if ((receiver_account.bank_code === AVAILABLE_CONSTRUCTORS.REALTOR_SOLUTIONS.BANK_CODE)
            && (receiver_account.branch_code !== AVAILABLE_CONSTRUCTORS.REALTOR_SOLUTIONS.BRANCH_CODE)) {
                // 同一銀行内・別の本支店
                if (transfer_amount < LOWER_FEE_BORDER) {
                    return 55;
                } else {
                    return 220;
                }
            } else {
                // 他行宛
                if (transfer_amount < LOWER_FEE_BORDER) {
                    return 330;
                } else {
                    return 550;
                }
            }
        })(receiver_account, receivable_amount);
        // (請求書金額 - 協力会費) - (インベストが関わらない場合を想定した本来の振込手数料)を返す。
        // (請求書金額 - 協力会費)の金額は対象債権合計金額と同じ
        return receivable_amount - transfer_fee_original;
    }

    throw new Error("申込レコードに紐づく工務店が現状は通常払いに未対応なため、処理を中断します。");
};

export const encodeToSjis = (csv_data) => {
    // 1文字ずつ格納
    const unicode_list = [];
    for (let i = 0; i < csv_data.length; i++) {
        unicode_list.push(csv_data.charCodeAt(i));
    }

    // 1文字ずつSJISに変換する
    return Encoding.convert(unicode_list, "sjis", "unicode");
};

// 生成したデータをCSVファイルとしてローカルにダウンロードする。
export const downloadFile = (sjis_code_list, file_name) => {
    const uint8_list = new Uint8Array(sjis_code_list);
    const write_data = new Blob([uint8_list], { type: "text/csv" });

    // 保存
    const download_link = document.createElement("a");
    download_link.download = file_name;
    download_link.href = (window.URL || window.webkitURL).createObjectURL(write_data);

    // DLリンクを生成して自動でクリックまでして、生成したDLリンクはその都度消す
    kintone.app.getHeaderMenuSpaceElement().appendChild(download_link);
    setText(download_link, "download csv");
    download_link.click();
    kintone.app.getHeaderMenuSpaceElement().removeChild(download_link);
};

export const setText = (element,str) => {
    if(element.textContent !== undefined){
        element.textContent = str;
    }
    if(element.innerText !== undefined){
        element.innerText = str;
    }
};

export const updateToDone = (outputted_records) => {
    const request_body = {
        "app": APP_ID_APPLY,
        "records": outputted_records.map((record) => {
            return {
                "id": record[fieldRecordId_APPLY]["value"],
                "record": {
                    [fieldStatus_APPLY]: {
                        "value": statusDone_APPLY
                    }
                }
            };
        })
    };

    return kintone.api(kintone.api.url("/k/v1/records", true), "PUT", request_body);
};

export const zenkakuToHankaku = (input_string) => {
    // 全銀形式で使用可能な文字を半角に変換する。使用不可能な文字を受け取った場合はエラーとする。
    // 特に、ダブルクォーテーションは使用不可能。
    const zenkaku_array = [
        "ア","イ","ウ","エ","オ","カ","キ","ク","ケ","コ"
        ,"サ","シ","ス","セ","ソ","タ","チ","ツ","テ","ト"
        ,"ナ","ニ","ヌ","ネ","ノ","ハ","ヒ","フ","ヘ","ホ"
        ,"マ","ミ","ム","メ","モ","ヤ","ユ","ヨ"
        ,"ラ","リ","ル","レ","ロ","ワ","ヰ","ヱ","ヲ","ン"
        ,"ガ","ギ","グ","ゲ","ゴ","ザ","ジ","ズ","ゼ","ゾ"
        ,"ダ","ヂ","ヅ","デ","ド","バ","ビ","ブ","ベ","ボ"
        ,"パ","ピ","プ","ペ","ポ"
        ,"ァ","ィ","ゥ","ェ","ォ","ャ","ュ","ョ","ッ"
        ,"ｧ","ｨ","ｩ","ｪ","ｫ","ｬ","ｭ","ｮ","ｯ" // もともと半角なのに拗音・促音が使用不可としてエラーになるのを防ぐ
        ,"゛","°","、","。","「","」","ー","・","（","）","￥","／","．"
        ,"－","‐","―","─","━"
        ,"Ａ","Ｂ","Ｃ","Ｄ","Ｅ","Ｆ","Ｇ","Ｈ","Ｉ","Ｊ","Ｋ","Ｌ","Ｍ","Ｎ","Ｏ","Ｐ","Ｑ","Ｒ","Ｓ","Ｔ","Ｕ","Ｖ","Ｗ","Ｘ","Ｙ","Ｚ"
        ,"ａ","ｂ","ｃ","ｄ","ｅ","ｆ","ｇ","ｈ","ｉ","ｊ","ｋ","ｌ","ｍ","ｎ","ｏ","ｐ","ｑ","ｒ","ｓ","ｔ","ｕ","ｖ","ｗ","ｘ","ｙ","ｚ"
        ,"０","１","２","３","４","５","６","７","８","９"
        ,"　"
    ];

    const hankaku_array = [
        "ｱ","ｲ","ｳ","ｴ","ｵ","ｶ","ｷ","ｸ","ｹ","ｺ"
        ,"ｻ","ｼ","ｽ","ｾ","ｿ","ﾀ","ﾁ","ﾂ","ﾃ","ﾄ"
        ,"ﾅ","ﾆ","ﾇ","ﾈ","ﾉ","ﾊ","ﾋ","ﾌ","ﾍ","ﾎ"
        ,"ﾏ","ﾐ","ﾑ","ﾒ","ﾓ","ﾔ","ﾕ","ﾖ"
        ,"ﾗ","ﾘ","ﾙ","ﾚ","ﾛ","ﾜ","ｲ","ｴ","ｦ","ﾝ"
        ,"ｶﾞ","ｷﾞ","ｸﾞ","ｹﾞ","ｺﾞ","ｻﾞ","ｼﾞ","ｽﾞ","ｾﾞ","ｿﾞ"
        ,"ﾀﾞ","ﾁﾞ","ﾂﾞ","ﾃﾞ","ﾄﾞ","ﾊﾞ","ﾋﾞ","ﾌﾞ","ﾍﾞ","ﾎﾞ"
        ,"ﾊﾟ","ﾋﾟ","ﾌﾟ","ﾍﾟ","ﾎﾟ"
        ,"ｱ","ｲ","ｳ","ｴ","ｵ","ﾔ","ﾕ","ﾖ","ﾂ"
        ,"ｱ","ｲ","ｳ","ｴ","ｵ","ﾔ","ﾕ","ﾖ","ﾂ"
        ,"ﾞ","ﾟ",",",".","｢","｣","-"," ","(",")","\\","/","." //中黒は使用不可能なのでスペースにする。
        ,"-","-","-","-","-"
        ,"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
        ,"a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"
        ,"0","1","2","3","4","5","6","7","8","9"
        ," "
    ];

    let converted_han = "";

    for (let i = 0; i < input_string.length; i++){
        const input_char = input_string.charAt(i);
        if (hankaku_array.includes(input_char)) {
            // 元々半角文字だったらそのまま使う
            converted_han += input_char;
        } else if (zenkaku_array.includes(input_char)){
            // 使えるけど全角の文字は半角にして使う
            converted_han += hankaku_array[zenkaku_array.indexOf(input_char)];
        } else {
            // 使えない文字はエラー
            throw new Error(`振込データに使用できない文字が含まれています：${input_string}`);
        }
    }

    return converted_han;
};
