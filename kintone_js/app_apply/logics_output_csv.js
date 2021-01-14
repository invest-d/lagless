"use strict";

export const CLIENT = new KintoneRestAPIClient({baseUrl: "https://investdesign.cybozu.com"});

// CSVファイルで保存するにあたってShift-Jisに変換する
const Encoding = require("encoding-japanese");

import { schema_apply as schema_apply_dev } from "../159/schema";
import { schema_apply as schema_apply_prod } from "../161/schema";

export const APP_ID_APPLY = kintone.app.getId();

export const schema_apply = ((app_id) => {
    if (app_id === 159) {
        return schema_apply_dev;
    } else if (app_id === 161) {
        return schema_apply_prod;
    } else {
        throw new Error(`Invalid app: ${app_id}`);
    }
})(APP_ID_APPLY);

export const fieldRecordId_APPLY            = schema_apply.fields.properties.レコード番号.code;
export const fieldBankCode_APPLY            = schema_apply.fields.properties.bankCode.code;
export const fieldBranchCode_APPLY          = schema_apply.fields.properties.branchCode.code;
export const fieldDepositType_APPLY         = schema_apply.fields.properties.deposit.code;
export const fieldAccountNumber_APPLY       = schema_apply.fields.properties.accountNumber.code;
export const fieldAccountName_APPLY         = schema_apply.fields.properties.accountName.code;
export const fieldTotalReceivables_APPLY    = schema_apply.fields.properties.totalReceivables.code;
export const fieldTransferAmount_APPLY      = schema_apply.fields.properties.transferAmount.code;
export const fieldStatus_APPLY              = schema_apply.fields.properties.状態.code;
const statusReady_APPLY                     = schema_apply.fields.properties.状態.options.振込前確認完了.label;
const statusDone_APPLY                      = schema_apply.fields.properties.状態.options.振込データ出力済.label;
export const fieldPaymentDate_APPLY         = schema_apply.fields.properties.paymentDate.code;
export const fieldPaymentAccount_APPLY      = schema_apply.fields.properties.paymentAccount.code;
export const fieldPaymentTiming_APPLY       = schema_apply.fields.properties.paymentTiming.code;
export const fieldConstructionShopId_APPLY  = schema_apply.fields.properties.constructionShopId.code;
export const fieldKyoryokuId_APPLY          = schema_apply.fields.properties.ルックアップ.code;

export const needToShow = (event, button_name, view_name) => {
    // 一覧機能で特定の一覧を選んでいる場合のみ表示
    const is_selected_available_list = event.viewName === view_name;

    // 同一ボタンの重複作成防止
    const not_displayed = document.getElementById(button_name) === null;

    return is_selected_available_list && not_displayed;
};

export const confirmBeforeExec = () => {
    const message = "振込用のcsvデータをダウンロードします。よろしいですか？\n\n"
        + "※このあとに支払日を指定し、\n"
        + "未出力のものだけ出力 OR 出力済みも含めて全て出力 のどちらかを選択できます。";
    return confirm(message);
};

export const inputPaymentDate = () => {
    return prompt("YYYY-MM-DDの形式で支払日を入力してください。\n例：2020-01-23");
};

export const getTargetConditions = () => {
    const message = "未出力の振込データだけを出力しますか？\n"
        + "OK：未出力のものは出力し、出力済みのものは出力しない\n"
        + "キャンセル：未出力のものも、出力済みのものも、全て出力する";
    const only_undownloaded = confirm(message);

    const conditions = [
        statusReady_APPLY
    ];

    if (!only_undownloaded) {
        conditions.push(statusDone_APPLY);
    }

    return conditions;
};

export const generateCsvData = (applies) => {
    // 申込レコード1つを1行のCSV文字列に変換
    const csv_rows = applies.map((apply) =>
        getAozoraCsvRow(apply, apply.transfer_amount)
    );
    // CSV文字列それぞれをCRLFで結合し、最終行の最後にもCRLFを追加して返す
    return `${csv_rows.join("\r\n")}\r\n`;
};

export const getEarlyPaymentAmount = (record) => {
    return record[fieldTransferAmount_APPLY]["value"];
};

const getAozoraCsvRow = (record, transfer_amount) => {
    // 仕様： https://gmo-aozora.com/support/guide/tranfer-upload.pdf 5/10ページ
    const fields = [];

    // 先にレコードのデータをゼロ埋めした値で上書きしておく
    record[fieldBankCode_APPLY]["value"]        = (`0000${record[fieldBankCode_APPLY]["value"]}`).slice(-4);
    record[fieldBranchCode_APPLY]["value"]      = (`000${record[fieldBranchCode_APPLY]["value"]}`).slice(-3);
    record[fieldAccountNumber_APPLY]["value"]   = (`0000000${record[fieldAccountNumber_APPLY]["value"]}`).slice(-7);

    fields.push(record[fieldBankCode_APPLY]["value"]);
    fields.push(record[fieldBranchCode_APPLY]["value"]);
    const deposit_type = (record[fieldDepositType_APPLY]["value"] === "普通")
        ? "1"
        : "2";
    fields.push(deposit_type);
    fields.push(record[fieldAccountNumber_APPLY]["value"]);
    fields.push(zenkakuToHankaku(record[fieldAccountName_APPLY]["value"]));
    fields.push(transfer_amount);
    fields.push(record[fieldKyoryokuId_APPLY]["value"]); // 顧客情報フィールド。任意入力フィールドであり、協力会社IDを記入する。
    fields.push(" "); // 識別表示フィールド。不使用

    return fields.join(",");
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

const setText = (element,str) => {
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

const zenkakuToHankaku = (input_string) => {
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
