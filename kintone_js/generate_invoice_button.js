/*
    Version 1
    回収アプリ(160)の支払実行済みレコードに対して、工務店への振込依頼書を作成する。
    工務店IDと回収期限が同一のレコードのまとまりに対して、振込依頼書を1通生成。
    Version1ではテキスト形式による振込依頼書を生成。
*/

(function() {
    "use strict";

    const APP_ID_COLLECT = 160;
    const fieldRecordId_COLLECT = 'レコード番号';
    const fieldDeadline_COLLECT = 'deadline';
    const fieldProductName_COLLECT = 'productName';
    const fieldConstructionShopId_COLLECT = 'constructionShopId';
    const fieldConstructionShopName_COLLECT = 'constructionShopName';
    const fieldCeoTitle_COLLECT = 'ceoTitle';
    const fieldCeo_COLLECT = 'ceo';
    const fieldMailToInvest_COLLECT ='mailToInvest';
    const fieldClosingDate_COLLECT = 'closingDate';
    const fieldCollectableAmount_COLLECT = 'scheduledCollectableAmount';
    const fieldAccount_COLLECT = 'account';
    const fieldStatus_COLLECT = 'collectStatus';
    const statusPaid_COLLECT = '支払実行済み'

    const APP_ID_APPLY = 159;
    const fieldPayDestName_APPLY = '支払先正式名称';
    const fieldPayDate_APPLY = 'paymentDate';
    const fieldReceivables_APPLY = 'totalReceivables';
    const fieldCollectId_APPLY = 'collectId';

    kintone.events.on('app.record.index.show', (event) => {
        // ボタンを表示するか判定
        if (needShowButton()) {
            let button = getGenerateInvoiceButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function needShowButton() {``
        // 一旦は常にボタンを表示する。増殖バグだけ防止
        return document.getElementById('generateInvoice') === null;
    }

    function getGenerateInvoiceButton() {
        let generateInvoice = document.createElement('button');
        generateInvoice.id = 'generateInvoice';
        generateInvoice.innerText = '振込依頼書を作成';
        generateInvoice.addEventListener('click', clickGenerateInvoice);
        return generateInvoice;
    }

    // ボタンクリック時の処理を定義
    function clickGenerateInvoice() {
        let clicked_ok = confirm('支払実行済みのレコードに対して、振込依頼書を作成しますか？');
        if (!clicked_ok) {
            alert('処理は中断されました。');
            return;
        }

        // 状態が支払実行済みのレコードを取得
        getPaidRecords()
        .then((paid_records) => {
            if (!(paid_records.length > 0)) {
                throw new Error('支払実行済みのレコードはありませんでした。');
            }

            return addPaymentDetail(paid_records);
        })
        .then((invoice_objects) => {
            return generateInvoices(invoice_objects);
        })
        .then((completed_count) => {
            alert(`振込依頼書の作成が完了しました。\n ${completed_count}件 の振込依頼書をダウンロードしました。`);
        })
        .catch((err) => {
            console.log(err);
            alert(err.message);
        });
    }

    function getPaidRecords() {
        return new kintone.Promise((resolve, reject) => {
            console.log('回収アプリから支払実行済みのレコードを全て取得する');

            let request_body = {
                'app': APP_ID_COLLECT,
                'fields':[
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
                'query': `${fieldStatus_COLLECT} in (\"${statusPaid_COLLECT}\")`
            };

            kintone.api(kintone.api.url('/k/v1/records', true), 'GET', request_body
            , (resp) => {
                resolve(resp.records);
            }, (err) => {
                reject(err);
            });
        });
    }

    function addPaymentDetail(paid_records) {
        return new kintone.Promise((resolve, reject) => {
            new kintone.Promise((rslv) => {
                console.log('振込依頼書の支払明細にあたるレコードを申込みアプリから取得する');

                // 回収アプリのレコード番号を条件にして、申込アプリから取得
                let collect_ids = [];
                paid_records.map((paid_record) => {
                    collect_ids.push(paid_record[fieldRecordId_COLLECT]['value']);
                });
                let in_query = '(\"' + collect_ids.join('\",\"') + '\")';

                let request_body = {
                    'app': APP_ID_APPLY,
                    'fields': [fieldPayDestName_APPLY, fieldPayDate_APPLY, fieldReceivables_APPLY, fieldCollectId_APPLY],
                    'query': `${fieldCollectId_APPLY} in ${in_query}`
                };
                kintone.api(kintone.api.url('/k/v1/records', true), 'GET', request_body
                , (resp) => {
                    rslv(resp.records);
                }, (err) => {
                    reject(err);
                });
            })
            .then((detail_records) => {
                console.log('回収アプリのレコードに明細レコードを結合する');

                paid_records.map((paid_record) => {
                    let detail_arr = [];
                    // 回収IDフィールドが一致するものを結合
                    let summary_id = paid_record[fieldRecordId_COLLECT]['value'];
                    detail_records.map((detail_record) => {
                        let detail_id = detail_record[fieldCollectId_APPLY]['value'];

                        if (summary_id === detail_id) {
                            detail_arr.push(detail_record);
                        }
                    });

                    paid_record['details'] = detail_arr;
                });

                resolve(paid_records);
            });
        });
    }

    function generateInvoices(invoice_objects) {
        return new kintone.Promise((resolve, reject) => {
            // 工務店IDと支払期限が同一のレコードは一通の振込依頼書にまとめる
            let combined_invoices = [];

            let key_pair = {};
            invoice_objects.map((obj) => {
                let komuten_id = obj[fieldConstructionShopId_COLLECT]['value'];
                let deadline = obj[fieldDeadline_COLLECT]['value'];

                if ((komuten_id in key_pair) && (key_pair[komuten_id] === deadline)) {
                    // 工務店IDと支払期限が同一のレコードが複数あった場合はdetailsを結合してcollectableAmountを合計
                    let dpl_invoice = combined_invoices.filter((combined) => {
                        return (combined[fieldConstructionShopId_COLLECT]['value'] === komuten_id
                        && combined[fieldDeadline_COLLECT]['value'] === deadline);
                    })[0];

                    dpl_invoice['details'] = dpl_invoice['details'].concat(obj['details']);
                    dpl_invoice[fieldCollectableAmount_COLLECT]['value'] = Number(dpl_invoice[fieldCollectableAmount_COLLECT]['value']) + Number(obj[fieldCollectableAmount_COLLECT]['value']);
                    // dpl_invoiceは既にcombined_invoicesの中にあるオブジェクトへの参照なので、改めてpushする必要はない
                    // combined_invoices.push(dpl_invoice);
                } else {
                    key_pair[komuten_id] = deadline;
                    combined_invoices.push(obj);
                }
            });

            let generated_count = 0;
            combined_invoices.map((invoice_obj) => {
                let invoice_text = generateInvoiceText(invoice_obj);
                let bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
                let blob = new Blob([bom, invoice_text], {"type": "text/plain"});

                // 作成した振込依頼書をテキスト形式でダウンロード
                let file_name = invoice_obj[fieldConstructionShopName_COLLECT]['value'] + '様向け' + invoice_obj[fieldDeadline_COLLECT]['value'] + '回収振込依頼書';
                downloadInvoice(blob, file_name);

                // 振込依頼書の作成に成功したらカウントアップ
                generated_count++;
            });

            resolve(generated_count);
        });
    }

    function generateInvoiceText(invoice_obj) {
        let lines = [];

        let product_name = invoice_obj[fieldProductName_COLLECT]['value'];
        lines.push(`${product_name} 振込依頼書 兼 支払明細書`);

        let date = formatYYYYMD(invoice_obj['details'][0][fieldPayDate_APPLY]['value']);
        lines.push(`\r\n${date}`);

        let company = invoice_obj[fieldConstructionShopName_COLLECT]['value'];
        lines.push(`\r\n${company}`);

        let title = invoice_obj[fieldCeoTitle_COLLECT]['value'];
        let ceo = invoice_obj[fieldCeoTitle_COLLECT]['value'];
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

        let closingDate = formatYYYYMD(invoice_obj[fieldClosingDate_COLLECT]['value']);
        lines.push(`\r\n対象となる締め日 ${closingDate}`);

        let deadline = formatYYYYMD(invoice_obj[fieldDeadline_COLLECT]['value']);
        lines.push(`お支払期限 ${deadline}`);

        let collectable_amount = Number(invoice_obj[fieldCollectableAmount_COLLECT]['value']).toLocaleString();
        lines.push(`ご請求金額（消費税込み） ${collectable_amount}円`);
        lines.push('￣￣￣￣￣￣￣￣￣￣￣￣' + '￣'.repeat(Math.ceil(collectable_amount.length / 2) + 1) + '￣');

        let account_id = invoice_obj[fieldAccount_COLLECT]['value'];
        let account = '';
        switch(account_id) {
            case 'ID':
                account = '三井住友銀行　神田支店　普通預金　3 3 9 1 1 9 5　インベストデザイン（カ';
                break;
            case 'LAGLESS':
                account = '三井住友銀行　神田支店　普通預金　3 4 0 9 1 3 4　ラグレス（ド，マスターコウザ';
                break;
        }
        lines.push(`\r\n【振込先口座】${account}`);

        lines.push(`※お振込手数料はお客様にてご負担をお願いいたします。`);

        lines.push(`\r\n支払明細`);

        let line_count = 1;
        invoice_obj['details'].map((detail) => {
            let payment_date_detail = formatYYYYMD(detail[fieldPayDate_APPLY]['value']);
            let payment_amount_detail = Number(detail[fieldReceivables_APPLY]['value']).toLocaleString();
            lines.push(`${line_count}	${detail[fieldPayDestName_APPLY]['value']}	${payment_date_detail}支払	${payment_amount_detail}円（税込）`);

            line_count++;
        });

        let collectable_amount = Number(invoice_obj[fieldCollectableAmount_COLLECT]['value']).toLocaleString();
        lines.push(`合計金額	${collectable_amount}`);

        let mail = invoice_obj[fieldMailToInvest_COLLECT]['value'];
        lines.push(`
【${product_name}事務局】
インベストデザイン株式会社
東京都千代田区一番町15番地1
一番町ファーストビル6階
Mail:${mail}
TEL:0120-516-818`);

        // 空行でつないで一つの文書にする
        console.log(lines.join('\r\n'));
        return lines.join('\r\n');
    }

    function formatYYYYMD(yyyy_mm_dd) {
        // Numberでキャストしてゼロ埋めされているのを取り除く
        let date = String(yyyy_mm_dd).split('-');
        return String(Number(date[0])) + '年' + String(Number(date[1])) + '月' + String(Number(date[2])) + '日';
    }

    function downloadInvoice(blob, file_name) {
        let download_link = document.createElement('a');
        download_link.download = file_name + '.txt';
        download_link.href = (window.URL || window.webkitURL).createObjectURL(blob);

        // DLリンクを生成して自動でクリックまでして、生成したものはその都度消す
        kintone.app.getHeaderMenuSpaceElement().appendChild(download_link);
        setText(download_link, '振込依頼書ダウンロード');
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
