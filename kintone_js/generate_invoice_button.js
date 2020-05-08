/*
    Version 1
    1: 回収アプリの支払実行済みレコードを、工務店IDと回収期限が同一のグループでまとめる。
    まとめた中でレコード番号が最も小さいものを親レコードとし、振込依頼書作成に必要な申込レコードの情報と最終的な振込金額の合計を集約する。
    2: 工務店への振込依頼書を作成する。親レコード1件に対して振込依頼書を1通。子レコードに対しては何もしない。
    作成した振込依頼書はプレーンテキストでローカルに保存する。
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

    const ACCOUNTS = {
        "ID": "三井住友銀行　神田支店　普通預金　3 3 9 1 1 9 5　インベストデザイン（カ",
        "LAGLESS": "三井住友銀行　神田支店　普通預金　3 4 0 9 1 3 4　ラグレス（ド，マスターコウザ"
    };

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
    const fieldParentCollectRecord_COLLECT = "parentCollectRecord";
    const statusParent_COLLECT = "true";
    const fieldTotalBilledAmount_COLLECT = "totalBilledAmount";
    const tableCloudSignApplies_COLLECT = "cloudSignApplies";
    const tableFieldApplyRecordNoCS_COLLECT = "applyRecordNoCS";
    const tableFieldApplicantOfficialNameCS_COLLECT = "applicantOfficialNameCS";
    const tableFieldReceivableCS_COLLECT = "receivableCS";
    const tableInvoiceTargets_COLLECT = "invoiceTargets";
    const tableFieldApplyRecordNoIV_COLLECT = "applyRecordNoIV";
    const tableFieldApplicantOfficialNameIV_COLLECT = "applicantOfficialNameIV";
    const tableFieldReceivableIV_COLLECT = "receivableIV";

    const APP_ID_APPLY = APP_ID.APPLY;
    const fieldRecordId_APPLY = "$id";
    const fieldPayDestName_APPLY = "支払先正式名称";
    const fieldPayDate_APPLY = "paymentDate";
    const fieldReceivables_APPLY = "totalReceivables";

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

            // updateのための、明細や金額を集約したあとの親レコード配列を取得
            const parents = getAggregatedParentRecords(paid.records);

            // Update
            const update_body = {
                "app": APP_ID_COLLECT,
                "records": parents
            };
            await kintone.api(kintone.api.url("/k/v1/records", true), "PUT", update_body)
                .catch((err) => {
                    console.error(err);
                    throw new Error("回収レコードの親を更新中にエラーが発生しました。");
                });

            // 親レコードそれぞれから振込依頼書を作成
            const completed_count = await generateInvoices();
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
                fieldAccount_COLLECT,
                fieldParentCollectRecord_COLLECT,
                fieldTotalBilledAmount_COLLECT,
                tableCloudSignApplies_COLLECT,
                tableInvoiceTargets_COLLECT
            ],
            "query": `${fieldStatus_COLLECT} in ("${statusPaid_COLLECT}")`
        };

        return kintone.api(kintone.api.url("/k/v1/records", true), "GET", request_body);
    }

    function getAggregatedParentRecords(paid_records) {
        console.log("支払い済みレコードを締日と工務店IDごとにまとめ、明細の情報を親に集約する");
        // まず工務店IDと締日だけ全て抜き出す
        const key_pairs = paid_records.map((record) => {
            return {
                [fieldConstructionShopId_COLLECT]: record[fieldConstructionShopId_COLLECT]["value"],
                [fieldClosingDate_COLLECT]: record[fieldClosingDate_COLLECT]["value"]
            };
        });

        // 抜き出した工務店IDと締日のペアについて、重複なしのリストを作る。
        const unique_key_pairs = key_pairs.filter((key_pair1, key_pairs_index, self_arr) => {
            const target_index = self_arr.findIndex(((key_pair2) => {
                // 工務店IDの一致
                return (key_pair1[fieldConstructionShopId_COLLECT] === key_pair2[fieldConstructionShopId_COLLECT])
                // 締日の一致
                && (key_pair1[fieldClosingDate_COLLECT] === key_pair2[fieldClosingDate_COLLECT]);
            }));

            const is_unique = (target_index === key_pairs_index);
            return is_unique;
        });

        // 親レコード更新用のオブジェクトを作成
        const update_targets = unique_key_pairs.map((pair) => {
            // 振込依頼書をまとめるべき回収レコードを配列としてグループ化
            const invoice_group = paid_records.filter((record) => {
                return record[fieldConstructionShopId_COLLECT]["value"] === pair[fieldConstructionShopId_COLLECT]
                && record[fieldClosingDate_COLLECT]["value"] === pair[fieldClosingDate_COLLECT];
            });

            // グループの中でレコード番号が最も小さいもの一つを親と決める
            const parent_record = invoice_group.reduce((a, b) => {
                if (Number(a[fieldRecordId_COLLECT]["value"]) < Number(b[fieldRecordId_COLLECT]["value"])) {
                    return a;
                } else {
                    return b;
                }
            });

            // グループの情報を親に集約。クラウドサイン用の情報とは別に保持するため、親の振込依頼書用サブテーブルに親自身のクラウドサイン用サブテーブルのレコードも加える。
            // 振込依頼書に記載する合計額
            const total_billed = invoice_group.reduce((total, record) => total + Number(record[fieldCollectableAmount_COLLECT]["value"]), 0);

            // 振込依頼書に記載する申込レコード一覧（グループ化した回収レコードそれぞれの、クラウドサイン用サブテーブルに入っている申込レコードのunion）
            const invoice_targets = invoice_group
                .flatMap((record) => {
                    // サブテーブルのUpdateをするにあたって、サブテーブルのレコードそれぞれのオブジェクトの構造を整える
                    return record[tableCloudSignApplies_COLLECT]["value"].map((sub_rec) => {
                        return {
                            "value": {
                                [tableFieldApplyRecordNoIV_COLLECT]: {
                                    "value": sub_rec["value"][tableFieldApplyRecordNoCS_COLLECT]["value"]
                                },
                                [tableFieldApplicantOfficialNameIV_COLLECT]: {
                                    "value": sub_rec["value"][tableFieldApplicantOfficialNameCS_COLLECT]["value"]
                                },
                                [tableFieldReceivableIV_COLLECT]: {
                                    "value": sub_rec["value"][tableFieldReceivableCS_COLLECT]["value"]
                                }
                            }
                        };
                    });
                });

            // apiに渡すためにオブジェクトの構造を整える
            return {
                "id": parent_record[fieldRecordId_COLLECT]["value"],
                "record": {
                    [fieldParentCollectRecord_COLLECT]: {
                        "value": [statusParent_COLLECT] // チェックボックス型は複数選択のフィールドなので配列で値を指定
                    },
                    [fieldTotalBilledAmount_COLLECT]: {
                        "value": total_billed
                    },
                    [tableInvoiceTargets_COLLECT]: {
                        "value": invoice_targets
                    }
                }
            };
        });

        return update_targets;
    }

    async function generateInvoices() {
        // 支払実行済みの親レコードを全て取得
        const get_parents = {
            "app": APP_ID_COLLECT,
            "fields": [
                fieldConstructionShopName_COLLECT,
                fieldCeoTitle_COLLECT,
                fieldCeo_COLLECT,
                fieldProductName_COLLECT,
                fieldClosingDate_COLLECT,
                fieldDeadline_COLLECT,
                fieldTotalBilledAmount_COLLECT,
                tableInvoiceTargets_COLLECT,
                fieldAccount_COLLECT,
                fieldMailToInvest_COLLECT
            ],
            "query": `${fieldStatus_COLLECT} in ("${statusPaid_COLLECT}") and ${fieldParentCollectRecord_COLLECT} in ("${statusParent_COLLECT}")`
        };
        const target_parents = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", get_parents);

        let generated_count = 0;
        for(const parent_record of target_parents.records) {
            const invoice_text = await generateInvoiceText(parent_record);
            const bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
            const blob = new Blob([bom, invoice_text], {"type": "text/plain"});

            // 作成した振込依頼書をテキスト形式でダウンロード
            const file_name = `${parent_record[fieldConstructionShopName_COLLECT]["value"]}様向け${parent_record[fieldDeadline_COLLECT]["value"]}回収振込依頼書.txt`;
            downloadInvoice(blob, file_name);

            // 振込依頼書の作成に成功したらカウントアップ
            generated_count++;
        }

        return generated_count;
    }

    async function generateInvoiceText(parent_record) {
        const lines = [];

        const product_name = parent_record[fieldProductName_COLLECT]["value"];
        lines.push(`${product_name} 振込依頼書 兼 支払明細書`);

        // 振込依頼書に記載する日付。Y年M月D日
        const today = new Date();
        const date = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
        // 1行空けたいところには適宜改行を挟む
        lines.push(`\r\n${date}`);

        const company = parent_record[fieldConstructionShopName_COLLECT]["value"];
        lines.push(`\r\n${company}`);

        // 肩書が空白の場合、名前の前に空白が出来てしまうので、replaceで取り除く
        const addressee = `${parent_record[fieldCeoTitle_COLLECT]["value"]} ${parent_record[fieldCeo_COLLECT]["value"]}`.replace(/^( |　)+/,"");
        lines.push(`${addressee} 様`);

        lines.push(`
拝啓　時下ますますご清栄のこととお慶び申し上げます。
平素は格別のご高配を賜り厚く御礼申し上げます。
さて、下記のとおり早期支払を実行いたしましたのでご案内いたします。
つきましては、${product_name}利用分の合計金額を、お支払期限までに
下記振込先口座へお振込み頂きますよう、お願い申し上げます。

ご不明な点などがございましたら、下記連絡先までお問い合わせください。
今後ともどうぞ宜しくお願いいたします。
敬具`);

        const closingDate = formatYMD(parent_record[fieldClosingDate_COLLECT]["value"]);
        lines.push(`\r\n対象となる締め日 ${closingDate}`);

        const deadline = formatYMD(parent_record[fieldDeadline_COLLECT]["value"]);
        lines.push(`お支払期限 ${deadline}`);

        const total_billed_amount = addComma(parent_record[fieldTotalBilledAmount_COLLECT]["value"]);
        lines.push(`ご請求金額（消費税込み） ${total_billed_amount}円`);
        lines.push(`￣￣￣￣￣￣￣￣￣￣￣￣${  "￣".repeat(Math.ceil(total_billed_amount.length / 2) + 1)  }￣`); // "XXX,XXX円"の右まで下線が伸びるように"￣"の数を調整

        const account_id = parent_record[fieldAccount_COLLECT]["value"];
        if (!(account_id in ACCOUNTS)) {
            throw new Error(`不明な支払先口座を入力しています：${account_id}`);
        }
        const account = ACCOUNTS[account_id];
        lines.push(`\r\n【振込先口座】${account}`);

        lines.push("※お振込手数料はお客様にてご負担をお願いいたします。");

        lines.push("\r\n支払明細");

        // 支払日等を申込アプリから取得。支払日以外は既に親レコードの中に持ってるけど、どうせ取るなら全部取ってしまうことにした
        const get_apply = {
            "app": APP_ID_APPLY,
            "fields": [
                fieldPayDestName_APPLY,
                fieldPayDate_APPLY,
                fieldReceivables_APPLY
            ],
            "query": `${fieldRecordId_APPLY} in ("${parent_record[tableInvoiceTargets_COLLECT]["value"].map((apply) => apply["value"][tableFieldApplyRecordNoIV_COLLECT]["value"]).join("\",\"")}")`
        };
        const apply_resp = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", get_apply);

        apply_resp.records.forEach((record, index) => {
            const payment_date_detail = formatYMD(record[fieldPayDate_APPLY]["value"]);
            const payment_amount_detail = addComma(record[fieldReceivables_APPLY]["value"]);
            // 明細の行番号をindex+1で表示する
            lines.push(`${index+1}	${record[fieldPayDestName_APPLY]["value"]}	${payment_date_detail}支払	${payment_amount_detail}円（税込）`);
        });

        lines.push(`合計金額	${total_billed_amount}円`);

        const mail = parent_record[fieldMailToInvest_COLLECT]["value"];
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

    function formatYMD(yyyy_mm_dd) {
        // Numberでキャストしてゼロ埋めされているのを取り除く
        const date = String(yyyy_mm_dd).split("-");
        return `${String(Number(date[0]))}年${String(Number(date[1]))}月${String(Number(date[2]))}日`;
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
