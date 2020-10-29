const functions = require("firebase-functions");
const {Storage} = require("@google-cloud/storage");

const FormData = require("form-data");
const axios = require("axios");

exports.send_apply = functions.https.onRequest((req, res) => {
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

    console.log(url);

    return url;
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
