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

    const APP_ID_APPLY = kintone.app.getId();
    const fieldRecordId_APPLY       = 'レコード番号';
    const fieldBankCode_APPLY       = 'bankCode';
    const fieldBranchCode_APPLY     = 'branchCode';
    const fieldDepositType_APPLY    = 'deposit';
    const fieldAccountNumber_APPLY  = 'accountNumber';
    const fieldAccountName_APPLY    = 'accountName';
    const fieldTransferAmount_APPLY = 'transferAmount';
    const fieldStatus_APPLY         = '状態';
    const statusReady_APPLY         = '振込前確認完了';
    const statusDone_APPLY          = '振込データ出力済';
    const fieldPaymentDate_APPLY    = 'paymentDate';
    const fieldPaymentAccount_APPLY = 'paymentAccount';

    class Account {
        constructor() {
            this.smbc_header_record = '1';
            this.smbc_transfer_type = '21';
            this.smbc_char_code_type = '0';
        }

        create(account) {
            if (account === 'ID') {
                return new AccountID();
            }
            else if (account === 'LAGLESS') {
                return new AccountLagless();
            }
            else {
                throw new Error('invalid account.');
            }
        }
    }

    class AccountID extends Account {
        constructor() {
            super();
            this.smbc_code      = '2648852000';
            this.requester_name = ('ｲﾝﾍﾞｽﾄﾃﾞｻﾞｲﾝ(ｶ' + ' '.repeat(40)).slice(0, 40);
            this.bank_code      = '0009';
            this.bank_name      = adjustLength(zenkakuToHankaku(bank_info[this.bank_code]['kana']), 15);
            this.branch_code    = '219';
            this.branch_name    = adjustLength(zenkakuToHankaku(bank_info[this.bank_code]['branches'][this.branch_code]['kana']), 15);
            this.deposit_type   = '1';
            this.account_number = '3391195';
        }
    }

    class AccountLagless extends Account {
        constructor() {
            super();
            this.smbc_code      = '3648579000';
            this.requester_name = ('ﾗｸﾞﾚｽ (ﾄﾞ,ﾏｽﾀ-ｺｳｻﾞ' + ' '.repeat(40)).slice(0, 40);
            this.bank_code      = '0009';
            this.bank_name      = adjustLength(zenkakuToHankaku(bank_info[this.bank_code]['kana']), 15);
            this.branch_code    = '219';
            this.branch_name    = adjustLength(zenkakuToHankaku(bank_info[this.bank_code]['branches'][this.branch_code]['kana']), 15);
            this.deposit_type   = '1';
            this.account_number = '3409134';
        }
    }

    kintone.events.on('app.record.index.show', function(event) {
        // コントロールの重複作成防止チェック
        if (document.getElementById('outputCsv') !== null) {
            return;
        }

        importEncodingLibrary();

        // 出力ボタンを設置
        const button = getButtonOutputCsv();
        kintone.app.getHeaderMenuSpaceElement().appendChild(button);
    });

    // CSV作成時に使うライブラリを読み込む
    function importEncodingLibrary() {
        let script_encoding = document.createElement('script');
        script_encoding.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/encoding-japanese/1.0.30/encoding.min.js');
        script_encoding.setAttribute('type', 'text/javascript');
        document.head.appendChild(script_encoding);

        let script_filesaver = document.createElement('script');
        script_filesaver.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js');
        script_filesaver.setAttribute('type', 'text/javascript');
        document.head.appendChild(script_filesaver);
    }

    function getButtonOutputCsv() {
        let outputCsv = document.createElement('button');
        outputCsv.id = 'outputCsv';
        outputCsv.innerText = 'SMBC向け振込データをダウンロード';
        outputCsv.addEventListener('click', clickOutputCsv);
        return outputCsv;
    }

    // CSV出力ボタンクリック時の処理を定義
    function clickOutputCsv() {
        const do_download = confirm('振込用のcsvデータをダウンロードします。よろしいですか？\n\n※このあとに支払日の指定と、\n未出力のものだけ出力 OR 出力済みも含めて全て出力 のどちらかを選択できます。');
        if (!do_download) {
            alert('処理は中断されました。');
            return;
        }

        const payment_date = prompt('YYYY-MM-DDの形式で支払日を入力してください。\n例：2020-01-01');
        const pattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!pattern.test(payment_date)) {
            alert('入力形式が正しくありませんでした。\n入力した値：' + payment_date);
            return;
        }

        const only_undownloaded = confirm('未出力の振込データだけを出力しますか？\nOK：未出力のみを出力し、出力済みのものは出力しない\nキャンセル：未出力のものも、未出力のものも、全て出力する');

        const requester_accounts = [
            'ID',
            'LAGLESS'
        ];

        let csv_promises = [];
        requester_accounts.forEach((account) => {
            const csv_promise = getKintoneRecords(account, payment_date, only_undownloaded)
            .then((target_applies) => {
                console.log('target_applies: '  + account);
                console.log(target_applies);

                if (target_applies.length === 0) {
                    return new kintone.Promise((resolve, reject) => {
                        reject(`支払元口座：${account}の支払い対象はありませんでした。`);
                    });
                }

                const csv_data = generateCsvData(account, target_applies, payment_date);

                const file_name = '支払日' + payment_date + 'ぶんの振込データ（振込元：' + account + '）.csv';
                downloadFile(csv_data, file_name);

                return updateToDone(target_applies);
            })
            .catch((rejected) => {
                alert(rejected);
            });

            csv_promises.push(csv_promise);
        });

        // 全ての支払元口座について処理が終わったら
        kintone.Promise.all(csv_promises)
        .then(() => {
            alert('振込データのダウンロードを完了しました。');
            alert('ページを更新します。');
            window.location.reload();
        });
    }

    function getKintoneRecords(account, target_date, only_undownloaded) {
        console.log('申込レコード一覧から、CSVファイルへの出力対象レコードを取得する。対象口座：' + account);

        const in_query = (only_undownloaded)
            ? `(\"${statusReady_APPLY}\")`
            : `(\"${statusReady_APPLY}\", \"${statusDone_APPLY}\")`;

        const request_body = {
            'app': APP_ID_APPLY,
            'fields': [
                fieldRecordId_APPLY,
                fieldBankCode_APPLY,
                fieldBranchCode_APPLY,
                fieldDepositType_APPLY,
                fieldAccountNumber_APPLY,
                fieldAccountName_APPLY,
                fieldTransferAmount_APPLY
            ],
            'query': `${fieldStatus_APPLY} in ${in_query}
                    and ${fieldPaymentDate_APPLY} = \"${target_date}\"
                    and ${fieldPaymentAccount_APPLY} = \"${account}\"`
        }

        return new kintone.Promise((resolve, reject) => {
            kintone.api(kintone.api.url('/k/v1/records', true), 'GET', request_body
            , (resp) => {
                resolve(resp.records);
            }, (err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    function generateCsvData(account, applies, payment_date) {
        console.log('取得したレコードをCSVファイルに変換する。');

        let csv_content = [];
        const csv_format = (col => `"${col}"`);

        // YYYY-MM-DDをMMDDに変換
        const pay_date_mmdd = payment_date.split('-')[1] + payment_date.split('-')[2];

        // ヘッダー
        const account_obj = new Account().create(account);
        csv_content.push(getHeaderRecord(account_obj, pay_date_mmdd).map(csv_format).join(','));

        // データ
        getDataRecords(applies).forEach((data_record) => {
            csv_content.push(data_record.map(csv_format).join(','));
        });

        // トレーラー
        csv_content.push(getTrailerRecord(applies).map(csv_format).join(','));

        // エンド
        csv_content.push(getEndRecord().map(csv_format).join(','));

        const new_line = '\r\n';
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

    function getDataRecords(kintone_records) {
        return kintone_records.map((kintone_record) => {
            const bank_code_to = ('0000' + kintone_record[fieldBankCode_APPLY]['value']).slice(-4);
            const bank_name_kana = zenkakuToHankaku(bank_info[bank_code_to]['kana']);
            const bank_name_to = adjustLength(bank_name_kana, 15);
            const branch_code_to = ('000' + kintone_record[fieldBranchCode_APPLY]['value']).slice(-3);
            const branch_name_kana = zenkakuToHankaku(bank_info[bank_code_to]['branches'][branch_code_to]['kana']);
            const branch_name_to = adjustLength(branch_name_kana, 15);
            const deposit_to = (kintone_record[fieldDepositType_APPLY]['value'] === '普通')
                ? '1'
                : '2';
            const account_number_to = kintone_record[fieldAccountNumber_APPLY]['value'];
            const account_name_to = (zenkakuToHankaku(kintone_record[fieldAccountName_APPLY]['value']) + ' '.repeat(30)).slice(0, 30);
            const amount_of_money = kintone_record[fieldTransferAmount_APPLY]['value'];

            return [
                '2',               //データ区分：データレコード
                bank_code_to,      //銀行コード
                bank_name_to,      //銀行名ｶﾅ
                branch_code_to,    //支店コード
                branch_name_to,    //支店名ｶﾅ
                ' '.repeat(4),     //手形交換所番号：不使用、スペース埋め
                deposit_to,        //口座種別
                account_number_to, //口座番号
                account_name_to,   //受取人名ｶﾅ
                amount_of_money,   //振込金額
                '0',               //新規コード：その他
                '',                //顧客コード1：不使用
                '',                //顧客コード2：不使用
                ' ',               //振込指定区分：スペース
                ''                 //識別コード：不使用
            ];
        });
    }

    function getTrailerRecord(kintone_records) {
        let total_amount = 0;
        kintone_records.forEach((kintone_record) => {
            total_amount += Number(kintone_record[fieldTransferAmount_APPLY]['value']);
        });

        return [
            '8',                    //データ区分：トレーラーレコード
            kintone_records.length, //合計件数
            total_amount            //合計金額
        ];
    }

    function getEndRecord() {
        return [
            '9' //データ区分：エンドレコード
        ];
    }

    // CSVをファイルとしてローカルにダウンロードする。
    function downloadFile(csv_data, file_name) {
        console.log('downloading...');
        console.log(csv_data);

        // 1文字ずつ格納
        const unicode_list = [];
        for (let i = 0; i < csv_data.length; i++) {
            unicode_list.push(csv_data.charCodeAt(i));
        }

        // 1文字ずつSJISに変換する
        const sjis_code_list = Encoding.convert(unicode_list, 'sjis', 'unicode');
        const uint8_list = new Uint8Array(sjis_code_list);
        const write_data = new Blob([uint8_list], { type: 'text/csv' });

        // 保存
        saveAs(write_data, file_name);
    }

    function updateToDone(kintone_records) {
        console.log('出力を終えたレコードの状態を出力済みに更新する');

        const request_body = {
            'app': APP_ID_APPLY,
            'records': kintone_records.map((record) => {
                return {
                    'id': record[fieldRecordId_APPLY]['value'],
                    'record': {
                        [fieldStatus_APPLY]: {
                            'value': statusDone_APPLY
                        }
                    }
                };
            })
        };

        return new kintone.Promise((resolve, reject) => {
            kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', request_body
            , (resp) => {
                resolve();
            }, (err) => {
                reject(err);
            });
        });
    }

    // 全角カナを半角カナに変換する。全角カナ以外の入力はそのまま返す。
    function zenkakuToHankaku(input_string){
        const zenkaku_array = [
            'ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ'
            ,'サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト'
            ,'ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ'
            ,'マ','ミ','ム','メ','モ','ヤ','ヰ','ユ','ヱ','ヨ'
            ,'ラ','リ','ル','レ','ロ','ワ','ヲ','ン'
            ,'ガ','ギ','グ','ゲ','ゴ','ザ','ジ','ズ','ゼ','ゾ'
            ,'ダ','ヂ','ヅ','デ','ド','バ','ビ','ブ','ベ','ボ'
            ,'パ','ピ','プ','ペ','ポ'
            ,'ァ','ィ','ゥ','ェ','ォ','ャ','ュ','ョ','ッ'
            ,'゛','°','、','。','「','」','ー','・','（','）','￥','／'
            ,'－','‐','―','─','━',
        ];

        const hankaku_array = [
            'ｱ','ｲ','ｳ','ｴ','ｵ','ｶ','ｷ','ｸ','ｹ','ｺ'
            ,'ｻ','ｼ','ｽ','ｾ','ｿ','ﾀ','ﾁ','ﾂ','ﾃ','ﾄ'
            ,'ﾅ','ﾆ','ﾇ','ﾈ','ﾉ','ﾊ','ﾋ','ﾌ','ﾍ','ﾎ'
            ,'ﾏ','ﾐ','ﾑ','ﾒ','ﾓ','ﾔ','ｲ','ﾕ','ｴ','ﾖ'
            ,'ﾗ','ﾘ','ﾙ','ﾚ','ﾛ','ﾜ','ｦ','ﾝ'
            ,'ｶﾞ','ｷﾞ','ｸﾞ','ｹﾞ','ｺﾞ','ｻﾞ','ｼﾞ','ｽﾞ','ｾﾞ','ｿﾞ'
            ,'ﾀﾞ','ﾁﾞ','ﾂﾞ','ﾃﾞ','ﾄﾞ','ﾊﾞ','ﾋﾞ','ﾌﾞ','ﾍﾞ','ﾎﾞ'
            ,'ﾊﾟ','ﾋﾟ','ﾌﾟ','ﾍﾟ','ﾎﾟ'
            ,'ｧ','ｨ','ｩ','ｪ','ｫ','ｬ','ｭ','ｮ','ｯ'
            ,'ﾞ','ﾟ',',','.','｢','｣','-',' ','(',')','\\','/' //中黒は使用不可能なのでスペースにする
            ,'-','-','-','-','-'
        ];

        let converted = "";

        for (let i = 0; i < input_string.length; i++){
            let input_char = input_string.charAt(i);
            const zen_index = zenkaku_array.indexOf(input_char);
            // 全角カナの配列の中に見つからなければそのまま返す
            if(zen_index >= 0){
                input_char = hankaku_array[zen_index];
            }
            converted += input_char;
        }

        return converted;
    }

    // 全角文字を2、半角文字を1として文字数を計算する
    function getBytes(str) {
        // 半角カタカナを、半角文字の代表としてアルファベットKに置換
        str = str.replace(/[｡-ﾟ]/g, 'K');
        let hex = '';
        for (let i = 0; i < str.length; i++) {
            // 16進数の文字コードに変換することで、半角英数文字は半角2文字に、全角文字は半角4文字に変換
            hex += str.charCodeAt(i).toString(16);
        }
        // 2文字になった半角と4文字になった全角の文字列のlengthを2で割ることで文字数を算出
        return hex.length / 2;
    }

    // 全角文字を2、半角文字を1として、元の文字列の右に指定文字数まで半角空白を追加する。元々指定文字数より多かったら右から削る。
    function adjustLength(str, num) {
        const str_byte_length = getBytes(str);
        let trimmed = str;

        if (num - str_byte_length > 0) {
            for (let i = 0; i < num - str_byte_length; i++) {
                trimmed += ' ';
            }
        }
        else {
            while (getBytes(trimmed) > num) {
                trimmed = trimmed.slice(0, -1);
            }
        }

        return trimmed;
    }
})();
