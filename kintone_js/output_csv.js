/*
    Version 3 beta
    GMOあおぞらネット銀行特有のCSVファイル形式で出力するように改良。
    同銀行を利用しての振込登録は一部の工務店のみでテスト運用するため、出力可能な対象データを制限している。
    また、Version 2以前の機能は結局オペレーション上で利用していなかった（振込件数が常に1桁などで人力の方が作業が早かった）ため、全面的に廃止。
    Version 2以前で利用していた全銀形式では金融機関およびその支店の日本語名称を外部APIから取得する必要があった。
    しかしGMOあおぞら形式では日本語名称をセットするフィールド無いため、APIへのアクセスも必要なくなった

    Version 2
    申込レコードの「支払タイミング」フィールドの値によって、出力する金額フィールドを変更する。
    支払タイミング：遅払い→「遅払い時の振込金額」フィールド
    支払タイミング：（遅払い以外）→「早払い時の振込金額」フィールド
    各明細の合計金額行についても、上記に従う。

    Version 1
    申込アプリにCSVダウンロードを行うボタンを追加する。
    ボタンをクリックしたとき、申込レコードのうち下記の条件を満たすレコードについて、
    全銀形式に整形した上でCSVファイルに書き出し、ローカルに保存する。
        - 支払日フィールドの値が、promptのテキストボックスで指定した日付に一致する
        - 状態フィールドの値が、振込データ作成待ちに一致する（ダイアログの選択によって、出力済みデータも含めて出力可能）
    保存後、出力したデータの状態フィールドを振込データ出力済みに更新する。
*/

(function() {
    "use strict";

    // CSVファイルで保存するにあたってShift-Jisに変換する
    const Encoding = require("encoding-japanese");

    const APP_ID_APPLY                      = kintone.app.getId();
    const fieldRecordId_APPLY               = "レコード番号";
    const fieldBankCode_APPLY               = "bankCode";
    const fieldBranchCode_APPLY             = "branchCode";
    const fieldDepositType_APPLY            = "deposit";
    const fieldAccountNumber_APPLY          = "accountNumber";
    const fieldAccountName_APPLY            = "accountName";
    const fieldTotalReceivables_APPLY       = "totalReceivables";
    const fieldTransferAmount_APPLY         = "transferAmount";
    const fieldTransferAmountLate_APPLY     = "transferAmount_late";
    const fieldStatus_APPLY                 = "状態";
    const statusReady_APPLY                 = "振込前確認完了";
    const statusDone_APPLY                  = "振込データ出力済";
    const fieldPaymentDate_APPLY            = "paymentDate";
    const fieldPaymentAccount_APPLY         = "paymentAccount";
    const fieldPaymentTiming_APPLY          = "paymentTiming";
    const statusPaymentLate_APPLY           = "遅払い";
    const statusPaymentOriginal_APPLY       = "通常払い";
    const fieldConstructionShopId_APPLY     = "constructionShopId";
    const fieldKyoryokuId_APPLY             = "ルックアップ";

    const AVAILABLE_CONSTRUCTORS = {
        REALTOR_SOLUTIONS: {
            ID: "100",
            NAME: "株式会社RealtorSolutions",
            BANK_CODE: "0157",
            BRANCH_CODE: "261"
        }
    };

    const buttonName = "outputCsv";
    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.index.show", (event) => {
        // コントロールの重複作成防止チェック
        if (document.getElementById(buttonName) !== null) {
            return;
        }

        // 出力ボタンを設置
        const button = createButton();
        kintone.app.getHeaderMenuSpaceElement().appendChild(button);
    });

    function createButton() {
        const button = document.createElement("button");
        button.id = buttonName;
        button.innerText = "あおぞら向け総合振込データをダウンロード";
        button.addEventListener("click", clickButton);
        return button;
    }

    // CSV出力ボタンクリック時の処理を定義
    async function clickButton() {
        const do_download = confirm("振込用のcsvデータをダウンロードします。よろしいですか？\n\n"
        + "※このあとに支払日を指定し、\n"
        + "未出力のものだけ出力 OR 出力済みも含めて全て出力 のどちらかを選択できます。");
        if (!do_download) {
            alert("処理は中断されました。");
            return;
        }

        const payment_date = prompt("YYYY-MM-DDの形式で支払日を入力してください。\n例：2020-01-23");
        const pattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!pattern.test(payment_date)) {
            alert(`入力形式が正しくありませんでした。\n入力した値：${payment_date}`);
            return;
        }

        const only_undownloaded = confirm("未出力の振込データだけを出力しますか？\n"
        + "OK：未出力のものは出力し、出力済みのものは出力しない\n"
        + "キャンセル：未出力のものも、未出力のものも、全て出力する");

        const target_status = ((only_undownloaded) => {
            if (only_undownloaded) {
                return statusReady_APPLY;
            } else {
                return `${statusReady_APPLY} および ${statusDone_APPLY}`;
            }
        })(only_undownloaded);
        alert(`${fieldStatus_APPLY}フィールドが${target_status}のレコードを対象に処理します。`);

        alert(`本機能はテスト運用中です。従って、工務店が${Object.values(AVAILABLE_CONSTRUCTORS).map((c) => c.NAME).join(", ")}の申込レコードのみを対象とします。`);

        const account = "ID"; // GMOあおぞらから振込できるのはIDの口座のみ
        const target = await getKintoneRecords(account, payment_date, only_undownloaded)
            .catch((err) => {
                alert(`支払元口座：${account}のデータを取得中にエラーが発生しました。\n${err.message}`);
                throw new Error(err);
            });

        if (target && target.records.length === 0) {
            alert(`支払元口座：${account}の支払い対象はありませんでした。`);
            return;
        }

        try {
            const csv_data = generateCsvData(target.records);
            const sjis_list = encodeToSjis(csv_data);

            const file_name = `支払日${payment_date}ぶんの振込データ（振込元：${account}）.csv`;
            downloadFile(sjis_list, file_name);

            await updateToDone(target.records);
            alert("振込データのダウンロードを完了しました。");
            alert("ページを更新します。");
            window.location.reload();
        } catch (err) {
            alert (err);
        }
    }

    function getKintoneRecords(account, target_date, only_undownloaded) {
        console.log(`申込レコード一覧から、CSVファイルへの出力対象レコードを取得する。対象口座：${account}`);

        const in_query = (only_undownloaded)
            ? `("${statusReady_APPLY}")`
            : `("${statusReady_APPLY}", "${statusDone_APPLY}")`;

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
            "query": `${fieldStatus_APPLY} in ${in_query}
                    and ${fieldPaymentDate_APPLY} = "${target_date}"
                    and ${fieldPaymentAccount_APPLY} = "${account}"
                    and ${fieldConstructionShopId_APPLY} in (${test_constructors})`
        };

        return kintone.api(kintone.api.url("/k/v1/records", true), "GET", request_body);
    }

    const generateCsvData = (applies) => {
        // 申込レコード1つを1行の文字列として、CRLFで連結した文字列を返す
        const csv_rows = applies.map((apply) => getAozoraCsvRow(apply));
        // 最終行の最後にもCRLFを追加
        return `${csv_rows.join("\r\n")}\r\n`;
    };

    const getAozoraCsvRow = (record) => {
        // 各フィールドのデータをダブルクォーテーションで囲み、カンマ区切りにして連結した文字列を返す。
        const csv_format = (col) => `"${col}"`; // データにダブルクォーテーションは含まれない。

        // 仕様： https://gmo-aozora.com/support/guide/tranfer-upload.pdf 5/10ページ
        const fields = [];
        fields.push((`0000${record[fieldBankCode_APPLY]["value"]}`).slice(-4));
        fields.push((`000${record[fieldBranchCode_APPLY]["value"]}`).slice(-3));
        const deposit_type = (record[fieldDepositType_APPLY]["value"] === "普通")
            ? "1"
            : "2";
        fields.push(deposit_type);
        fields.push((`0000000${record[fieldAccountNumber_APPLY]["value"]}`).slice(-7));
        fields.push(zenkakuToHankaku(record[fieldAccountName_APPLY]["value"]));
        fields.push(getAmountByTiming(record));
        fields.push(record[fieldKyoryokuId_APPLY]["value"]); // 顧客情報フィールド。任意入力フィールドであり、協力会社IDを記入する。
        fields.push(" "); // 識別表示フィールド。不使用

        return fields.map(csv_format).join(",");
    };

    const getAmountByTiming = (record) => {
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

    const getOriginalPaymentAmount = (record) => {
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

    function encodeToSjis(csv_data) {
        // 1文字ずつ格納
        const unicode_list = [];
        for (let i = 0; i < csv_data.length; i++) {
            unicode_list.push(csv_data.charCodeAt(i));
        }

        // 1文字ずつSJISに変換する
        return Encoding.convert(unicode_list, "sjis", "unicode");
    }

    // 生成したデータをCSVファイルとしてローカルにダウンロードする。
    function downloadFile(sjis_code_list, file_name) {
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
    }

    function setText(element,str){
        if(element.textContent !== undefined){
            element.textContent = str;
        }
        if(element.innerText !== undefined){
            element.innerText = str;
        }
    }

    function updateToDone(outputted_records) {
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
    }

    function zenkakuToHankaku(input_string){
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
    }
})();
