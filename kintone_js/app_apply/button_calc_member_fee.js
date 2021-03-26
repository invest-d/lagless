/*
    Version 1
    申込レコードについて、「会費等の差し引き額」フィールドを自動計算するボタンとして実装。
    https://takadaid.backlog.com/view/LAGLESS-244
*/

"use strict";

import * as logics from "./logics_calc_member_fee";

(function() {

    const button_name = "calcMemberFee";
    const button_title = "協力会費を一括計算";

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
        const generate_ok = logics.confirmBeforeExec();

        if (!generate_ok) {
            alert("処理は中断されました。");
            return;
        }

        document.getElementById(button_name).innerText = "処理中...";

        const target_records = await logics.getTargetRecords()
            .catch((err) => {
                console.error(err);
                alert("申込レコード取得時にエラーが発生しました。システム管理者に連絡してください。");
                return;
            });
        if (!target_records) {
            return;
        }

        if (target_records.length === 0) {
            alert("対象となるレコードはありませんでした。\n"
                + "処理を終了します。");
            return;
        }

        const {calced_records, failed_records} = logics.calcMemberFees(target_records);

        const result = await logics.updateRecords(calced_records)
            .catch((err) => {
                console.error(err);
                alert("申込レコード更新時にエラーが発生しました。システム管理者に連絡してください。");
                return;
            });

        if (result) {
            alert(`${result.records.length}件の申込レコードの協力会費を自動計算しました。`);
        }

        if (failed_records.length > 0) {
            const error_info = failed_records.map((r) => `レコード番号: ${r.record_id}, 工務店ID: ${r.constructor_id}`).join("\n");
            alert(`下記のレコードは協力会費を自動計算できません。手動で入力してください。\n\n${error_info}`);
        }

        document.getElementById(button_name).innerText = button_title;
    }

})();
