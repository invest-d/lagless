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

    // レコード一覧を表示後にボタンを描画する
    kintone.events.on('app.record.index.show', function(event) {
        if (document.getElementById('outputCsvButton') !== null) {
            return;
        }
        // ボタンを作成
        var outputCsvButton = document.createElement('button');
        outputCsvButton.id = 'outputCsvButton';
        outputCsvButton.innerText = 'SMBC向け振込データをダウンロードする';
        outputCsvButton.onclick = function() {
            window.alert('まだ動きません');
        }
        // レコード一覧の上部に設置
        kintone.app.getHeaderMenuSpaceElement().appendChild(outputCsvButton);
    });
})();