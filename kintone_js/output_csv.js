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
            var requester_code   = '2648852000';
            var requester_name   = ('ｲﾝﾍﾞｽﾄﾃﾞｻﾞｲﾝ(ｶ' + ' '.repeat(40)).slice(0, 40);
            var smbc_bank_code   = '0009';
            var smbc_bank_name   = ('ﾐﾂｲｽﾐﾄﾓｷﾞﾝｺｳ' + ' '.repeat(15)).slice(0, 15);
            var branch_code_from = '219'; // 振込元口座の支店コード
            var branch_name_from = 'ｶﾝﾀﾞ' + ' '.repeat(15); // 振込元口座の支店コード
            var ordinary_deposit = '1';
            var account_number_from = '3391195';

            // ラグレス合同会社による振込
            // var requester_code   = '3648579000';
            // var requester_name   = ('ﾗｸﾞﾚｽ (ﾄﾞ,ﾏｽﾀ-ｺｳｻﾞ' + ' '.repeat(40)).slice(0, 40);
            // var smbc_bank_code   = '0009';
            // var smbc_bank_name   = ('ﾐﾂｲｽﾐﾄﾓｷﾞﾝｺｳ' + ' '.repeat(15)).slice(0, 15);
            // var branch_code_from = '219'; // 振込元口座の支店コード
            // var branch_name_from = 'ｶﾝﾀﾞ' + ' '.repeat(15); // 振込元口座の支店コード
            // var ordinary_deposit = '1';
            // var account_number_from = '3409134';

            var content = [];

            // ヘッダーを取得
            var header = [
                '1',
                '21',
                '0',
                requester_code,
                requester_name,
                mm + dd,
                smbc_bank_code,
                smbc_bank_name,
                branch_code_from,
                branch_name_from,
                ordinary_deposit,
                account_number_from
            ];
            content.push(header.map(csvFormat).join(','));

            // レコード一覧から条件に合うレコードのみを取得
            var total_amount_of_money = 0;
            var record_num = 0;
            for (var i = 0; i < target_records.length; i++) {
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
                    total_amount_of_money += Number(amount_of_money);

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
                    content.push(add_record.map(csvFormat).join(','));
                    record_num++;
                }
            }

            // トレーラーレコードを取得
            var trailer = [
                '8',
                record_num,
                total_amount_of_money
            ]
            content.push(trailer.map(csvFormat).join(','));

            // エンドレコードを取得
            var end = [
                '9'
            ]
            content.push(end.map(csvFormat).join(','));

            return content.join(new_line);
            var new_line = '\r\n';
        }

        // CSVをファイルとしてローカルにダウンロードする
        function downloadFile(csv, target_date) {
            var filename = '支払日' + target_date + 'ぶんの振込データ' + getTimeStamp() + '.csv';

            //SJISに変換する
            const unicodeList = [];
            for (let i = 0; i < csv.length; i += 1) {
                unicodeList.push(csv.charCodeAt(i));
            }
            const shiftJisCodeList = Encoding.convert(unicodeList, 'sjis', 'unicode');
            const uInt8List = new Uint8Array(shiftJisCodeList);
            const writeData = new Blob([uInt8List], { type: 'text/csv' });

            saveAs(writeData, filename);
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
