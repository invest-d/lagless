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

import * as logics from "./logics_output_csv";

(function() {
    "use strict";
    const fieldStatus_APPLY = "状態";

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

    const createButton = () => {
        const button = document.createElement("button");
        button.id = buttonName;
        button.innerText = "あおぞら向け総合振込データをダウンロード";
        button.addEventListener("click", clickButton);
        return button;
    };

    // CSV出力ボタンクリック時の処理を定義
    const clickButton = async () => {
        const do_download = logics.confirmBeforeExec();
        if (!do_download) {
            alert("処理は中断されました。");
            return;
        }

        const payment_date = logics.inputPaymentDate();
        const pattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!pattern.test(payment_date)) {
            alert(`入力形式が正しくありませんでした。\n入力した値：${payment_date}`);
            return;
        }

        const target_conditions = logics.getTargetConditions();
        alert(`${fieldStatus_APPLY}フィールドが${target_conditions.join(", ")}のレコードを対象に処理します。`);

        alert(`本機能はテスト運用中です。従って、工務店が${Object.values(logics.AVAILABLE_CONSTRUCTORS).map((c) => c.NAME).join(", ")}の申込レコードのみを対象とします。`);

        const account = "ID"; // GMOあおぞらから振込できるのはIDの口座のみ
        const target = await logics.getKintoneRecords(account, payment_date, target_conditions)
            .catch((err) => {
                alert(`支払元口座：${account}のデータを取得中にエラーが発生しました。\n${err.message}`);
                throw new Error(err);
            });

        if (target && target.records.length === 0) {
            alert(`支払元口座：${account}の支払い対象はありませんでした。`);
            return;
        }

        try {
            const csv_data = logics.generateCsvData(target.records);
            const sjis_list = logics.encodeToSjis(csv_data);

            const file_name = `支払日${payment_date}ぶんの振込データ（振込元：${account}）.csv`;
            logics.downloadFile(sjis_list, file_name);

            await logics.updateToDone(target.records);
            alert("振込データのダウンロードを完了しました。");
            alert("ページを更新します。");
            window.location.reload();
        } catch (err) {
            alert (err);
        }
    };
})();
