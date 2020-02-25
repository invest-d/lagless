/*
    Version 1
    LAGLESS2020開発テーブルにコントロールを二つ追加する。
        - 振込日を指定するテキストボックス
        - CSVダウンロードを行うボタン
    ボタンをクリックしたとき、
    申し込みフォームから送信されたレコードのうち下記の条件を満たすレコードについて、
    全銀形式に整形した上でCSVファイルに書き出し、ローカルに保存する。
        - 支払日フィールドの値が、テキストボックスで指定した日付に一致する
        - 状態フィールドの値が、振込データ作成待ちに一致する

        教科書
        https://developer.cybozu.io/hc/ja/articles/201755040-%E7%AC%AC1%E5%9B%9E-kintone-javascript-API%E3%81%AE%E3%82%A4%E3%82%B8%E3%82%8A%E3%81%8B%E3%81%9F
*/

(function() {
    "use strict";

    // レコード一覧を表示後にCSV出力ボタンを描画する
    kintone.events.on('app.record.index.show', function(event) {
        // コントロールの重複作成防止チェック
        if (document.getElementById('outputCsvButton') !== null) {
            return;
        }

        // 関数定義 ここから

        // CSV作成時に使うライブラリを読み込む
        function importEncodingLibrary() {
            var head = document.getElementsByTagName('head');

            var script_encoding = document.createElement('script');
            script_encoding.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/encoding-japanese/1.0.30/encoding.min.js');
            script_encoding.setAttribute('type', 'text/javascript');
            document.head.appendChild(script_encoding);

            var script_filesaver = document.createElement('script');
            script_filesaver.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js');
            script_filesaver.setAttribute('type', 'text/javascript');
            document.head.appendChild(script_filesaver);
        }

        var target_date_id = 'paymentDay';
        // 日付入力欄を生成
        function getInputPaymentDay() {
            var paymentDay = document.createElement('input');
            paymentDay.id = target_date_id;
            paymentDay.setAttribute('type', 'text');
            var today_date = new Date();
            var year = today_date.getFullYear();
            var month = ('0' + (today_date.getMonth() + 1)).slice(-2);
            var day = ('0' + today_date.getDate()).slice(-2);
            var today = year + '-' + month + '-' + day;
            paymentDay.setAttribute('value', today);
            return paymentDay;
        }

        // CSV出力ボタンを生成
        function getButtonOutputCsv() {
            var outputCsv = document.createElement('button');
            outputCsv.id = 'outputCsv';
            outputCsv.innerText = 'SMBC向け振込データをダウンロードする';
            outputCsv.addEventListener('click', clickOutputCsv);
            return outputCsv;
        }

        // CSV出力ボタンクリック時の処理を定義
        function clickOutputCsv() {
            // https://www.alloneslife-0to1work.jp/all/kintone_csv
            var target_records = event.records;
            var target_date = document.getElementById(target_date_id).value;
            var csv_content = getCsvContent(target_records, target_date);
            downloadFile(csv_content, target_date);
            console.log('Download completed.');
        }

        // 全角カナを半角カナに変換する。全角カナ以外の入力はそのまま返す。
        function zenkakuToHankaku(input_string){
            let zenkaku_array = new Array(
                'ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ'
                ,'サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト'
                ,'ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ'
                ,'マ','ミ','ム','メ','モ','ヤ','ヰ','ユ','ヱ','ヨ'
                ,'ラ','リ','ル','レ','ロ','ワ','ヲ','ン'
                ,'ガ','ギ','グ','ゲ','ゴ','ザ','ジ','ズ','ゼ','ゾ'
                ,'ダ','ヂ','ヅ','デ','ド','バ','ビ','ブ','ベ','ボ'
                ,'パ','ピ','プ','ペ','ポ'
                ,'ァ','ィ','ゥ','ェ','ォ','ャ','ュ','ョ','ッ'
                ,'゛','°','、','。','「','」','ー','・'
            );

            let hankaku_array = new Array(
                'ｱ','ｲ','ｳ','ｴ','ｵ','ｶ','ｷ','ｸ','ｹ','ｺ'
                ,'ｻ','ｼ','ｽ','ｾ','ｿ','ﾀ','ﾁ','ﾂ','ﾃ','ﾄ'
                ,'ﾅ','ﾆ','ﾇ','ﾈ','ﾉ','ﾊ','ﾋ','ﾌ','ﾍ','ﾎ'
                ,'ﾏ','ﾐ','ﾑ','ﾒ','ﾓ','ﾔ','ｲ','ﾕ','ｴ','ﾖ'
                ,'ﾗ','ﾘ','ﾙ','ﾚ','ﾛ','ﾜ','ｦ','ﾝ'
                ,'ｶﾞ','ｷﾞ','ｸﾞ','ｹﾞ','ｺﾞ','ｻﾞ','ｼﾞ','ｽﾞ','ｾﾞ','ｿﾞ'
                ,'ﾀﾞ','ﾁﾞ','ﾂﾞ','ﾃﾞ','ﾄﾞ','ﾊﾞ','ﾋﾞ','ﾌﾞ','ﾍﾞ','ﾎﾞ'
                ,'ﾊﾟ','ﾋﾟ','ﾌﾟ','ﾍﾟ','ﾎﾟ'
                ,'ｧ','ｨ','ｩ','ｪ','ｫ','ｬ','ｭ','ｮ','ｯ'
                ,'ﾞ','ﾟ','､','｡','｢','｣','ｰ','･'
            );

            let ret_string = "";

            for (let i=0;i<input_string.length;i++){
                let input_char = input_string.charAt(i);
                let zenindex = zenkaku_array.indexOf(input_char);
                // 全角カナの配列の中に見つからなければそのまま返す
                if(zenindex >= 0){
                    input_char = hankaku_array[zenindex];
                }
                ret_string += input_char;
            }

            return ret_string;
        }

        // レコード一覧から、条件に沿ったレコードを選択し、CSVファイルの中身を生成する
        function getCsvContent(target_records, target_date) {
            const csvFormat = (col => `"${col}"`);

            // target_dateは'YYYY-MM-DD'の書式を想定
            var mm = target_date.split('-')[1];
            var dd = target_date.split('-')[2];

            // インベストデザイン（カによる振込
            var requester_code_invest      = '2648852000';
            var requester_name_invest      = ('ｲﾝﾍﾞｽﾄﾃﾞｻﾞｲﾝ(ｶ' + ' '.repeat(40)).slice(0, 40);
            var smbc_bank_code_invest      = '0009';
            var smbc_bank_name_invest      = ('ﾐﾂｲｽﾐﾄﾓｷﾞﾝｺｳ' + ' '.repeat(15)).slice(0, 15);
            var branch_code_from_invest    = '219'; // 振込元口座の支店コード
            var branch_name_from_invest    = 'ｶﾝﾀﾞ' + ' '.repeat(15); // 振込元口座の支店コード
            var ordinary_deposit_invest    = '1';
            var account_number_from_invest = '3391195';

            // ラグレス合同会社による振込
            var requester_code_lagless      = '3648579000';
            var requester_name_lagless      = ('ﾗｸﾞﾚｽ (ﾄﾞ,ﾏｽﾀ-ｺｳｻﾞ' + ' '.repeat(40)).slice(0, 40);
            var smbc_bank_code_lagless      = '0009';
            var smbc_bank_name_lagless      = ('ﾐﾂｲｽﾐﾄﾓｷﾞﾝｺｳ' + ' '.repeat(15)).slice(0, 15);
            var branch_code_from_lagless    = '219'; // 振込元口座の支店コード
            var branch_name_from_lagless    = 'ｶﾝﾀﾞ' + ' '.repeat(15); // 振込元口座の支店コード
            var ordinary_deposit_lagless    = '1';
            var account_number_from_lagless = '3409134';

            var content_invest = [];
            var content_lagless = [];

            // ヘッダーを取得
            var header_invest = [
                '1',
                '21',
                '0',
                requester_code_invest,
                requester_name_invest,
                mm + dd,
                smbc_bank_code_invest,
                smbc_bank_name_invest,
                branch_code_from_invest,
                branch_name_from_invest,
                ordinary_deposit_invest,
                account_number_from_invest
            ];
            content_invest.push(header_invest.map(csvFormat).join(','));

            var header_lagless = [
                '1',
                '21',
                '0',
                requester_code_lagless,
                requester_name_lagless,
                mm + dd,
                smbc_bank_code_lagless,
                smbc_bank_name_lagless,
                branch_code_from_lagless,
                branch_name_from_lagless,
                ordinary_deposit_lagless,
                account_number_from_lagless
            ];
            content_lagless.push(header_lagless.map(csvFormat).join(','));

            var total_amount_of_money_invest = 0;
            var record_num_invest = 0;
            var total_amount_of_money_lagless = 0;
            var record_num_lagless = 0;
            // レコード一覧から条件に合うレコードのみを取得
            for (var i = 0; i < target_records.length; i++) {
                console.log(target_records[i]['paymentDate']['value']);
                if (target_records[i]['paymentDate']['value'] === target_date) {
                    var bank_code_to = target_records[i]['bankCode']['value'];
                    var bank_name_to = ' '.repeat(15);
                    var branch_code_to = target_records[i]['branchCode']['value'];
                    var branch_name_to = ' '.repeat(15);
                    var deposit_to = (target_records[i]['deposit']['value'] === '普通')
                    ? '1'
                    : '2';
                    var account_number_to = target_records[i]['accountNumber']['value'];
                    var account_name_to = (zenkakuToHankaku(target_records[i]['accountName']['value']) + ' '.repeat(30)).slice(0, 30);
                    var amount_of_money = target_records[i]['totalReceivables']['value'];

                    //CSVファイルにkintone上記で取得したデータを記入していく
                    var add_record = [
                        '2',
                        bank_code_to,
                        bank_name_to,
                        branch_code_to,
                        branch_name_to,
                        ' '.repeat(4),
                        deposit_to,
                        account_number_to,
                        account_name_to,
                        amount_of_money,
                        '0',
                        '',
                        ' ',
                        ''
                    ]


                    // 支払元口座によって場合分け
                    if (target_records[i]['paymentAccount']['value'] === 'ID') {
                        content_invest.push(add_record.map(csvFormat).join(','));
                        total_amount_of_money_invest += Number(amount_of_money);
                        record_num_invest++;
                    } else {
                        content_lagless.push(add_record.map(csvFormat).join(','));
                        total_amount_of_money_lagless += Number(amount_of_money);
                        record_num_lagless++;
                    }
                }
            }

            // トレーラーレコードを取得
            var trailer_invest = [
                '8',
                record_num_invest,
                total_amount_of_money_invest
            ]
            content_invest.push(trailer_invest.map(csvFormat).join(','));

            var trailer_lagless = [
                '8',
                record_num_lagless,
                total_amount_of_money_lagless
            ]
            content_lagless.push(trailer_lagless.map(csvFormat).join(','));

            // エンドレコードを取得
            var end = [
                '9'
            ]
            content_invest.push(end.map(csvFormat).join(','));
            content_lagless.push(end.map(csvFormat).join(','));

            var new_line = '\r\n';
            // 返り値は要素数2の配列。1つの振込元が1つの要素に対応。振込先が存在しなくても要素数は2固定。
            var ret = [];
            ret.push(content_invest.join(new_line));
            ret.push(content_lagless.join(new_line));
            return ret;
        }

        // CSVをファイルとしてローカルにダウンロードする。振込元口座別にCSVファイルを作成。
        function downloadFile(csv, target_date) {
            console.log(csv);
            for (var i = 0; i < csv.length; i++) {
                // 変数csvから、振込元の口座がどちらかを取得する
                var requester_code = csv[i].split(',')[3];
                var account_from = '';
                if (requester_code.match('2648852000')) {
                    account_from = 'ID';
                } else {
                    account_from = 'LAGLESS';
                }
                var filename = '支払日' + target_date + 'ぶんの振込データ（振込元：' + account_from + '）.csv';

                //SJISに変換する
                const unicodeList = [];
                for (let char_index = 0; char_index < csv[i].length; char_index += 1) {
                    unicodeList.push(csv[i].charCodeAt(char_index));
                }
                const shiftJisCodeList = Encoding.convert(unicodeList, 'sjis', 'unicode');
                const uInt8List = new Uint8Array(shiftJisCodeList);
                const writeData = new Blob([uInt8List], { type: 'text/csv' });

                saveAs(writeData, filename);
            }
        }

        // ファイル名に付与するタイムスタンプを取得する
        function getTimeStamp() {
            var d = new Date();
            var YYYY = d.getFullYear();
            var MM = (d.getMonth() + 1);
            var DD = d.getDate();
            var hh = d.getHours();
            var mm = d.getMinutes();
            if (MM < 10) { MM = '0' + MM; }
            if (DD < 10) { DD = '0' + DD; }
            if (hh < 10) { hh = '0' + hh; }
            else if (mm < 10) { mm = '0' + mm; }
            String();
            return '' + YYYY + MM + DD + hh + mm;
        }

        // 関数定義 ここまで

        importEncodingLibrary();

        // 日付入力欄をレコード一覧の上部に設置
        var input = getInputPaymentDay();
        kintone.app.getHeaderMenuSpaceElement().appendChild(input);

        // 出力ボタンを設置
        var button = getButtonOutputCsv();
        kintone.app.getHeaderMenuSpaceElement().appendChild(button);
    });
})();
