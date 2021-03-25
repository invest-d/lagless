// kintoneに関するjsファイル（gsファイル）ではあるが、Google Apps ScriptとしてGoogle Driveから実行する。
const KINTONE_APPLY_APP = "";
const KINTONE_APPLY_TOKEN = "";


function main() {
    const gig_data = getGigMailData();

    if (!gig_data) {
        return;
    }

    postKintoneRecords(gig_data);
}

function labelThreads() {
    const threads = GmailApp.search('subject:+"【Workship】フリーランスから前払い申請が届きました" -label:kintone追加済み');
    const label = GmailApp.getUserLabelByName("kintone追加済み");
    threads.map((thread) => thread.addLabel(label));
}

function getGigMailData() {
    const threads = GmailApp.search('subject:+"【Workship】フリーランスから前払い申請が届きました" -label:kintone追加済み');
    if (!threads) {
        return;
    }

    const logSheet = SpreadsheetApp.openById(LOG_SHEET_ID).getSheetByName("list");

    const data = [];
    threads.forEach((thread) => {
        const messages = thread.getMessages();

        // メールを一つずつ取り出す
        messages.forEach((message) => {
            if (message.getFrom().includes("Workship 運営事務局")) {
                const msgId = message.getId();
                const textFinder = logSheet.createTextFinder(msgId);
                const ranges = textFinder.findAll();
                // 重複メッセージが存在しないことを確認（件数ゼロ）
                if (ranges.length == 0) {
                    // メールに対する処理
                    const plainBody = message.getPlainBody();
                    const mailData = getDataFromMailBody(plainBody);
                    data.push(mailData);

                    // 空行を追加
                    logSheet.insertRowBefore(2);
                    //メッセージIDを記録
                    logSheet.getRange("A2").setValue(msgId);
                }
            }
        });
    });

    return data;
}

function getDataFromMailBody(plainBody) {
    const sender_name = plainBody.match(/(【名前】[\s\S])([\s\S]*?)(【)/gm);
    const postal_code = plainBody.match(/(【郵便番号】[\s\S])([\s\S]*?)(【)/gm);
    const full_address = plainBody.match(/(【住所】[\s\S])([\s\S]*?)(【)/gm);
    const phone_number = plainBody.match(/(【電話番号】[\s\S])([\s\S]*?)(【)/gm);
    const email_address = plainBody.match(/(【メールアドレス】[\s\S])([\s\S]*?)(【)/gm);
    const bank_account = plainBody.match(/(【口座情報】[\s\S])([\s\S]*?)(┏)/gm);
    const orderer_name = plainBody.match(/(【企業名】[\s\S])([\s\S]*?)(┏)/gm);

    const got_data = {};
    let data = "";
    if (sender_name) {
        data = sender_name[0];
        got_data["company"] = data.replace("【名前】", "").replace("【", "").replace(/\r?\n/g,"");
    }

    if (postal_code) {
        data = postal_code[0];
        got_data["postalCode"] = data.replace("【郵便番号】", "").replace("【", "").replace(/\r?\n/g,"");
    }

    if (full_address) {
        data = full_address[0];
        // kintone上では都道府県/市区町村/番地のようにフィールドが別れているが、Gmail上では全て同じフィールド。GAS上での切り分けを断念する
        got_data["prefecture"] = data.replace("【住所】", "").replace("【", "").replace(/\r?\n/g,"");
    }

    if (phone_number) {
        data = phone_number[0];
        got_data["phone"] = data.replace("【電話番号】", "").replace("【", "").replace(/\r?\n/g,"").replace(/>/g, "").replace(/ /g, "");
    }

    if (email_address) {
        data = email_address[0];
        got_data["mail"] = data.replace("【メールアドレス】", "").replace("【", "").replace(/\r?\n/g,"").replace(/>/g, "").replace(/ /g, "");
    }

    if (bank_account) {
        data = bank_account[0];
        // full_addressと同じ処理
        got_data["bankName_Form"] = data.replace("【口座情報】", "").replace("┏", "").replace(/\r?\n/g,"");
    }

    if (orderer_name) {
        data = orderer_name[0];
        got_data["ordererGig"] = data.replace("【企業名】", "").replace("┏", "").replace(/\r?\n/g,"");
    }

    return got_data;
}

function postKintoneRecords(gig_data) {
    const payload = getKintoneRecordsPayload(gig_data);
    const options = {
        "method" : "post",
        "contentType": "application/json",
        "headers": {
            "X-Cybozu-API-Token": KINTONE_APPLY_TOKEN,
            "Authorization": `Basic ${KINTONE_APPLY_TOKEN}`,
        },
        "payload" : JSON.stringify(payload)
    };

    try {
        const response = UrlFetchApp.fetch("https://investdesign.cybozu.com/k/v1/records.json", options);
        console.log(response);

        labelThreads();
    } catch(e) {
        console.log(e);
    }
}

function getKintoneRecordsPayload(mail_data) {
    const records = [];

    const today = new Date();
    // 日付にゼロを渡すと、ひと月前の末日になる
    const clo = new Date(today.getFullYear(), today.getMonth(), 0);
    const closing_field_value = [clo.getFullYear(), clo.getMonth()+1, clo.getDate()].join("-");

    for (const single_mail of mail_data) {
        const record = {
            // まず固定値を入力しておく
            "paymentTiming": {
                "value": "早払い"
            },
            "applicationAmount": {
                // 後から手動入力することが前提
                "value": "0"
            },
            "membership_fee": {
                "value": "0"
            },
            "closingDay": {
                // 常に「今日の日付から見た先月末」を入力
                "value": closing_field_value
            },
            "billingCompany": {
                "value": "株式会社GIG"
            },
            "constructionShopId": {
                "value": "500"
            },
            "deposit_Form": {
                "value": "普通"
            },
            "deposit": {
                "value": "普通"
            }
        };

        for(const key of Object.keys(single_mail)) {
            record[key] = {
                "value": single_mail[key]
            };
        }

        records.push(record);
    }

    return {
        "app": KINTONE_APPLY_APP,
        "records": records
    };
}
