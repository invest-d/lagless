const functions = require("firebase-functions");
const {Storage} = require("@google-cloud/storage");

const {PubSub} = require("@google-cloud/pubsub");
const file_process_topic = "attach_apply_files";

const axios = require("axios");
const sendMail = require("./sendmail_frame.js");
const fs = require("fs");
const path = require("path");
const auto_text = fs.readFileSync(path.join(__dirname, "autoMail_template.txt"), "utf8");
const SMS_text = fs.readFileSync(path.join(__dirname, "autoSMS_template.txt"), "utf8");
const date = new Date ();

// sms送信用
const AWS = require("aws-sdk");
AWS.config.update({
    accessKeyId: process.env.SNS_ACCESS_KEY_ID,
    secretAccessKey: process.env.SNS_SECRET_KEY,
    region: "ap-northeast-1"
});
const sns = new AWS.SNS();

exports.send_apply_dev = functions.https.onRequest((req, res) => {
    if (req.method != "POST") {
        respond_error(res, {
            status: 405,
            message: "Method Not Allowed"
        });
        return;
    }
    console.log(`requested from ${String(req.headers.origin)}`);

    // 開発環境か、もしくは本番環境のトークン等の各種データを取得。それ以外のドメインの場合は例外をthrow
    let env;
    try {
        env = new Environ(req.headers.origin);
    } catch (e) {
        console.error(e);
        respond_error(res, {
            status: 400,
            message: "無効なリクエストです"
        });
        return;
    }
    setCORS(env, res);

    // フォームからのリクエスト内容はいくつかの種類に分かれる。
    // 従って、リクエストボディを見て本functionの処理を分岐する
    const req_body = JSON.parse(req.body);
    if (req_body.process_type === "signed_url") {
        // フォームの添付ファイルをCloud Storageにアップロードするための署名付きURLを返す
        console.log("first: returning signed_url");
        get_storage_signed_url(req_body.file_name, req_body.mime_type)
            .then((url) => {
                res.status(200).json({
                    "signed_url": url
                });
            })
            .catch((err) => {
                console.error(err);
                respond_error(res, err);
            });
    } else if (req_body.process_type === "post") {
        console.log("second: posting to kintone");
        // リクエストに含まれるファイル名をStorageからダウンロードし、
        // kintoneのレコードの登録後にレコードの添付ファイルとして保存する
        post_apply_record(req_body.fields, env)
            .catch((err) => {
                console.error(err);
                // kintoneにレコード作成できなかったので、エラーレスポンスが必要
                respond_error(res, err);
            })
            .then(async (post_succeed) => {
                // 添付ファイルに対する残処理をpubsubに投げる
                const pubsub = new PubSub();
                const topic = pubsub.topic(file_process_topic);
                const message = Buffer.from(JSON.stringify({
                    env: env,
                    files: req_body.files,
                    record_id: post_succeed.id,
                }), "utf8");
                const message_id = await topic.publish(message)
                    .catch((err) => {
                        console.error(err);
                        console.error("申込を受け付けましたが、請求書ファイル等の処理を完了できませんでした。\n"
                            + `以下のファイルを手動でStorageからダウンロードして申込レコードID: ${post_succeed.id}に添付し、Storageから削除してください。\n`
                            + `${req_body.files.map((file) => file.name)}`);
                    });
                if (message_id) {
                    console.log(`files are will be processed on published message: ${message_id}`);
                }

                // 申込受付メールを送信
                const payload = {
                    "app": 96,
                    "fields": ["支払元口座", "service"],
                    "query": `id = "${post_succeed.record.constructionShopId.value}"`,
                };
                const token = process.env.api_token_komuten_sendauto;
                const headers = {
                    "Host": "investdesign.cybozu.com:96",
                    "X-Cybozu-API-Token": token,
                    "Authorization": `Basic ${token}`,
                    "Content-Type": "application/json",
                };

                // 工務店マスタから情報（支払元口座、商品名）を抽出
                const result = await axios({
                    method: "get",
                    url: "https://investdesign.cybozu.com/k/v1/records.json",
                    data: payload,
                    headers: headers
                });

                // 申し込み時の日時を取得
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const dateNow = `${year}年 ${month}月 ${day}日`;

                // 支払元口座、商品名を取得
                const productName = result.data.records[0]["service"]["value"];
                const accountFrom = result.data.records[0]["支払元口座"]["value"];

                // 支払い元口座によって変化する会社名、また商品名と申し込み時の日付をrecordに追加
                if (accountFrom === "ID") {
                    post_succeed.record["contractor"] = {"value": "ラグレス２合同会社"};
                } else if (accountFrom === "LAGLESS") {
                    post_succeed.record["contractor"] = {"value": "ラグレス合同会社"};
                }
                post_succeed.record["product_name"] = {"value": productName};
                post_succeed.record["date_now"] = {"value": dateNow};

                // 既存の顧客の場合、預金項目のkeyがrecordに存在しないため空欄で追加する
                if (!isNewUser(post_succeed.record)) {
                    post_succeed.record["deposit_Form"] = {"value": ""};
                }

                if (post_succeed.record["mail"]["value"]) {
                    const options = {
                        host: "smtp.sendgrid.net",
                        port: 587,
                        requiresAuth: true,
                        auth: {
                            user: process.env.SENDGRID_USERNAME,
                            pass: process.env.SENDGRID_PASSWORD,
                        },
                    };

                    const mail = {
                        from: "lagless@invest-d.com",
                        to: `${post_succeed.record["mail"]["value"]}`,
                        bcc: "lagless@invest-d.com",
                        subject: `【 ${productName} 】お申込みいただきありがとうございます。`,
                        text: replaceMail(auto_text, post_succeed.record),
                    };

                    // 自動応答メール送信
                    sendMail(mail, options);
                } else {
                    const number = post_succeed.record["phone"]["value"].replace(0, "+81");
                    let subject = "dandoliPay";
                    if (productName=="リノベ不動産Payment") subject = "renovePay";
                    if (productName=="ラグレス") subject = "lagless";

                    // 登録情報のメールアドレスが空欄の時のみ、SMSを送信
                    sendSMS(number, subject, replaceMail(SMS_text, post_succeed.record), (err, result) => {
                        console.log("RESULTS: ",err,result);
                    });
                }

                res.status(post_succeed.status).json({
                    "redirect": post_succeed.redirect_to
                });
            })
            .catch((err) => {
                console.error(err);
                console.error("Storageにアップロードされたままのファイルが残っています。");
                console.error(req_body.files.map((file) => file.name));
                // kintoneにはレコード作成できている&&ファイルはStorageから手動ダウンロードしてどうにかすればいいので、レスポンスしない
            });
    } else {
        respond_error(res, {
            status: 400,
            message: "process_type is not set in request."
        });
    }
});

async function get_storage_signed_url(filename, content_type) {
    const storage = new Storage();
    const options = {
        version: "v4",
        action: "write",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: content_type,
    };

    const [url] = await storage
        .bucket("lagless-apply")
        .file(filename)
        .getSignedUrl(options);
    return url;
}

async function post_apply_record(form_text_data, env) {
    const get_posting_payload = (form_data, app_id) => {
        const record = {};

        // フォームの入力内容を読み取る
        for (const key of Object.keys(form_data)) {
            record[key]= {"value": form_data[key]};
        }

        // 預金種目を日本語に変換。この情報をサーバに送信しない場合（＝既存ユーザの場合）もあるので、そのときは変換もなし
        if (Object.prototype.hasOwnProperty.call(record, "deposit_Form")) {
            const ja_deposit_type = (record["deposit_Form"]["value"] === "ordinary")
                ? "普通"
                : "当座";

            record["deposit_Form"] = {"value": ja_deposit_type};
        }

        // 支払タイミングを日本語に変換
        if (Object.prototype.hasOwnProperty.call(record, "paymentTiming")) {
            const ja_payment_timing = (record["paymentTiming"]["value"] === "late")
                ? "遅払い"
                : "早払い";

            record["paymentTiming"] = {"value": ja_payment_timing};
        }

        // 不要な要素を削除
        delete record["agree"];

        return {
            app: app_id,
            record: record
        };
    };
    const payload = get_posting_payload(form_text_data, env.app_id);

    // kintoneへの登録
    // 申込みアプリの工務店IDを元に工務店マスタのレコードを参照するため、両方のアプリのAPIトークンが必要
    const API_TOKEN = `${env.api_token_record},${process.env.api_token_komuten}`;
    const kintone_post_response = await postRecord(env.app_id, API_TOKEN, payload)
        .catch((err) => {
            console.error(`kintoneレコード登録エラー：${err}`);
            throw new Error({
                status: 500,
                message: "サーバーエラーが発生しました"
            });
        });

    if (!kintone_post_response) {
        return;
    }

    return {
        status: kintone_post_response.status,
        id: kintone_post_response.data.id,
        redirect_to: env.success_redirect_to,
        record: record,
    };
}

function postRecord(app_id, token, payload) {
    // kintoneのアプリに新規レコードを登録する
    const headers = {
        "Host": `investdesign.cybozu.com:${app_id}`,
        "X-Cybozu-API-Token": token,
        "Authorization": `Basic ${token}`,
        "Content-Type": "application/json",
    };

    return axios.post("https://investdesign.cybozu.com/k/v1/record.json", payload, { headers });
}

function respond_error(res, err) {
    let res_status;
    let res_msg;

    if ("status" in err) {
        // errの内容を優先して返す
        res_status = err.status;
        res_msg = ("message" in err) ? err.message : "サーバーエラーが発生しました。";
    } else {
        // errの内容は返さず、一般的なメッセージを返す
        res_status = 500;
        res_msg = "サーバーエラーが発生しました。";
    }

    res.status(res_status).json({message: res_msg});
}

// reqのhostをCORSに設定する。固定値にしないのは、開発・本番 複数ドメインのCORSを設定するため
// 開発or本番以外のドメインからのリクエストはそもそもenvをインスタンス化出来ないのでチェックしない
function setCORS(env, res){
    // リクエスト元が開発版のフォームなら開発版のドメインを、本番のフォームなら本番のドメインを設定。
    res.set("Access-Control-Allow-Origin",`${env.host}`);
}

class Environ {
    constructor(host) {
        this.host = host;
        if (this.host === process.env.form_dev) {
            // 開発環境
            this.app_id = process.env.app_id_apply_dev;
            this.api_token_record = process.env.api_token_apply_record_dev;
            this.api_token_files = process.env.api_token_apply_files_dev;
            this.api_token_put = process.env.api_token_apply_put_dev;
            this.success_redirect_to = `${this.host}/apply_complete.html`;
        } else if (this.host === process.env.form_prod) {
            // 本番環境
            this.app_id = process.env.app_id_apply_prod;
            this.api_token_record = process.env.api_token_apply_record_prod;
            this.api_token_files = process.env.api_token_apply_files_prod;
            this.api_token_put = process.env.api_token_apply_put_prod;
            this.success_redirect_to = `${this.host}/apply_complete.html`;
        } else {
            // それ以外
            throw new Error(`invalid host: ${this.host}`);
        }
    }
}

// 別ファイルとして作成したメールのテンプレートにrecord内の変数を入れ込む
function replaceMail(template, record) {
    const pattern = /{\s*(\w+?)\s*}/g;
    return template.replace(pattern, (_, token) => {
        return record[token]["value"] || "";
    });
}

// 本来はクエリパラメータで判断すべきだが、ブラウザによって挙動が違うため、
// 預金種目の有無にて既存か新規の顧客か判断 (既存の顧客の場合、record内の預金項目のkeyがなくなる)
function isNewUser(record) {
    return Object.prototype.hasOwnProperty.call(record, "deposit_Form");
}

// SMS送信用関数
function sendSMS(to_number, subject, message, cb) {

    sns.publish({
        PhoneNumber: to_number,
        Message: message,
        MessageAttributes: {
            "AWS.SNS.SMS.SenderID" : {
                DataType : "String",
                StringValue: subject
            }
        }
    }, cb);

}
