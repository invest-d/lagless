/*
    Version 4
    GIGの振込依頼書を作成する機能を追加。
    回収アプリの「振込依頼書作成対象のレコード一覧」を登録する時、
    GIGにバックする手数料率と金額の計算をしてセットするようになった。
    また、生成する振込依頼書のレイアウトをGIG専用のものに対応した。

    Version 3
    軽バン.com案件の場合の専用レイアウトを追加

    Version 2
    遅払いの申込が入ってくる場合にも対応。
    - 文面を一部更新
    - 支払明細のテーブルにフィールドを追加し、支払タイミングを出力するようになった
    インベストデザインの企業ロゴを削除
    住所更新
    以上の変更は、遅払いを利用しない場合にも適用される。

    Version 1.2
    処理対象レコードの状態を「支払実行済み」から「クラウドサイン承認済み」に変更。
    振込依頼書の目視確認が完了しているかどうかを、状態フィールドではなく専用のチェックボックスを使って管理するように変更。

    Version 1.1
    振込依頼書をPDF形式で作成し、kintoneの添付ファイルフィールドに保存する。

    Version 1
    1: 回収アプリの支払実行済みレコードを、工務店IDと回収期限が同一のグループでまとめる。
    まとめた中でレコード番号が最も小さいものを親レコードとし、振込依頼書作成に必要な申込レコードの情報と最終的な振込金額の合計を集約する。
    2: 工務店への振込依頼書を作成する。親レコード1件に対して振込依頼書を1通。子レコードに対しては何もしない。
    作成した振込依頼書はプレーンテキストでローカルに保存する。
*/

const dayjs = require("dayjs");
dayjs.locale("ja");

import { schema_collect } from "../162/schema";

const APP_ID_DEV = {
    APPLY: 159,
    COLLECT: 160
};

const APP_ID_PROD = {
    APPLY: 161,
    COLLECT: 162
};

const APP_ID = ((app_id) => {
    switch(app_id) {
    // 開発版の回収アプリ
    case 160:
        return APP_ID_DEV;

    // 本番の回収アプリ
    case 162:
        return APP_ID_PROD;
    default:
        console.warn(`Unknown app: ${  app_id}`);
    }
})(kintone.app.getId());

const APP_ID_COLLECT                            = APP_ID.COLLECT;
const fieldRecordId_COLLECT                     = schema_collect.fields.properties.レコード番号.code;
const fieldDeadline_COLLECT                     = schema_collect.fields.properties.deadline.code;
const fieldProductName_COLLECT                  = schema_collect.fields.properties.productName.code;
const fieldConstructionShopId_COLLECT           = schema_collect.fields.properties.constructionShopId.code;
const fieldConstructionShopName_COLLECT         = schema_collect.fields.properties.constructionShopName.code;
const fieldCeoTitle_COLLECT                     = schema_collect.fields.properties.ceoTitle.code;
const fieldCeo_COLLECT                          = schema_collect.fields.properties.ceo.code;
const fieldMailToInvest_COLLECT                 = schema_collect.fields.properties.mailToInvest.code;
const fieldClosingDate_COLLECT                  = schema_collect.fields.properties.closingDate.code;
const fieldCollectableAmount_COLLECT            = schema_collect.fields.properties.scheduledCollectableAmount.code;
const fieldAccount_COLLECT                      = schema_collect.fields.properties.account.code;
const fieldDaysLater_COLLECT                    = schema_collect.fields.properties.daysLater.code;
const fieldStatus_COLLECT                       = schema_collect.fields.properties.collectStatus.code;
const statusApproved_COLLECT                    = schema_collect.fields.properties.collectStatus.options.クラウドサイン承認済み.label;
const fieldParentCollectRecord_COLLECT          = schema_collect.fields.properties.parentCollectRecord.code;
const fieldTotalBilledAmount_COLLECT            = schema_collect.fields.properties.totalBilledAmount.code;
const tableCloudSignApplies_COLLECT             = schema_collect.fields.properties.cloudSignApplies.code;
const tableInvoiceTargets_COLLECT               = schema_collect.fields.properties.invoiceTargets.code;
const fieldInvoicePdf_COLLECT                   = schema_collect.fields.properties.invoicePdf.code;
const fieldConfirmStatusInvoice_COLLECT         = schema_collect.fields.properties.confirmStatusInvoice.code;

import * as kintoneAPI from "../util/kintoneAPI";

import { getAggregatedParentRecords } from "./invoicePdf/aggregate";
import { generateInvoices } from "./invoicePdf/generatePdf";

const button_id = "generateInvoice";
export function needShowButton() {
    // 一旦は常にボタンを表示する。増殖バグだけ防止
    return document.getElementById(button_id) === null;
}

export function createGenerateInvoiceButton() {
    const generateInvoice = document.createElement("button");
    generateInvoice.id = button_id;
    generateInvoice.innerText = "振込依頼書を作成";
    generateInvoice.addEventListener("click", clickGenerateInvoice);
    return generateInvoice;
}

// ボタンクリック時の処理を定義
async function clickGenerateInvoice() {
    const clicked_ok = confirm(`${statusApproved_COLLECT}のレコードに対して、振込依頼書を作成しますか？`);
    if (!clicked_ok) {
        alert("処理は中断されました。");
        return;
    }

    const text_ready = this.innerText;
    this.innerText = "振込依頼書を作成中...";

    try {
        const target = await getTargetRecords()
            .catch((err) => {
                console.error(err);
                throw new Error(`${statusApproved_COLLECT}の回収レコードの取得中にエラーが発生しました。`);
            });
        if (target.records.length === 0) {
            alert(`${statusApproved_COLLECT}のレコードはありませんでした。`);
            return;
        }

        // updateのための、明細や金額を集約したあとの親レコード配列を取得
        const parents = await getAggregatedParentRecords(target.records);
        await kintoneAPI.CLIENT.record.updateRecords({
            app: APP_ID_COLLECT,
            records: parents
        })
            .catch((err) => {
                console.error(err);
                throw new Error("回収レコードの親を更新中にエラーが発生しました。");
            });

        // 親レコードそれぞれから振込依頼書を作成
        const invoices = await generateInvoices()
            .catch((err) => {
                console.error(err);
                throw new Error("振込依頼書の作成中にエラーが発生しました。");
            });

        // 作成した振込依頼書を添付ファイルとしてレコードに添付
        const completed_count = await uploadInvoices(invoices)
            .catch((err) => {
                console.error(err);
                throw new Error("振込依頼書の添付中にエラーが発生しました。");
            });

        alert(`${completed_count}件 振込依頼書の作成が完了しました。\n\nそれぞれのレコードの添付ファイルを目視で確認したのち、\nレコード詳細画面の振込依頼書確認OKチェックボックスをオンにして保存してください。`);

    } catch(err) {
        alert(err);
    } finally {
        this.innerText = text_ready;
    }
}

function getTargetRecords() {
    console.log(`回収アプリから${statusApproved_COLLECT}のレコードを全て取得する`);

    const request_body = {
        "app": APP_ID_COLLECT,
        "fields":[
            fieldRecordId_COLLECT,
            fieldProductName_COLLECT,
            fieldConstructionShopId_COLLECT,
            fieldConstructionShopName_COLLECT,
            fieldCeoTitle_COLLECT,
            fieldCeo_COLLECT,
            fieldMailToInvest_COLLECT,
            fieldClosingDate_COLLECT,
            fieldDeadline_COLLECT,
            fieldCollectableAmount_COLLECT,
            fieldAccount_COLLECT,
            fieldDaysLater_COLLECT,
            fieldParentCollectRecord_COLLECT,
            fieldTotalBilledAmount_COLLECT,
            tableCloudSignApplies_COLLECT,
            tableInvoiceTargets_COLLECT
        ],
        "query": `${fieldStatus_COLLECT} in ("${statusApproved_COLLECT}")`
    };

    return kintoneAPI.CLIENT.record.getRecords(request_body);
}

async function uploadInvoices(invoices) {
    console.log("生成した振込依頼書を各レコードに添付する");

    let count = 0;
    const processes = [];
    for (const invoice_obj of invoices) {
        // getBlob(func)は非同期処理だけどPromiseを返さない（というかコールバック関数を省略できない）ので自前でPromiseを使う
        const process = new kintone.Promise((resolve, reject) => {
            invoice_obj.doc_generator.getBlob(async (blob) => {
                console.log(`PDFアップロード：ファイル名 ${invoice_obj.file_name}`);

                const param = {
                    file: {
                        name: invoice_obj.file_name,
                        data: blob
                    }
                };
                const upload = await kintoneAPI.CLIENT.file.uploadFile(param)
                    .catch((err) => {
                        reject(err);
                    });

                const file_key = upload.fileKey;
                if (!file_key) {
                    reject("fileKeyを取得できませんでした");
                }

                console.log(`PDF添付：レコード番号 ${invoice_obj.id}`);
                const attach_pdf_body = {
                    "app": APP_ID_COLLECT,
                    "id": invoice_obj.id,
                    "record": {
                        [fieldInvoicePdf_COLLECT]: {
                            "value": [
                                {
                                    "fileKey": file_key
                                }
                            ]
                        },
                        // 新規作成した振込依頼書について、目視確認が未完了の状態に戻す
                        [fieldConfirmStatusInvoice_COLLECT]: {
                            "value": []
                        }
                        // 状態フィールドは振込依頼書の目視確認がOKで送信が確定した段階になってから、子レコードと一緒に変更する
                    }
                };
                await kintoneAPI.CLIENT.record.updateRecord(attach_pdf_body)
                    .catch((err) => {
                        reject(err);
                    });

                count++;
                resolve();
            });
        });

        processes.push(process);
    }

    await kintone.Promise.all(processes);
    return count;
}
