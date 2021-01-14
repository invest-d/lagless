/*
    Version 5
    ボタン定義のファイルとロジック定義のファイルを分離

    Version 4
    工務店が軽バン.comの場合に専用の明細内容へ変更する処理を追加

    Version 3.1
    初回申込に対する振込手数料率半額CPに対応。

    Version 3
    支払予定明細のメール文面を作成する機能と、作成されたメール文面を送信する機能を別ファイルに分離した。
    本ファイルはメール文面を作成する機能だけについて引き続き責務を負う。
    上述機能の分離先ファイルについてはGitのコミットログを参照。

    また、申込レコードの状態フィールドを新規追加。
    工務店確認済→（文面作成・自動更新）→支払予定明細確認中→（目視確認・手動更新）→支払予定明細送信前確認完了
    という流れを踏む。
    そのため、以前のバージョンとは次のような違いが生じている。
    - 「送信日時」が記入済みのレコードは文面作成対象外としていたが、本バージョンからは「送信日時」に関わらず「状態」フィールドが工務店確認済かどうかだけを見るようになった。
    - 文面を既に作成しているレコードは文面作成対象外としていたが、本バージョンからは文面の作成状態に関わらず「状態」フィールドが工務店確認済かどうかだけを見るようになった。

    Version 2.1
    支払予定明細送信対象のレコード条件を変更。
    旧: 状態フィールドが「ID確認済」
    新: 状態フィールドが「工務店確認済」

    Version 2
    申し込みレコードが遅払いの場合に対応。
    文面に出力する金額を変更する他、手数料の±符号の切り替えも行う。

    Version 1.1
    支払明細書を作成したあとに続けてメール送信のリクエストも行う。
    メール送信の処理自体はherokuで行っている。

    Version 1
    LAGLESS2020開発テーブルにコントロールを一つ追加する。
        - 支払明細書一括作成ボタン
    ボタンをクリックしたとき、申込アプリのレコードの中で、
    状態が「ID確認済」かつ、送信日時と明細書本文がまだブランクのレコードについて、
    明細書テンプレートを元に支払明細書のメール文面を作成し、
    当該フィールドにその本文を保存する。
*/

import * as detail_logics from "./logics_create_payment_detail";

(function() {
    "use strict";

    const button_name = "createPaymentDetail";
    const button_title = "支払予定明細の本文を一括作成";
    const nextActionButtonTitle = "支払予定明細一括送信";

    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.index.show", (event) => {
        // コントロールの重複作成防止チェック
        if (document.getElementById(button_name) !== null) {
            return;
        }

        const button = createButton();
        kintone.app.getHeaderMenuSpaceElement().appendChild(button);
    });

    function createButton() {
        const button = document.createElement("button");
        button.id = button_name;
        button.innerText = button_title;
        button.addEventListener("click", clickButton);
        return button;
    }

    async function clickButton() {
        const generate_ok = detail_logics.confirmBeforeExec();

        if (!generate_ok) {
            alert("処理は中断されました。");
            return;
        }

        const ready_to_generate = await detail_logics.getGenerateTarget()
            .catch((err) => {
                console.error(err);
                alert("申込レコード取得時にエラーが発生しました。システム管理者に連絡してください。\n本文は作成されていません。");
                return;
            });
        if (!ready_to_generate) {
            return;
        }

        if (ready_to_generate.records.length === 0) {
            alert(`支払予定明細本文の作成対象となるレコード（${detail_logics.fieldStatus_APPLY}：${detail_logics.statusReady_APPLY}）のレコードはありませんでした。\n`
            + "処理を終了します。");
            return;
        }

        // 工務店マスタの「遅払い日数」フィールドが必要なので取得する
        const constructors = await detail_logics.getConstructors()
            .catch((err) => {
                console.error(err);
                alert("工務店レコード取得時にエラーが発生しました。本文は作成されていません。処理を終了します。");
                return;
            });
        if (!constructors) {
            return;
        }

        // 申込レコードに遅払い日数フィールドを紐付ける
        for (const apply of ready_to_generate.records) {
            const constructor = constructors.records.find((r) => r["id"]["value"] === apply[detail_logics.fieldConstructorID_APPLY]["value"]);

            if (!constructor) {
                const no_constructor = "申込レコードに対応する工務店レコードが見つかりませんでした。申込レコードに記入している工務店IDが正しいかどうか確認してください。\n"
                + "この申込レコードの処理をスキップし、残りのレコードについて処理を続けます。\n\n"
                + `申込レコード番号: ${apply[detail_logics.fieldRecordId_COMMON]["value"]}, 協力会社名: ${apply[detail_logics.fieldCustomerCompanyName_APPLY]["value"]}, 工務店ID: ${apply[detail_logics.fieldConstructorID_APPLY]["value"]}`;
                alert(no_constructor);
                return;
            }

            apply[detail_logics.fieldDaysLater_APPLY] = { "value": constructor[detail_logics.fieldDaysLater_APPLY]["value"] };
        }

        // 支払明細を各レコードにセット
        let records_with_detail = [];
        try {
            records_with_detail = await detail_logics.attachDetail(ready_to_generate.records);
        } catch (err) {
            alert(err.message);
            return;
        }

        if (records_with_detail.length !== 0) {
            const result = await detail_logics.updateRecords(records_with_detail)
                .catch((err) => {
                    console.error(err);
                    alert("レコードの更新中にエラーが発生しました。本文は作成されていません。");
                    return;
                });
            if (!result) {
                return;
            }

            const completed = `支払予定明細書を作成し、レコードの状態を「${detail_logics.statusConfirming_APPLY}」に更新しました。\n`
            + "各レコードの文面を目視で確認してください。\n\n"
            + `問題なし→レコードの状態を「${detail_logics.statusConfirmed_APPLY}」へと手動で更新し、「${nextActionButtonTitle}」ボタンをクリックしてください。\n`
            + "目視確認の結果、文面に修正が必要な場合はシステム担当者に相談してください。";
            // 修正が必要な場合、手動で修正するか、自動で再生成するかで操作が分岐する。金額等の修正の場合は自動で再生成することを推奨。宛名などの修正は手動を推奨。
            // 手動で修正：レコードに保存されている文面を手動で修正して、レコードの状態を detail_logics.statusConfirmed_APPLY に更新すればOK
            // 自動で再生成：レコードの状態を statusReady_APPLY に手動で戻してから、この支払予定明細書一括作成ボタンをもう一度クリックする
            alert(completed);
        }

        alert("処理が終了しました。ページを更新します。");
        document.location.reload();
    }
})();
