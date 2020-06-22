const functions = require("firebase-functions");

const Busboy = require("busboy");

const sendgrid = require("@sendgrid/mail");

exports.ke_ban_form = functions.https.onRequest(async (req, res) => {
    if (req.method != "POST") {
        res.status(405).json({message: "Method Not Allowed"});
        return;
    }

    console.log(`KE-BAN:requested from ${String(req.headers.referer)}`);

    // 開発環境か、もしくは本番環境のトークン等の各種データを取得。それ以外のドメインの場合は例外をthrow
    const env = new Environ(req.headers.referer);

    setCORS(env, res);

    console.log("KE-BAN:フォームデータ受信");
    const message = {};
    message.text = "";
    message.attachments = [];

    const fieldname_dict = {
        company: "会社名・屋号名",
        phone: "電話番号",
        mail: "メールアドレス",
        postalCode: "郵便番号",
        prefecture: "都道府県",
        address: "住所",
        streetAddress: "番地・建物名・部屋番号",
        representative: "代表者名",
        closingDayFrom: "前払いを希望する稼働期間（開始日）",
        closingDayTo: "前払いを希望する稼働期間（終了日）",
        bankCode_Form: "金融機関コード",
        bankName_Form: "金融機関名",
        branchCode_Form: "支店コード",
        branchName_Form: "支店名",
        deposit_Form: "預金種目",
        deposit_type: {
            ordinary: "普通",
            current: "当座"
        },
        accountNumber_Form: "口座番号",
        accountName_Form: "口座名義",
        agree: "利用規約に同意する"
    };

    const busboy = new Busboy({ headers: req.headers });
    const allowMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        if (String(mimetype) === "application/octet-stream") {
            // 添付ファイルが未入力の場合（application/octet-stream）はスルー
            // 未入力はそもそもフォームでバリデーションをかけているが、2回目以降のフォームの場合は運転免許証画像の欄が未入力のまま送信されてくる。スルーでよい。
            file.resume();
        } else {
            if (!allowMimeTypes.includes(mimetype.toLocaleLowerCase())) {
                console.error("unexpected mimetype.");
                console.error(mimetype);
                respond_error(res, `添付ファイルは ${allowMimeTypes.map((t) => t.split("/")[1])} のいずれかの形式で送信してください。`);
            } else {
                // 添付ファイルをbase64エンコードする
                const file_name = `${fieldname}.${String(mimetype).split("/")[1]}`;
                file.on("data", (data) => {
                    const buffer = Buffer.from(data);
                const file_encoded = buffer.toString("base64");
                message.attachments.push({
                    filename: file_name,
                    content: file_encoded,
                    type: mimetype.toLocaleLowerCase(),
                    disposition: "attachment"
                });
                });
            }
        }
    });
    busboy.on("field", (fieldname, val, fieldnameTruncated, valTruncated) => {
        const value = (() => {
            // 預金種目の場合に限り "普通" or "当座" に変換する
            if (val in fieldname_dict["deposit_type"]) {
                return fieldname_dict["deposit_type"][val];
            } else {
                return val;
            }
        })();
        message.text = `${message.text}\n${fieldname_dict[fieldname]}: ${value}`;
    });
    busboy.on("finish", async () => {
        message.from = env.from_address;
        message.to = env.to_address;
        message.cc = env.cc_address;
        message.subject = "軽バンドットコム登録ドライバー様より前払いのお申し込みがありました。";
        if (message.attachments.length == 0) {
            delete message.attachments;
        }

        sendgrid.setApiKey(process.env.wfi_sendgrid_api_key);
        await sendgrid.send(message)
            .catch((error) => {
                console.error(`KE-BAN:メール送信エラー：${JSON.stringify(error)}`);
                respond_error(res, error);
            });
        res.status(200).json({
            "redirect": env.success_redirect_to
        });
    });
    busboy.end(req.rawBody);
});

function respond_error(res, error) {
    const res_status = ("status" in error) ? error.status : 500;
    const res_msg = ("message" in error) ? error.message : "サーバーエラーが発生しました。";
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

        if (this.host === process.env.form_wfi_dev) {
            // 開発環境
            // 申込内容をメールで送信する
            this.from_address      = process.env.wfi_dev_from_address;
            this.to_address        = process.env.wfi_dev_to_address;
            this.cc_address        = process.env.wfi_dev_cc_address;

            // ゆくゆくはメール送信ではなくkintoneにデータを入れる予定
            // this.app_id = process.env.app_id_apply_dev;
            // this.api_token_record = process.env.api_token_apply_record_dev;
            // this.api_token_files = process.env.api_token_apply_files_dev;
            this.success_redirect_to = `https://${this.host}/apply_complete.html`;
        } else if (this.host === process.env.form_wfi_prod) {
            // 本番環境
            this.from_address      = process.env.wfi_prod_from_address;
            this.to_address        = process.env.wfi_prod_to_address;
            this.cc_address        = process.env.wfi_prod_cc_address;

            // this.app_id = process.env.app_id_apply_prod;
            // this.api_token_record = process.env.api_token_apply_record_prod;
            // this.api_token_files = process.env.api_token_apply_files_prod;
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
