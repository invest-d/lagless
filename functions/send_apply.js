const functions = require("firebase-functions");
const {Storage} = require("@google-cloud/storage");

const {PubSub} = require("@google-cloud/pubsub");
const file_process_topic = "attach_apply_files";

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

                // ファイルの処理はPubSubに任せて、レスポンスを完了させる
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

        // kintoneへの登録が失敗した場合、最悪あとから手動でレコード登録できるようにログに残しておく
        console.log("posting record is ...");
        console.log(record);

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
        redirect_to: env.success_redirect_to
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
