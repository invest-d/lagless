const functions = require("firebase-functions");
const {Storage} = require("@google-cloud/storage");
const file_process_topic = process.env.attach_files_topic_name;
// const file_process_sub = "attach_apply_files_sub";

const { PDFDocument, PageSizes } = require("pdf-lib");
const FormData = require("form-data");
const axios = require("axios");
/**
* @typedef KintonePutRecordResponse
* @property {string} revision
*/

/**
* @typedef FileUploadResult
* @property {string} name - file name
* @property {string} mime_type
*/

// Publishされたメッセージを読み取り、ファイルの変換とkintoneへのアップロードを行う
exports.attach_apply_files = functions.pubsub.topic(file_process_topic).onPublish(async (raw_message) => {
    /**
    * @typedef {Object} Message
    * @property {Object} env - envinronment variables initialized in send_apply.js
    * @property {FileUploadResult[]} files
    * @property {string} record_id - the target record id in kintone to attach files
    */
    /** @type {Message} */
    const message = JSON.parse(Buffer.from(raw_message.data, "base64").toString());

    /**
    * @typedef {Object} Tokens
    * @property {string} file - kintoneへのファイルアップロードAPIトークン
    * @property {string} put - kintoneへのPUTレコードAPIトークン
    */
    /** @type {Tokens} */
    const tokens = {
        file: message.env.api_token_files,
        put: message.env.api_token_put,
    };
    const invoice_files = message.files.filter((file) => file.name.startsWith("invoice"));
    const driver_license_files = message.files.filter((file) => file.name.startsWith("driverLicense"));
    const result = await Promise.all([
        attach_invoices(tokens, invoice_files, message.env.app_id, message.record_id),
        attach_identifications(tokens, driver_license_files, message.env.app_id, message.record_id),
    ])
        .catch((err) => {
            console.error(err);
            console.error("申込を受け付けましたが、請求書ファイル等の処理を完了できませんでした。\n"
                + `以下のファイルを手動でStorageからダウンロードして申込レコードID: ${message.record_id}に添付し、Storageから削除してください。\n`
                + `${message.files.map((file) => file.name)}`);
        });

    if (!result) {
        return;
    }

    // Storageからファイル削除
    Promise.all(message.files.map((file) => delete_file(file.name)))
        .then(() => console.log("all tempolary files are successfully deleted."))
        .catch((name) => {
            console.warn(`Storageにファイルが残っています： ${name} `
                + "これはkintoneへの保存が済んでいるファイルなので、手動で削除してください。");
        });
});

/**
* 申込フォームで送信された請求書ファイルをkintoneのレコードに添付する
* @param {Tokens} tokens
* @param {FileUploadResult[]} target_files
* @param {string} app_id - kintone application id storing LagLess applies
* @param {string} target_record_id
* @return {Promise<KintonePutRecordResponse>}
*/
async function attach_invoices(tokens, target_files, app_id, target_record_id) {
    const invoice_files = await Promise.all(target_files.map(async (target) => {
        const file = await get_file_from_storage(target.name);
        // file[0] is Buffer object
        return {
            name: target.name,
            type: target.mime_type,
            content: file[0]
        };
    }));
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
    return attach_to_kintone(tokens, merged_invoice, app_id, target_record_id);
}

/**
* @typedef {Object} UploadFileInfo
* @property {string} name
* @property {string} type
* @property {Buffer} content
*/

/**
* 本人確認書類をkintoneにアップロードする
* @async
* @param {Tokens} tokens
* @param {FileUploadResult[]} target_files
* @param {string} app_id
* @param {string} target_record_id
* @return {Promise<KintonePutRecordResponse[]>}
*/
async function attach_identifications(tokens, target_files, app_id, target_record_id) {
    if (target_files.length === 0) {
        // ファイルがアップロードされていない場合もある
        return;
    }

    /** @type {UploadFileInfo} */
    const identification_files = await Promise.all(target_files.map(async (target) => {
        const file = await get_file_from_storage(target.name);
        return {
            name: target.name,
            type: target.mime_type,
            content: file[0]
        };
    }));

    return Promise.all(
        identification_files.map((file) => attach_to_kintone(tokens, file, app_id, target_record_id))
    );
}

function get_file_from_storage(file_name) {
    const storage = new Storage();
    const bucket = storage.bucket("lagless-apply");
    return bucket.file(file_name).download();
}

/**
 * @typedef {Object} UploadToKintoneResult
 * @property {string} field_name
 * @property {string} fileKey
*/

/**
* kintoneへのアップロードと、アップロードしたファイルのレコードへの紐付けを行う。
* @async
* @summary If the description is long, write your summary here. Otherwise, feel free to remove this.
* @param {ParamDataTypeHere} parameterNameHere - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @param {UploadFileInfo} file
* @return {Promise<KintonePutRecordResponse>}
*/
async function attach_to_kintone(tokens, file, app_id, record_id) {
    /**
    * ファイルをkintoneサーバーにアップロードする
    * @async
    * @param {string} token_file - api token that is used to uploading files
    * @param {UploadFileInfo} file
    * @return {Promise<UploadToKintoneResult>}
    */
    const upload_to_kintone = async (token_file, file) => {
        const form = new FormData();
        form.append("file", file.content, file.name);
        const headers = Object.assign(form.getHeaders(), {
            "X-Cybozu-API-Token": token_file
        });

        const config = {
            method: "post",
            url: "https://investdesign.cybozu.com/k/v1/file.json",
            data: form,
            headers: headers,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        };
        const resp = await axios(config);

        return {
            "field_name": file.name.split("_")[0],
            "fileKey": resp.data.fileKey,
        };
    };
    const upload_result = await upload_to_kintone(tokens.file, file);

    /**
    * kintoneサーバーにアップロードしたファイルのfileKeyを、特定レコードの添付ファイルフィールドにPUTする
    * @async
    * @param {string} token_put
    * @param {string} app_id
    * @param {string} record_id
    * @param {UploadToKintoneResult} upload_result
    * @return {KintonePutRecordResponse}
    */
    const add_file_key_to_record = async (token_put, app_id, record_id, upload_result) => {
        const headers = {
            "Host": `investdesign.cybozu.com:${app_id}`,
            "X-Cybozu-API-Token": token_put,
            "Authorization": `Basic ${token_put}`,
            "Content-Type": "application/json",
        };

        const record = {
            [upload_result.field_name]: {
                "value": [
                    {
                        "fileKey": upload_result.fileKey
                    }
                ]
            }
        };
        const payload = {
            "app": app_id,
            "id": record_id,
            "record": record,
        };

        return axios.put("https://investdesign.cybozu.com/k/v1/record.json", payload, { headers });
    };
    return add_file_key_to_record(tokens.put, app_id, record_id, upload_result);
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
