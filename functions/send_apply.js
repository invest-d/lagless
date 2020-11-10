const functions = require("firebase-functions");
const {Storage} = require("@google-cloud/storage");

const FormData = require("form-data");
const axios = require("axios");
const { PDFDocument, PageSizes } = require("pdf-lib");

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
        // kintoneのレコードの登録時に一緒にレコードの添付ファイルとして保存する
        post_apply_record(req_body, env)
            .then((post_succeed) => {
                Promise.all(req_body.files.map((file) => delete_file(file.name)))
                    .then(() => console.log("all tempolary files are successfully deleted."))
                    .catch((name) => {
                        console.warn(`Storageにファイルが残っています： ${name} `
                            + "これはkintoneへの保存が済んでいるファイルなので、手動で削除してください。");
                    });

                // ファイル削除でエラーが出たとしてもレスポンスは続行
                res.status(post_succeed.status).json({
                    "redirect": post_succeed.redirect_to
                });
            })
            .catch((err) => {
                console.error(err);
                // ファイル名をログに出しておき、後から手動でダウンロードできるようにする
                console.error("Storageにアップロードされたままのファイルが残っています。");
                console.error(req_body.files.map((file) => file.name));
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

async function post_apply_record(req_body, env) {
    // Storageからファイルをダウンロード
    const storage = new Storage();
    const bucket = storage.bucket("lagless-apply");
    const storage_files = await Promise.all(req_body.files.map(async (target) => {
        const name = target.name;
        console.log(`getting ${name} from cloud storage ...`);
        const file = await bucket.file(name).download();
        console.log("downloaded successfully");
        // file[0] is Buffer object
        return {
            name: name,
            type: target.mime_type,
            content: file[0]
        };
    }));

    // 全ての請求書ファイルを一つのpdfファイルへマージ。他のファイルはそのまま返す
    const merge_only_invoices = async (files) => {
        // ファイル名は`${kintoneフィールド名}_{タイムスタンプ}{env}.ext`の形式なので_でsplit
        const invoice_files = files.filter((file) => file.name.split("_")[0] === "invoice");

        const generate_merged_pdf = async (files) => {
            const doc = await PDFDocument.create();

            for (const file of files) {
                const content = file.content.toString("base64");
                console.log("converting content to pdf file");
                console.log(content);
                const [page_width, page_height] = PageSizes.A4;
                if (file.type === "application/pdf") {
                    const uploaded_pdf_doc = await PDFDocument.load(content);
                    for (const page of uploaded_pdf_doc.getPages()) {
                        const embed_page = await doc.embedPage(page);
                        // マージ先の新PDFファイルのページに内接するように拡大縮小する
                        const s = Math.min((page_width/embed_page.width), (page_height/embed_page.height));
                        const new_page = doc.addPage();
                        new_page.drawPage(embed_page, {
                            xScale: s,
                            yScale: s
                        });
                    }
                } else {
                    let uploaded_image;
                    if (file.type === "image/jpeg") {
                        uploaded_image = await doc.embedJpg(content);
                    } else {
                        // pdf, jpeg, pngの3種しかないことを前提とする
                        uploaded_image = await doc.embedPng(content);
                    }

                    // pdfのページに合うように画像を拡大縮小する。写真の向きが間違っていても回転はしない
                    const scaled = uploaded_image.scaleToFit(page_width, page_height);

                    const new_page = doc.addPage(PageSizes.A4);
                    new_page.drawImage(uploaded_image, {
                        // ページ中央に画像を配置
                        x: (new_page.getWidth()/2) - (scaled.width/2),
                        y: (new_page.getHeight()/2) - (scaled.height/2),
                        width: scaled.width,
                        height: scaled.height,
                    });
                }
            }

            // doc.save() return is Uint8Array
            return {
                name: "invoice_merged.pdf",
                type: "application/pdf",
                content: Buffer.from(await doc.save()),
            };
        };
        const merged_invoice = await generate_merged_pdf(invoice_files);

        // 請求書 "以外" のファイルに、結合済み請求書ファイルを追加して返す
        const ready_to_uploads = files.filter((file) => file.name.split("_")[0] !== "invoice" );
        ready_to_uploads.push(merged_invoice);
        return ready_to_uploads;
    };
    const files_ready_to_upload = await merge_only_invoices(storage_files);

    // kintoneへファイルアップロード
    const upload_to_kintone = async (token, file) => {
        const file_name = file.name;
        console.log(`uploading ${file_name} to kintone ...`);
        const upload = (token, content, file_name) => {
            const form = new FormData();

            form.append("file", content, file_name);
            const headers = Object.assign(form.getHeaders(), {
                "X-Cybozu-API-Token": token
            });

            const config = {
                method: "post",
                url: "https://investdesign.cybozu.com/k/v1/file.json",
                data: form,
                headers: headers,
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            };

            return axios(config);
        };
        const resp = await upload(token, file.content, file_name);
        console.log(`uploaded ${file_name} to kintone successfully.`);
        return {
            "field_name": file_name.split("_")[0],
            "value": { "fileKey": resp.data.fileKey }
        };
    };
    const upload_results = await Promise.all(files_ready_to_upload.map((file) =>
        upload_to_kintone(env.api_token_files, file)
    ));

    // kintoneアプリにレコード作成
    const get_posting_payload = (upload_results) => {
        const record = {};

        const kintone_attachment_fields = Array.from(new Set(upload_results.map((r) => r.field_name)));
        for (const field of kintone_attachment_fields) {
            // fileKeyをrecordオブジェクトに紐づける
            // record.field.valueの値として配列を渡す必要があるので、.filter()を使う
            record[field] = {
                value: upload_results.filter((r) => r.field_name === field).map((r) => r.value)
            };
        }

        // フォームの入力内容を読み取る
        for (const key of Object.keys(req_body.fields)) {
            record[key]= {"value": req_body.fields[key]};
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
            app: env.app_id,
            record: record
        };
    };
    const payload = get_posting_payload(upload_results);

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
        redirect_to: env.success_redirect_to
    };
}

async function delete_file(file_name) {
    // kintoneにアップロードするため、Storageへ一時保存したファイルを削除する
    const storage = new Storage();
    const bucket = storage.bucket("lagless-apply");
    await bucket.file(file_name).delete()
        .catch((err) => {
            console.warn(err);
            throw new Error(file_name);
        });
    console.log(`file ${file_name} is successfully deleted.`);
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
