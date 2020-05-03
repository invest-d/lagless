/*
    Version 1
    回収アプリの支払実行済みレコードに対して、工務店への振込依頼書を作成する。
    工務店IDと回収期限が同一のレコードのまとまりに対して、振込依頼書を1通生成。
    生成する振込依頼書はプレーンテキスト形式。
*/

(function() {
    "use strict";

    const APP_ID = ((app_id) => {
        switch(app_id) {
        // 開発版の回収アプリ
        case 160:
            return {
                APPLY: 159,
                COLLECT: 160
            };

            // 本番の回収アプリ
        case 162:
            return {
                APPLY: 161,
                COLLECT: 162
            };
        default:
            console.warn(`Unknown app: ${  app_id}`);
        }
    })(kintone.app.getId());

    const APP_ID_COLLECT = APP_ID.COLLECT;
    const fieldRecordId_COLLECT = "レコード番号";
    const fieldDeadline_COLLECT = "deadline";
    const fieldProductName_COLLECT = "productName";
    const fieldConstructionShopId_COLLECT = "constructionShopId";
    const fieldConstructionShopName_COLLECT = "constructionShopName";
    const fieldCeoTitle_COLLECT = "ceoTitle";
    const fieldCeo_COLLECT = "ceo";
    const fieldMailToInvest_COLLECT ="mailToInvest";
    const fieldClosingDate_COLLECT = "closingDate";
    const fieldCollectableAmount_COLLECT = "scheduledCollectableAmount";
    const fieldAccount_COLLECT = "account";
    const fieldStatus_COLLECT = "collectStatus";
    const statusPaid_COLLECT = "支払実行済み";

    const APP_ID_APPLY = APP_ID.APPLY;
    const fieldPayDestName_APPLY = "支払先正式名称";
    const fieldPayDate_APPLY = "paymentDate";
    const fieldReceivables_APPLY = "totalReceivables";
    const fieldCollectId_APPLY = "collectId";

    kintone.events.on("app.record.index.show", (event) => {
        // ボタンを表示するか判定
        if (needShowButton()) {
            const button = createGenerateInvoiceButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function needShowButton() {
        // 一旦は常にボタンを表示する。増殖バグだけ防止
        return document.getElementById("generateInvoice") === null;
    }

    function createGenerateInvoiceButton() {
        const generateInvoice = document.createElement("button");
        generateInvoice.id = "generateInvoice";
        generateInvoice.innerText = "振込依頼書を作成";
        generateInvoice.addEventListener("click", clickGenerateInvoice);
        return generateInvoice;
    }

    // ボタンクリック時の処理を定義
    async function clickGenerateInvoice() {
        const clicked_ok = confirm("支払実行済みのレコードに対して、振込依頼書を作成しますか？");
        if (!clicked_ok) {
            alert("処理は中断されました。");
            return;
        }

        try {
            // 状態が支払実行済みのレコードを取得
            const paid = await getPaidRecords()
                .catch((err) => {
                    console.error(err);
                    throw new Error("支払実行済みの回収レコードの取得中にエラーが発生しました。");
                });

            if (paid.records.length === 0) {
                alert("支払実行済みのレコードはありませんでした。");
                return;
            }

            const invoice_objects = await addPaymentDetail(paid.records)
                .catch((err) => {
                    console.error(err);
                    throw new Error("回収レコードに紐づく支払明細の取得中にエラーが発生しました。");
                });

            const completed_count = generateInvoices(invoice_objects);
            alert(`振込依頼書の作成が完了しました。\n ${completed_count}件 の振込依頼書をダウンロードしました。`);
        } catch(err) {
            alert(err);
        }
    }

    function getPaidRecords() {
        console.log("回収アプリから支払実行済みのレコードを全て取得する");

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
                fieldAccount_COLLECT
            ],
            "query": `${fieldStatus_COLLECT} in ("${statusPaid_COLLECT}")`
        };

        return kintone.api(kintone.api.url("/k/v1/records", true), "GET", request_body);
    }

    async function addPaymentDetail(paid_records) {
        console.log("振込依頼書の支払明細にあたるレコードを申込みアプリから取得する");
        // 回収アプリのレコード番号を条件にして、申込アプリから取得
        const collect_ids = paid_records.map((paid_record) => {
            return paid_record[fieldRecordId_COLLECT]["value"];
        });
        const in_query = `("${  collect_ids.join("\",\"")  }")`;

        const request_body = {
            "app": APP_ID_APPLY,
            "fields": [fieldPayDestName_APPLY, fieldPayDate_APPLY, fieldReceivables_APPLY, fieldCollectId_APPLY],
            "query": `${fieldCollectId_APPLY} in ${in_query}`
        };

        const detail = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", request_body);

        console.log("回収アプリのレコードに明細レコードを結合する");
        const attached_details = paid_records.map((record) => {
            // 明細にあたる申込みレコードの中から、回収IDフィールドの値が回収レコードのレコード番号に等しいものだけ抽出
            record["details"] = detail.records.filter((detail) => {
                return detail[fieldCollectId_APPLY]["value"] === record[fieldRecordId_COLLECT]["value"];
            });

            return record;
        });

        return attached_details;
    }

    function generateInvoices(invoice_objects) {
        // 工務店IDと支払期限が同一のレコードを一通の振込依頼書にまとめていく。
        // まず、振込依頼書作成対象のレコードから工務店IDと支払期限の重複なし組み合わせを取得。
        const unique_key_pairs = invoice_objects.filter((invoice1, index, self) => {
            return index === self.findIndex((invoice2) => {
                return invoice1[fieldConstructionShopId_COLLECT]["value"] === invoice2[fieldConstructionShopId_COLLECT]["value"]
                && invoice1[fieldDeadline_COLLECT]["value"] === invoice2[fieldDeadline_COLLECT]["value"];
            });
        }).map((elem) => {
            // mapで工務店IDと支払期限だけ取って、他の不要な値は捨てる
            return {
                [fieldConstructionShopId_COLLECT]: {
                    "value": elem[fieldConstructionShopId_COLLECT]["value"]
                },
                [fieldDeadline_COLLECT]: {
                    "value": elem[fieldDeadline_COLLECT]["value"]
                }
            };
        });

        // 次に重複なし組み合わせのそれぞれについて、回収レコードをfilterしてdetailsをまとめる処理
        const combined_invoices = unique_key_pairs.map((pair) => {
            const filtered = invoice_objects.filter((invoice) => {
                return invoice[fieldConstructionShopId_COLLECT]["value"] === pair[fieldConstructionShopId_COLLECT]["value"]
                && invoice[fieldDeadline_COLLECT]["value"] === pair[fieldDeadline_COLLECT]["value"];
            });

            // フィルターされた中でレコード番号が最も小さい回収レコードを親にする
            const summary_record = filtered.sort((a, b) => Number(a[fieldRecordId_COLLECT]["value"]) - Number(b[fieldRecordId_COLLECT]["value"]))[0];

            // i = 0はsummary_record自身なので除く
            for (let i = 1; i < filtered.length; i++) {
                // 親にdetailsを全てまとめる
                summary_record["details"] = summary_record["details"].concat(filtered[i]["details"]);

                // 親に回収予定金額を全て合計する
                summary_record[fieldCollectableAmount_COLLECT]["value"] =
                Number(summary_record[fieldCollectableAmount_COLLECT]["value"]) + Number(filtered[i][fieldCollectableAmount_COLLECT]["value"]);
            }

            return summary_record;
        });

        let generated_count = 0;
        for(const invoice of combined_invoices) {
            const invoice_text = generateInvoiceText(invoice);
            const bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
            const blob = new Blob([bom, invoice_text], {"type": "text/plain"});

            // 作成した振込依頼書をテキスト形式でダウンロード
            const file_name = `${invoice[fieldConstructionShopName_COLLECT]["value"]  }様向け${  invoice[fieldDeadline_COLLECT]["value"]  }回収振込依頼書.txt`;
            downloadInvoice(blob, file_name);

            // 振込依頼書の作成に成功したらカウントアップ
            generated_count++;
        }

        return generated_count;
    }

    function generateInvoiceText(invoice_obj) {
        const lines = [];

        const product_name = invoice_obj[fieldProductName_COLLECT]["value"];
        lines.push(`${product_name} 振込依頼書 兼 支払明細書`);

        const date = formatYYYYMD(invoice_obj["details"][0][fieldPayDate_APPLY]["value"]);
        // 1行空けたいところには適宜改行を挟む
        lines.push(`\r\n${date}`);

        const company = invoice_obj[fieldConstructionShopName_COLLECT]["value"];
        lines.push(`\r\n${company}`);

        const title = invoice_obj[fieldCeoTitle_COLLECT]["value"];
        const ceo = invoice_obj[fieldCeo_COLLECT]["value"];
        lines.push(`${title} ${ceo} 様`);

        lines.push(`
拝啓　時下ますますご清栄のこととお慶び申し上げます。
平素は格別のご高配を賜り厚く御礼申し上げます。
さて、下記のとおり早期支払を実行いたしましたのでご案内いたします。
つきましては、${product_name}利用分の合計金額を、お支払期限までに
下記振込先口座へお振込み頂きますよう、お願い申し上げます。

ご不明な点などがございましたら、下記連絡先までお問い合わせください。
今後ともどうぞ宜しくお願いいたします。
敬具`);

        const closingDate = formatYYYYMD(invoice_obj[fieldClosingDate_COLLECT]["value"]);
        lines.push(`\r\n対象となる締め日 ${closingDate}`);

        const deadline = formatYYYYMD(invoice_obj[fieldDeadline_COLLECT]["value"]);
        lines.push(`お支払期限 ${deadline}`);

        const collectable_amount = addComma(invoice_obj[fieldCollectableAmount_COLLECT]["value"]);
        lines.push(`ご請求金額（消費税込み） ${collectable_amount}円`);
        lines.push(`￣￣￣￣￣￣￣￣￣￣￣￣${  "￣".repeat(Math.ceil(collectable_amount.length / 2) + 1)  }￣`);

        const account_id = invoice_obj[fieldAccount_COLLECT]["value"];
        let account = "";
        switch(account_id) {
        case "ID":
            account = "三井住友銀行　神田支店　普通預金　3 3 9 1 1 9 5　インベストデザイン（カ";
            break;
        case "LAGLESS":
            account = "三井住友銀行　神田支店　普通預金　3 4 0 9 1 3 4　ラグレス（ド，マスターコウザ";
            break;
        }
        lines.push(`\r\n【振込先口座】${account}`);

        lines.push("※お振込手数料はお客様にてご負担をお願いいたします。");

        lines.push("\r\n支払明細");

        invoice_obj["details"].forEach((detail, index) => {
            const payment_date_detail = formatYYYYMD(detail[fieldPayDate_APPLY]["value"]);
            const payment_amount_detail = addComma(detail[fieldReceivables_APPLY]["value"]);
            // 明細の行番号をindex+1で表示する
            lines.push(`${index+1}	${detail[fieldPayDestName_APPLY]["value"]}	${payment_date_detail}支払	${payment_amount_detail}円（税込）`);
        });

        lines.push(`合計金額	${collectable_amount}円`);

        const mail = invoice_obj[fieldMailToInvest_COLLECT]["value"];
        lines.push(`
【${product_name}事務局】
インベストデザイン株式会社
東京都千代田区一番町15番地1
一番町ファーストビル6階
Mail:${mail}
TEL:03-6261-6818`);

        // 各行の文を改行でつないで一つの文書にする
        console.log(lines.join("\r\n"));
        return lines.join("\r\n");
    }

    function formatYYYYMD(yyyy_mm_dd) {
        // Numberでキャストしてゼロ埋めされているのを取り除く
        const date = String(yyyy_mm_dd).split("-");
        return `${String(Number(date[0]))  }年${  String(Number(date[1]))  }月${  String(Number(date[2]))  }日`;
    }

    function addComma(num) {
        // 数字に3桁区切りのコンマを挿入した文字列を返す。整数のみ考慮
        return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }

    function downloadInvoice(blob, file_name) {
        const download_link = document.createElement("a");
        download_link.download = file_name;
        download_link.href = (window.URL || window.webkitURL).createObjectURL(blob);

        // DLリンクを生成して自動でクリックまでして、生成したDLリンクはその都度消す
        kintone.app.getHeaderMenuSpaceElement().appendChild(download_link);
        setText(download_link, "振込依頼書ダウンロード");
        download_link.click();
        kintone.app.getHeaderMenuSpaceElement().removeChild(download_link);
    }

    function setText(element,str){
        if(element.textContent !== undefined){
            element.textContent = str;
        }
        if(element.innerText !== undefined){
            element.innerText = str;
        }
    }
})();
