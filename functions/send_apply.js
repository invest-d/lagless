const functions = require("firebase-functions");

const Busboy = require("busboy");
const FormData = require("form-data");
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

exports.send_apply = functions.https.onRequest((req, res) => {
    postToKintone(req, res)
        .then(async (post_succeed) => {
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
            if (!checkUser(post_succeed.record)) {
                post_succeed.record["deposit_Form"] = {"value": ""};
            }

            const number = post_succeed.record["phone"]["value"].replace(0, "+81");
            let subject = "dandoliPay";
            // 登録情報のメールアドレスが空欄の時のみ、SMSを送信
            if (!post_succeed.record["mail"]["value"]) {
                if (productName=="リノベ不動産Payment") subject = "renovePay";
                if (productName=="ラグレス") subject = "lagless";
                sendSMS(number, subject, replaceMail(SMS_text, post_succeed.record), (err, result) => {
                    console.log("RESULTS: ",err,result);
                });
            }
            else 
            {
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
            }

            res.status(post_succeed.status).json({
                "redirect": post_succeed.redirect_to
            });
        })
        .catch((err) => {
            console.error(err);
            respond_error(res, err);
        });
});

function postToKintone(req, res) {
    return new Promise((resolve, reject) => {
        if (req.method != "POST") {
            return reject({
                status: 405,
                message: "Method Not Allowed"
            });
        }

        console.log(`requested from ${String(req.headers.origin)}`);

        // 開発環境か、もしくは本番環境のトークン等の各種データを取得。それ以外のドメインの場合は例外をthrow
        let env;
        try {
            env = new Environ(req.headers.origin);
        } catch (e) {
            console.error(e);
            return reject({
                status: 400,
                message: "無効なリクエストです"
            });
        }
        setCORS(env, res);

        const record = {};

        const busboy = new Busboy({ headers: req.headers });
        const validMimeTypes = {
            "application/pdf": "pdf",
            "image/jpeg": "jpg",
            "image/png": "png"
        };
        const file_uploads = [];

        let postable = true;

        // 申込フォームから送信した添付ファイルの処理
        busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
            const is_valid_mimetype = Object.keys(validMimeTypes).includes(mimetype.toLocaleLowerCase());

            const buffer = [];
            file.on("data", (chunk) => {
                buffer.push(Buffer.from(chunk));
            });

            file.on("end", () => {
                const attachment = Buffer.concat(buffer);
                const has_zero_filesize = (attachment.length === 0);

                if (has_zero_filesize && !is_valid_mimetype) {
                    // 2回目以降のフォームからの送信を想定。入力しなくて良い添付ファイルの項目があるため、サーバー側でもその項目を無視して次のfileの読み取りに進む
                    file.resume();
                } else if (has_zero_filesize && is_valid_mimetype) {
                    // 何かしら有効なファイルを添付しようとしたが、何らかの理由でファイルサイズがゼロの場合を想定。エラー
                    postable = false;
                    file.resume();
                    busboy.end();
                    return reject({
                        status: 400,
                        message: "添付ファイルを読み取れませんでした。ファイルが破損していないか確認し、もう一度お試しください。"
                    });
                } else if (!has_zero_filesize && !is_valid_mimetype) {
                    // ファイルを添付しようとしたが、業務上受け付けできる形式（pdf/jpg/png）ではなかった場合を想定。エラー
                    postable = false;
                    console.error(`unexpected mimetype: ${mimetype}.`);
                    file.resume();
                    busboy.end();
                    return reject({
                        status: 400,
                        message: `添付ファイルは ${Object.keys(validMimeTypes)} のいずれかの形式で送信してください。`
                    });
                } else if (!has_zero_filesize && is_valid_mimetype) {
                    // 受け付け可能なファイルを想定。kintoneへのファイルアップロード状況をpromiseとして生成
                    const ext = validMimeTypes[mimetype.toLocaleLowerCase()];
                    file_uploads.push(uploadToKintone(env.api_token_files, attachment, `${fieldname}.${ext}`)
                        .then((resp) => {
                            return {
                                "fieldname": fieldname,
                                "value": [{"fileKey": resp.data.fileKey}]
                            };
                        }));
                }
            });
        });

        // 添付ファイル以外の項目の処理
        busboy.on("field", (fieldname, val, fieldnameTruncated, valTruncated) => {
            // フォームへの入力値valを、kintoneアプリに入る形に整えつつrecordオブジェクトに渡す
            record[fieldname]= {"value": val};
        });

        // フォームからの送信内容を全て読み取った後の処理
        busboy.on("finish", async () => {
            if (postable) {
                // ファイルアップロードが全て終わってから、kintoneへのレコード登録を行う。
                const results = await Promise.all(file_uploads)
                    .catch((err) => {
                        console.error(`kintoneファイルアップロードエラー：${err}`);
                        busboy.end();
                        reject({status: 500, message: "不明なエラーが発生しました。"});
                    });

                results.forEach((result) => { record[result["fieldname"]] = {"value": result["value"]}; });

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

                // sendObjと結合してkintoneにレコード登録可能な形に整える
                const sendObj = {};
                sendObj.app = env.app_id;
                sendObj["record"] = record;
                console.log("generate sendObj completed.");
                console.log(JSON.stringify(sendObj));

                // kintoneへの登録開始
                // 申込みアプリの工務店IDを元に工務店マスタのレコードを参照するため、両方のアプリのAPIトークンが必要
                const API_TOKEN = `${env.api_token_record},${process.env.api_token_komuten}`;
                const kintone_post_response = await postRecord(env.app_id, API_TOKEN, sendObj)
                    .catch((err) => {
                        console.error(`kintoneレコード登録エラー：${err}`);
                        reject({
                            status: 500,
                            message: "サーバーエラーが発生しました"
                        });
                    });

                resolve({
                    status: kintone_post_response.status,
                    redirect_to: env.success_redirect_to,
                    record: record
                });
            } else {
                // 念のためのreject
                reject({
                    status: 500,
                    message: "サーバーエラーが発生しました"
                });
            }
        });

        busboy.end(req.rawBody);
    });
}

function uploadToKintone(token, attachment, filename) {
    const form = new FormData();

    form.append("file", attachment, filename);
    const headers = Object.assign(form.getHeaders(), {
        "X-Cybozu-API-Token": token
    });

    return axios.post("https://investdesign.cybozu.com/k/v1/file.json", form, { headers });
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
    res.set("Access-Control-Allow-Origin","http://localhost:5000");
}

class Environ {
    constructor(host) {
        this.host = host;
        if (this.host === "http://localhost:5000") {
            // 開発環境
            this.app_id = process.env.app_id_apply_dev;
            this.api_token_record = process.env.api_token_apply_record_dev;
            this.api_token_files = process.env.api_token_apply_files_dev;
            this.success_redirect_to = `${this.host}/apply_complete.html`;
        } else if (this.host === process.env.form_prod) {
            // 本番環境
            this.app_id = process.env.app_id_apply_prod;
            this.api_token_record = process.env.api_token_apply_record_prod;
            this.api_token_files = process.env.api_token_apply_files_prod;
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
function checkUser(record) {
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
