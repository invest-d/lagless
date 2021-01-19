/*
    Version 1
    振込先口座がまだkintone内に未登録の協力会社をリストアップし、
    協力会社マスタに取り込めるcsvファイルをダウンロードする
*/

import * as logic from "./insert_original_pay_data_dandori";

const button_id = "listingKyoryoku";
export const needShowButton = () => {
    // 増殖バグ防止
    return document.getElementById(button_id) === null;
};

export const createButton = () => {
    const button = document.createElement("button");
    button.id = button_id;
    button.innerText = "口座情報が未登録の協力会社一覧をダウンロード";
    button.addEventListener("click", clickButton);
    return button;
};

async function clickButton() {
    const constructor_id = prompt("工務店IDを入力してください", "100");

    try {
        // 請求データから協力会社の名前一覧を取得
        const targets = await logic.getTargetRecords();
        const invoice_kyoryoku_list = logic.getInvoiceKyoryokuList(targets);

        const master = await logic.getKyoryokuMaster(constructor_id);

        // 協力会社マスタにレコードが存在するものの、ダンドリワークIDが登録されていない協力会社があった場合、ダンドリワークIDを上書きする
        const no_dandori_id_list = await logic.getNoDandoriIdList(invoice_kyoryoku_list, master);
        if (Object.keys(no_dandori_id_list).length > 0) {
            await logic.updateDandoriId(no_dandori_id_list);
        }

        const undefined_list = await logic.getUndefinedKyoryokuList(invoice_kyoryoku_list, master);
        if (Object.keys(undefined_list).length === 0) {
            alert("口座情報が未登録の協力会社はありませんでした");
            return;
        }

        // csvファイルにしてダウンロード
        await logic.downloadUndefinedKyoryokuCsv(undefined_list, constructor_id);
        const completed_message =
            "口座情報が未登録の協力会社（社名と電話番号の両方が一致するレコードがkintoneにない協力会社）をCSVファイルにしてダウンロードしました。\n"
            + "工務店に口座情報を問い合わせてCSVファイルに記入し、協力会社マスタへインポートしてください。";
        alert(completed_message);
    } catch(err) {
        console.error(err);
        alert(err);
    }
}
