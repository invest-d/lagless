/*
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

    const fetch = require("node-fetch");
    const data = {"banks": []};

    const APP_ID_APPLY              = kintone.app.getId();
    const fieldRecordId_APPLY       = "レコード番号";
    const fieldBankCode_APPLY       = "bankCode";
    const fieldBranchCode_APPLY     = "branchCode";
    const fieldDepositType_APPLY    = "deposit";
    const fieldAccountNumber_APPLY  = "accountNumber";
    const fieldAccountName_APPLY    = "accountName";
    const fieldTransferAmount_APPLY = "transferAmount";
    const fieldStatus_APPLY         = "状態";
    const statusReady_APPLY         = "振込前確認完了";
    const statusDone_APPLY          = "振込データ出力済";
    const fieldPaymentDate_APPLY    = "paymentDate";
    const fieldPaymentAccount_APPLY = "paymentAccount";
    const requester_accounts = [
        "ID",
        "LAGLESS"
    ];

    async function getBankKana(request_json) {
        if (!Object.prototype.hasOwnProperty.call(request_json, "bank")) {
            throw new Error("no bank code specified.");
        }

        await fetchBank(request_json)
            .catch(err => {
                console.error(err);
                throw new Error("銀行情報の取得中にエラーが発生しました");
            });

        if (Object.prototype.hasOwnProperty.call(request_json, "branch")) {
            return data.banks.find(bank => bank.code == request_json.bank).branches.find(branch => branch.code == request_json.branch).kana;
        }
        else {
            return data.banks.find(bank => bank.code == request_json.bank).kana;
        }
    }

    async function fetchBank(request_json) {
        // 銀行情報がキャッシュされていない場合のみ、fetchを行って追加でキャッシュする
        if (data.banks.some(bank => bank.code == request_json.bank)) {
            return;
        }

        const res = await fetch("https://us-central1-lagless.cloudfunctions.net/zengin?bank=" + request_json.bank);
        const result = await res.json();
        data.banks.push(result.banks[0]);
    }

    // インベストデザイン側の口座情報をそれぞれclassで持つ
    class Account {
        constructor() {
            this.smbc_header_record  = "1";
            this.smbc_transfer_type  = "21";
            this.smbc_char_code_type = "0";
        }

        create(account) {
            if (account === requester_accounts[0]) {
                return new AccountID();
            }
            else if (account === requester_accounts[1]) {
                return new AccountLagless();
            }
            else {
                throw new Error("invalid account.");
            }
        }
    }

    class AccountID extends Account {
        constructor() {
            super();
            this.smbc_code      = "2648852000";
            this.requester_name = "ｲﾝﾍﾞｽﾄﾃﾞｻﾞｲﾝ(ｶ".padEnd(40, " ");
            this.bank_code      = "0009";
            this.bank_name      = addPadding("ﾐﾂｲｽﾐﾄﾓ", 15); //getBankKanaを使いたいけど、constructor内では非同期処理を同期的に扱えない。
            this.branch_code    = "219";
            this.branch_name    = addPadding("ｶﾝﾀﾞ", 15);
            this.deposit_type   = "1";
            this.account_number = "3391195";
        }
    }

    class AccountLagless extends Account {
        constructor() {
            super();
            this.smbc_code      = "3648579000";
            this.requester_name = "ﾗｸﾞﾚｽ (ﾄﾞ,ﾏｽﾀ-ｺｳｻﾞ".padEnd(40, " ");
            this.bank_code      = "0009";
            this.bank_name      = addPadding("ﾐﾂｲｽﾐﾄﾓ", 15);
            this.branch_code    = "219";
            this.branch_name    = addPadding("ｶﾝﾀﾞ", 15);
            this.deposit_type   = "1";
            this.account_number = "3409134";
        }
    }

    kintone.events.on("app.record.index.show", function(event) {
        // コントロールの重複作成防止チェック
        if (document.getElementById("outputCsv") !== null) {
            return;
        }

        // 出力ボタンを設置
        const button = createButtonOutputCsv();
        kintone.app.getHeaderMenuSpaceElement().appendChild(button);
    });

    function createButtonOutputCsv() {
        let outputCsv = document.createElement("button");
        outputCsv.id = "outputCsv";
        outputCsv.innerText = "SMBC向け振込データをダウンロード";
        outputCsv.addEventListener("click", clickOutputCsv);
        return outputCsv;
    }

    // CSV出力ボタンクリック時の処理を定義
    async function clickOutputCsv() {
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
            alert("入力形式が正しくありませんでした。\n入力した値：" + payment_date);
            return;
        }

        const only_undownloaded = confirm("未出力の振込データだけを出力しますか？\n"
        + "OK：未出力のものは出力し、出力済みのものは出力しない\n"
        + "キャンセル：未出力のものも、未出力のものも、全て出力する");

        // 支払元口座のそれぞれについて、該当するレコードを取得→加工→CSVファイルに保存
        await kintone.Promise.all(requester_accounts.map(async (account) => {
            const target = await getKintoneRecords(account, payment_date, only_undownloaded)
                .catch(err => {
                    console.error(err);
                    alert(`支払元口座：${account}のデータを取得中にエラーが発生しました。\n${err.message}`);
                });

            console.log("target_applies: account of "  + account);
            console.log(target.records);

            if (target.records.length === 0) {
                alert(`支払元口座：${account}の支払い対象はありませんでした。`);
            } else {
                const csv_data = await generateCsvData(account, target.records, payment_date);
                const sjis_list = encodeToSjis(csv_data);

                const file_name = `支払日${payment_date}ぶんの振込データ（振込元：${account}）.csv`;
                downloadFile(sjis_list, file_name);

                await updateToDone(target.records);
            }
        }));

        alert("振込データのダウンロードを完了しました。");
        alert("ページを更新します。");
        window.location.reload();
    }

    function getKintoneRecords(account, target_date, only_undownloaded) {
        console.log("申込レコード一覧から、CSVファイルへの出力対象レコードを取得する。対象口座：" + account);

        const in_query = (only_undownloaded)
            ? `("${statusReady_APPLY}")`
            : `("${statusReady_APPLY}", "${statusDone_APPLY}")`;

        const request_body = {
            "app": APP_ID_APPLY,
            "fields": [
                fieldRecordId_APPLY,
                fieldBankCode_APPLY,
                fieldBranchCode_APPLY,
                fieldDepositType_APPLY,
                fieldAccountNumber_APPLY,
                fieldAccountName_APPLY,
                fieldTransferAmount_APPLY
            ],
            "query": `${fieldStatus_APPLY} in ${in_query}
                    and ${fieldPaymentDate_APPLY} = "${target_date}"
                    and ${fieldPaymentAccount_APPLY} = "${account}"`
        };

        return kintone.api(kintone.api.url("/k/v1/records", true), "GET", request_body);
    }

    async function generateCsvData(account, applies, payment_date) {
        console.log("取得したレコードをCSVファイルに変換する。");

        let csv_content = [];
        const csv_format = (col => `"${col}"`);

        // YYYY-MM-DDをMMDDに変換
        const pay_date_mmdd = payment_date.split("-")[1] + payment_date.split("-")[2];

        // ヘッダー
        const account_obj = new Account().create(account);
        csv_content.push(getHeaderRecord(account_obj, pay_date_mmdd).map(csv_format).join(","));

        // データ
        const data_records = await getDataRecords(applies);
        data_records.forEach((data_record) => {
            csv_content.push(data_record.map(csv_format).join(","));
        });

        // トレーラー
        csv_content.push(getTrailerRecord(applies).map(csv_format).join(","));

        // エンド
        csv_content.push(getEndRecord().map(csv_format).join(","));

        const new_line = "\r\n";
        return csv_content.join(new_line);
    }

    function getHeaderRecord(account_obj, transfer_date_mmdd) {
        return [
            account_obj.smbc_header_record,  //データ区分：ヘッダーレコード
            account_obj.smbc_transfer_type,  //種別コード：総合振込
            account_obj.smbc_char_code_type, //コード区分：JIS
            account_obj.smbc_code,           //振込依頼人会社コード
            account_obj.requester_name,      //振込依頼人名ｶﾅ
            transfer_date_mmdd,              //振込日MMDD
            account_obj.bank_code,           //銀行コード
            account_obj.bank_name,           //銀行名ｶﾅ
            account_obj.branch_code,         //支店コード
            account_obj.branch_name,         //支店名ｶﾅ
            account_obj.deposit_type,        //口座種別
            account_obj.account_number       //口座番号
        ];
    }

    async function getDataRecords(kintone_records) {
        return await kintone.Promise.all(kintone_records.map(async (kintone_record) => {
            const bank_code_to = ("0000" + kintone_record[fieldBankCode_APPLY]["value"]).slice(-4);
            const bank_name_to = addPadding(await getBankKana({bank: bank_code_to}), 15);
            const branch_code_to = ("000" + kintone_record[fieldBranchCode_APPLY]["value"]).slice(-3);
            const branch_name_to = addPadding(await getBankKana({bank: bank_code_to, branch: branch_code_to}), 15);
            const deposit_to = (kintone_record[fieldDepositType_APPLY]["value"] === "普通")
                ? "1"
                : "2";
            const account_number_to = kintone_record[fieldAccountNumber_APPLY]["value"];
            const account_name_to = addPadding(kintone_record[fieldAccountName_APPLY]["value"], 30);
            const amount_of_money = kintone_record[fieldTransferAmount_APPLY]["value"];

            return [
                "2",               //データ区分：データレコード
                bank_code_to,      //銀行コード
                bank_name_to,      //銀行名ｶﾅ
                branch_code_to,    //支店コード
                branch_name_to,    //支店名ｶﾅ
                " ".repeat(4),     //手形交換所番号：不使用、スペース埋め
                deposit_to,        //口座種別
                account_number_to, //口座番号
                account_name_to,   //受取人名ｶﾅ
                amount_of_money,   //振込金額
                "0",               //新規コード：その他
                "",                //顧客コード1：不使用
                "",                //顧客コード2：不使用
                " ",               //振込指定区分：スペース
                ""                 //識別コード：不使用
            ];
        }));
    }

    function getTrailerRecord(kintone_records) {
        const total_amount = kintone_records.reduce((amount, record) => {
            return amount + Number(record[fieldTransferAmount_APPLY]["value"]);
        }, 0);

        return [
            "8",                    //データ区分：トレーラーレコード
            kintone_records.length, //合計件数
            total_amount            //合計金額
        ];
    }

    function getEndRecord() {
        return [
            "9" //データ区分：エンドレコード
        ];
    }

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
        console.log("downloading...");

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
        console.log("出力を終えたレコードの状態を出力済みに更新する");

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

    // 全銀形式で使用可能な文字を半角に変換する。使用不可能な文字を受け取った場合はエラーとする。
    function zenkakuToHankaku(input_string){
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
            ,"゛","°","、","。","「","」","ー","・","（","）","￥","／"
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
            ,"ﾞ","ﾟ",",",".","｢","｣","-"," ","(",")","\\","/" //中黒は使用不可能なのでスペースにする。
            ,"-","-","-","-","-"
            ,"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
            ,"a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"
            ,"0","1","2","3","4","5","6","7","8","9"
            ," "
        ];

        let converted_han = "";

        for (let i = 0; i < input_string.length; i++){
            let input_char = input_string.charAt(i);
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

    // 全銀フォーマットの文字数に合わせるため、半角文字に変換して指定文字数まで半角空白を追加する。もし指定文字数より多かったら右から削る。
    function addPadding(input, num) {
        // inputは半角に出来るものだけ受け付ける
        const input_han = zenkakuToHankaku(input);
        const char_num = input_han.length;
        let padded = input_han;

        if (num - char_num > 0) {
            padded = input_han + " ".repeat(num - char_num);
        }
        else {
            padded = padded.slice(0, num);
        }

        return padded;
    }
})();
