/*
    Version 1
    請求データを請求IDごとにまとめて、kintone申込アプリにレコードを作成する。
*/

import { schema_174 } from "./schema";
import * as logic from "./insert_original_pay_data_dandori";

const button_id = "insertOriginalPayRecords";
export const needShowButton = () => {
    // 増殖バグ防止
    return document.getElementById(button_id) === null;
};

export const createButton = () => {
    const button = document.createElement("button");
    button.id = button_id;
    button.innerText = "請求データから通常払い用レコードを作成";
    button.addEventListener("click", clickButton);
    return button;
};

async function clickButton() {
    const clicked_ok = logic.confirmBeforeExec();
    if (!clicked_ok) {
        alert("処理は中断されました。");
        return;
    }

    const constructor_id = prompt("工務店IDを入力してください", "100");

    const text_ready = this.innerText;
    this.innerText = "作成中...";

    try {
        const constructor = await logic.getConstructor(constructor_id);

        const target_invoices = await logic.getTargetRecords()
            .catch((err) => {
                console.error(err);
                throw new Error("請求データレコードの取得中にエラーが発生しました。");
            });

        if (target_invoices.length === 0) {
            alert(`${schema_174.fields.properties.status.label}が${schema_174.fields.properties.status.options.未処理.label}のレコードは存在しませんでした。`);
            return;
        }

        const invoice_groups = logic.groupDandoriInvoices(target_invoices);

        const { original_pay_groups, using_factoring_groups } = await logic.divideInvoices(invoice_groups, constructor.id);

        const new_apply_records = await logic.convertToApplyRecord(original_pay_groups, constructor);

        const inserted_ids = await logic.insertApplyRecords(new_apply_records)
            .catch((err) => {
                console.error(err);
                throw new Error("申込アプリへのレコード挿入中にエラーが発生しました。");
            });

        await Promise.all([
            logic.updateToDone(original_pay_groups),
            logic.updateToIgnored(using_factoring_groups)
        ]);

        alert(`${inserted_ids.length}件 の請求書を申込アプリに登録しました。\n申込アプリの各レコードを確認し、協力会社ID（と口座情報）が入っていない場合は手動で入力してください。`);
        alert("ページを更新します。");

        this.innerText = text_ready;
        window.location.reload();
    } catch(err) {
        this.innerText = text_ready;
        console.error(err);
        alert(err);
    }
}
