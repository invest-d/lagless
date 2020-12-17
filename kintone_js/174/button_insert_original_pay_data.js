/*
    Version 1
    請求データを請求IDごとにまとめて、kintone申込アプリにレコードを作成する。
*/

import { schema_174 } from "./schema";
import * as logic from "./insert_original_pay_data_dandori";

const button_id = "insertCollect";
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

    try {
        const constructor = await logic.getConstructor(constructor_id);

        const targets = await logic.getTargetRecords()
            .catch((err) => {
                console.error(err);
                throw new Error("請求データレコードの取得中にエラーが発生しました。");
            });

        if (targets.length === 0) {
            alert(`${schema_174.fields.properties.status.label}が${schema_174.fields.properties.status.options.未処理.label}のレコードは存在しませんでした。`);
            return;
        }

        const aggregated_records = logic.aggregateCsvData(targets);

        const convert_result = await logic.convert(aggregated_records, constructor);

        const inserted_ids = await logic.insertApplyRecords(convert_result.new_apply_records)
            .catch((err) => {
                console.error(err);
                throw new Error("申込アプリへのレコード挿入中にエラーが発生しました。");
            });

        // FIXME: このままだと、aggregateCsvDataで削除されたレコードが未処理のままになる
        await Promise.all([
            logic.updateToDone(convert_result.insert_target_invoices),
            logic.updateToIgnored(convert_result.ignored_invoices)
        ]);

        alert(`${inserted_ids.length}件 の請求書を申込アプリに登録しました。\n申込アプリの各レコードを確認し、協力会社ID（と口座情報）が入っていない場合は手動で入力してください。`);
        alert("ページを更新します。");
        window.location.reload();
    } catch(err) {
        console.error(err);
        alert(err);
    }
}
