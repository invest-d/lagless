const functions = require("firebase-functions");

const Busboy = require("busboy");
const FormData = require("form-data");
const axios = require("axios");

exports.send_apply = functions.https.onRequest((req, res) => {
    postToKintone(req, res)
        .then((post_succeed) => {
            res.status(post_succeed.status).json({
                "redirect": post_succeed.redirect_to
            });
        })
        .catch((err) => {
            respond_error(res, err);
        });
});

function postToKintone(req, res) {
    return new Promise((resolve, reject) => {
        if (req.method != "POST") {
            reject({
                status: 405,
                message: "Method Not Allowed"
            });
        }

        console.log(`requested from ${String(req.headers.referer)}`);

        // 開発環境か、もしくは本番環境のトークン等の各種データを取得。それ以外のドメインの場合は例外をthrow
        const env = new Environ(req.headers.referer);
        setCORS(env, res);

        const record = {};

        const busboy = new Busboy({ headers: req.headers });
        const allowMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
        const file_uploads = [];
        busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
            // 請求書データ等のファイルアップロード
            if (String(mimetype) === "application/octet-stream") {
                // 添付ファイルが未入力の場合（application/octet-stream）はスルー
                // 未入力はそもそもフォームでバリデーションをかけているが、2回目以降のフォームの場合は運転免許証画像の欄が未入力のまま送信されてくる。スルーでよい。
                file.resume();
            } else {
                const upload = new Promise((resolve, reject) => {
                    if (!allowMimeTypes.includes(mimetype.toLocaleLowerCase())) {
                        console.error("unexpected mimetype.");
                        console.error(mimetype);
                        reject({status: 406, message: `添付ファイルは ${allowMimeTypes.map((t) => t.split("/")[1])} のいずれかの形式で送信してください。`});
                    } else {
                        const ext = String(mimetype).split("/")[1];
                        uploadToKintone(env.api_token_files, file, `${fieldname}.${ext}`)
                            .then((result) => {
                                resolve({
                                    "fieldname": fieldname,
                                    "value": [{"fileKey": result.data.fileKey}]
                                });
                            })
                            .catch((err) => {
                                console.error("file upload error.");
                                console.error(err);
                                reject({status: 500, message: "不明なエラーが発生しました。"});
                            });
                    }
                });

                file_uploads.push(upload);
            }
        });

        // 添付ファイル以外の項目の処理
        busboy.on("field", (fieldname, val, fieldnameTruncated, valTruncated) => {
            // フォームへの入力値valを、kintoneアプリに入る形に整えつつrecordオブジェクトに渡す
            record[fieldname]= {"value": val};
        });

        // フォームからの送信内容を全て読み取った後の処理
        busboy.on("finish", async () => {
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
                    reject(err);
                });

            resolve({
                status: kintone_post_response.status,
                redirect_to: env.success_redirect_to
            });
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
    const res_status = ("status" in err) ? err.status : 500;
    const res_msg = ("message" in err) ? err.message : "サーバーエラーが発生しました。";
    res.status(res_status).json({message: res_msg});
}

// reqのhostをCORSに設定する。固定値にしないのは、開発・本番 複数ドメインのCORSを設定するため
// 開発or本番以外のドメインからのリクエストはそもそもenvをインスタンス化出来ないのでチェックしない
function setCORS(env, res){
    // リクエスト元が開発版のフォームなら開発版のドメインを、本番のフォームなら本番のドメインを設定。
    res.set("Access-Control-Allow-Origin",`https://${env.host}`);
}

class Environ {
    constructor(referer) {
        this.host = extractHostDomain(referer);

        if (this.host === process.env.form_dev) {
            // 開発環境
            this.app_id = process.env.app_id_apply_dev;
            this.api_token_record = process.env.api_token_apply_record_dev;
            this.api_token_files = process.env.api_token_apply_files_dev;
            this.success_redirect_to = `https://${this.host}/apply_complete.html`;
        } else if (this.host === process.env.form_prod) {
            // 本番環境
            this.app_id = process.env.app_id_apply_prod;
            this.api_token_record = process.env.api_token_apply_record_prod;
            this.api_token_files = process.env.api_token_apply_files_prod;
            this.success_redirect_to = `https://${this.host}/apply_complete.html`;
        }
        else {
            // それ以外
            throw new Error(`invalid host: ${ this.host}`);
        }
    }
}

function extractHostDomain(url) {
    // スラッシュで区切ってドメイン部分とポート番号を抜き出す
    const domain_and_port = (url.indexOf("://") > -1)
        ? url.split("/")[2]
        : url.split("/")[0];

    // ドメイン部分だけ抜き出す
    return domain_and_port.split(":")[0];
}
