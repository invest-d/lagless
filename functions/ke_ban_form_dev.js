const functions = require("firebase-functions");

const FormData = require("form-data");
const Busboy = require("busboy");
const axios = require("axios");

const sendgrid = require("@sendgrid/mail");

const fs = require("fs");
const path = require("path");

const dayjs = require("dayjs");
dayjs.locale("ja");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const holiday_jp = require("@holiday-jp/holiday_jp");

// kintone工務店マスタに登録している工務店データ一覧。締日ごとに異なるレコードを保存している。
const KE_BAN_RECORDS_BY_CLOSING = {
    "05": { ID: "400", NAME: "株式会社ワールドフォースインターナショナル" },
    "10": { ID: "401", NAME: "株式会社ワールドフォースインターナショナル" },
    "15": { ID: "402", NAME: "株式会社ワールドフォースインターナショナル" },
    "20": { ID: "403", NAME: "株式会社ワールドフォースインターナショナル" },
    "25": { ID: "404", NAME: "株式会社ワールドフォースインターナショナル" },
};

const APP_ID_KYORYOKU               = "88";
const fieldRecordId_KYORYOKU        = "レコード番号";
const fieldID_KYORYOKU              = "支払企業No_";
const fieldDriverID_KYORYOKU        = "kebanID";
const fieldConstructorID_KYORYOKU   = "工務店ID";
const fieldCommonName_KYORYOKU      = "支払先";
const fieldOfficialName_KYORYOKU    = "支払先正式名称";
const fieldEmail_KYORYOKU           = "メールアドレス";

const fieldPaymentDate_APPLY        = "paymentDate";

exports.ke_ban_form_dev = functions.https.onRequest(async (req, res) => {
    if (req.method != "POST") {
        res.status(405).json({message: "Method Not Allowed"});
        return;
    }

    console.log(`KE-BAN:requested from ${String(req.headers.referer)}`);

    // 開発環境か、もしくは本番環境のトークン等の各種データを取得。それ以外のドメインの場合は例外をthrow
    const env = new Environ(req.headers.referer);

    setCORS(env, res);

    console.log("KE-BAN:フォームデータ受信");

    let is_valid_apply = true;

    const validMimeTypes = {
        "application/pdf": "pdf",
        "image/jpeg": "jpg",
        "image/png": "png"
    };

    // メール送信用
    const internal_message = {};
    internal_message.text = "";
    internal_message.attachments = [];
    const auto_reply_message = {};
    auto_reply_message.attachments = [];
    const fieldname_dict = {
        kebanID: "軽バンドットコムドライバーID",
        company: "会社名・屋号名",
        phone: "電話番号",
        mail: "メールアドレス",
        postalCode: "郵便番号",
        prefecture: "都道府県",
        address: "住所",
        streetAddress: "番地・建物名・部屋番号",
        representative: "代表者名",
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
        agree: "利用規約に同意する",
        targetTerm: "前払いを希望する稼働期間"
    };

    // kintone保存用
    const form_data = {};
    const file_upload_processes = [];

    const busboy = new Busboy({ headers: req.headers });

    try {
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
                    is_valid_apply = false;
                    file.resume();
                    busboy.end();
                    throw new Error(JSON.stringify({
                        status: 400,
                        message: "添付ファイルを読み取れませんでした。ファイルが破損していないか確認し、もう一度お試しください。"
                    }));
                } else if (!has_zero_filesize && !is_valid_mimetype) {
                    // ファイルを添付しようとしたが、業務上受け付けできる形式（pdf/jpg/png）ではなかった場合を想定。エラー
                    is_valid_apply = false;
                    console.error(`unexpected mimetype: ${mimetype}.`);
                    file.resume();
                    busboy.end();
                    throw new Error(JSON.stringify({
                        status: 400,
                        message: `添付ファイルは ${Object.keys(validMimeTypes)} のいずれかの形式で送信してください。`
                    }));
                } else if (!has_zero_filesize && is_valid_mimetype) {
                    // 受け付け可能なファイルを想定。①自動返信メールへファイルを添付し、②kintoneへのファイルアップロード状況をpromiseとして生成する
                    const ext = validMimeTypes[mimetype.toLocaleLowerCase()];
                    const file_name = `${fieldname}.${ext}`;

                    const file_encoded = attachment.toString("base64");
                    const file = {
                        filename: file_name,
                        content: file_encoded,
                        type: mimetype.toLocaleLowerCase(),
                        disposition: "attachment"
                    };
                    internal_message.attachments.push(file);
                    auto_reply_message.attachments.push(file);

                    file_upload_processes.push(uploadToKintone(env.api_token_files, attachment, file_name)
                        .then((resp) => {
                            return {
                                "fieldname": fieldname,
                                "value": [{"fileKey": resp.data.fileKey}]
                            };
                        }));
                }
            });
        });

        // eslint-disable-next-line no-unused-vars
        busboy.on("field", (fieldname, val, fieldnameTruncated, valTruncated) => {
            const value = (() => {
                // 預金種目の場合に限り "普通" or "当座" に変換する
                if (val in fieldname_dict["deposit_type"]) {
                    return fieldname_dict["deposit_type"][val];
                } else {
                    return val;
                }
            })();
            internal_message.text = `${internal_message.text}\n${fieldname_dict[fieldname]}: ${value}`;

            form_data[fieldname] = value;
        });

        busboy.on("finish", async () => {
            if (is_valid_apply) {
                const upload_results = await Promise.all(file_upload_processes)
                    .catch((err) => {
                        console.error(`kintoneファイルアップロードエラー: ${err}`);
                        busboy.end();
                        throw new Error(JSON.stringify({status: 500, mesasge: "不明なエラーが発生しました。"}));
                    });
                upload_results.forEach((result) => form_data[result["fieldname"]] = result["value"]);

                // 社内向けの申込受付通知
                internal_message.from = env.from_address;
                internal_message.to = env.to_address;
                internal_message.cc = env.cc_address;
                internal_message.subject = "軽バンドットコム登録ドライバー様より前払いのお申し込みがありました。";
                if (internal_message.attachments.length == 0) {
                    delete internal_message.attachments;
                }

                sendgrid.setApiKey(process.env.wfi_sendgrid_api_key);
                console.log(`sending internal notification... To: ${internal_message.to}, Cc: ${internal_message.cc}`);
                await sendgrid.send(internal_message)
                    .catch((error) => {
                        console.error(`KE-BAN:社内通知メール送信エラー：${JSON.stringify(error)}`);
                        respond_error(res, error);
                    });

                // 申込者向けの、申込受付自動返信メール
                // script by https://nju33.com/javascript/%E6%97%A5%E6%9C%AC%E6%99%82%E9%96%93%E3%82%92%E5%8F%96%E5%BE%97
                const jst_now = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
                form_data["date_now"] = `${jst_now.getFullYear()}年 ${jst_now.getMonth()+1}月 ${jst_now.getDate()}日`;
                auto_reply_message.from = env.from_address;
                auto_reply_message.to = form_data["mail"];
                auto_reply_message.cc = env.cc_address;
                auto_reply_message.subject = "【軽バン.COM前払い事務局】お申込みいただきありがとうございます。";
                const auto_reply_text = fs.readFileSync(path.join(__dirname, "autoMailKeBan_template.txt"), "utf8");
                auto_reply_message.text = substituteTemplate(auto_reply_text, form_data);
                if (auto_reply_message.attachments.length == 0) {
                    delete auto_reply_message.attachments;
                }
                console.log(`sending auto reply... To: ${auto_reply_message.to}, Cc: ${auto_reply_message.cc}`);
                await sendgrid.send(auto_reply_message)
                    .catch((error) => {
                        // このメールは最悪届かなくてもオペレーションを続行できるため、フロントにはエラーを返さない
                        console.error(`KE-BAN:申込受付自動返信メール送信エラー：${JSON.stringify(error)}`);
                    });

                // kintoneレコード登録
                await post_apply_record(form_data, env)
                    .catch((err) => {
                        console.error("KE_BAN: メール送信は成功しましたが、kintoneへの登録に失敗しました。手動でkintoneへ登録してください。");
                        console.error(err);
                        console.error("form_data", form_data);
                        console.error("kintone uploaded filekeys", upload_results);
                    });

                res.status(200).json({
                    "redirect": env.success_redirect_to
                });
            } else {
                // 念のため
                throw new Error(JSON.stringify({
                    status: 500,
                    message: "サーバーエラーが発生しました"
                }));
            }
        });

        busboy.end(req.rawBody);
    } catch (err) {
        let e;
        try {
            e = JSON.parse(err);
        } catch (err) {
            // JSONとして解釈できないエラーの場合はそのまま受け取る
            e = err;
        }
        respond_error(res, e);
    }

});

function uploadToKintone(token, attachment, filename) {
    const form = new FormData();

    form.append("file", attachment, filename);
    const headers = Object.assign(form.getHeaders(), {
        "X-Cybozu-API-Token": token
    });

    return axios.post("https://investdesign.cybozu.com/k/v1/file.json", form, { headers });
}

const post_apply_record = async (form_data, env) => {
    const get_kyoryoku_id = async (driver_id, name, email) => {
        // eslint-disable-next-line no-irregular-whitespace
        const deleteSpaces = (s) => {return s.replace(/ /g, "").replace(/　/g, "");};
        const compareWithName = (kintone_record) => {
            // FIXME: compareWithNameに直接name変数を渡せるようにしたい
            const is_same_name = deleteSpaces(kintone_record[fieldCommonName_KYORYOKU]["value"]) === deleteSpaces(name) ||
                deleteSpaces(kintone_record[fieldOfficialName_KYORYOKU]["value"]) === deleteSpaces(name);
            if (!is_same_name) {
                console.warn(`kintoneに登録した氏名とフォームに入力した氏名が異なります。kintone: ${kintone_record[fieldOfficialName_KYORYOKU]["value"]}, フォーム: ${name}`);
            }
            return is_same_name;
        };
        const in_query_constructors = Object.values(KE_BAN_RECORDS_BY_CLOSING).map((r) => `"${r.ID}"`).join(",");

        // ドライバーIDを条件にして協力会社マスタを検索し、協力会社IDを得る。
        console.log("ドライバーIDを元に協力会社マスタを検索...");
        const payload_compare_id = {
            app: APP_ID_KYORYOKU,
            fields: [
                fieldRecordId_KYORYOKU,
                fieldID_KYORYOKU,
                fieldCommonName_KYORYOKU,
                fieldOfficialName_KYORYOKU
            ],
            query: `${fieldConstructorID_KYORYOKU} in (${in_query_constructors})`
                + `and ${fieldDriverID_KYORYOKU} = "${driver_id}"`
        };
        const kintone_data_driver_id = await getRecord(APP_ID_KYORYOKU, process.env.api_token_kyoryoku, payload_compare_id);
        // 取得したデータはそのまま返さず、一応チェックする（IDの記入ミスの可能性があるため）
        const result_from_id = kintone_data_driver_id.data.records.filter(compareWithName);

        if (result_from_id.length === 1) {
            console.log("kintone内に登録情報が見つかりました。");
            return result_from_id[0][fieldID_KYORYOKU]["value"];
        }

        // ドライバーIDでマスタ情報が見つからない場合は名前とメールアドレスを条件にして協力会社マスタを検索し、協力会社IDを得る。
        console.log("ドライバー氏名とメールアドレスを元に協力会社マスタを検索...");
        const payload_compare_name = {
            app: APP_ID_KYORYOKU,
            fields: [
                fieldRecordId_KYORYOKU,
                fieldID_KYORYOKU,
                fieldCommonName_KYORYOKU,
                fieldOfficialName_KYORYOKU
            ],
            query: `${fieldConstructorID_KYORYOKU} in (${in_query_constructors})`
                + `and ${fieldEmail_KYORYOKU} = "${email}"`
        };
        const kintone_data_name = await getRecord(APP_ID_KYORYOKU, process.env.api_token_kyoryoku, payload_compare_name);

        // kintone保存の氏名データからwhitespaceを取り除いて比較
        const result_from_name = kintone_data_name.data.records.filter(compareWithName);

        if (result_from_name.length === 1) {
            console.log(`kintone内に登録情報が見つかりました。ドライバーIDの追加入力を推奨します。協力会社マスタレコード番号: ${result_from_name[0][fieldRecordId_KYORYOKU]["value"]}`);
            return result_from_name[0][fieldID_KYORYOKU]["value"];
        } else {
            // それでも見つからなかったり、重複している場合はnullを返す
            if (result_from_name.length === 0) {
                console.warn(`協力会社マスタに未登録のドライバーです: "${name}", "${email}"`);
            } else {
                const ids = result_from_name.map((r) => `"${r[fieldRecordId_KYORYOKU]["value"]}"`).join(",");
                console.warn(`協力会社マスタに重複して登録されているドライバーです: "${name}", "${email}"。レコード番号: ${ids}`);
            }
            return null;
        }
    };

    const pat = new RegExp("から(\\d{4}年\\d{1,2}月\\d{1,2}日)まで");
    const getPaymentDate = (term_string) => {
        const closing_string = pat.exec(term_string);
        if (!closing_string) {
            console.log(`フォームの入力内容から締め日の特定に失敗。入力内容: ${term_string}`);
            return null;
        }
        const closing_date = dayjs(closing_string[1], "YYYY年M月D日");
        console.log(`申込の締め日: ${closing_date.format("YYYY年MM月DD日(ddd)")}`);

        // FIXME: 次の営業日を求める関数がフロントエンドにもある。共通化したい
        const getNextBusinessDate = (base_date) => {
            // base_dateの翌日以降の営業日を取得する。
            let next_date = base_date.add(1, "day");

            const is_holiday = (date) => {
                // 土日は非営業日
                if ([0, 6].includes(date.day())) {
                    return true;
                }

                // 祝日は非営業日
                if (holiday_jp.isHoliday(date.toDate())) {
                    return true;
                }

                // FIXME: カスタム休日にも対応する
                return false;
            };

            while (is_holiday(next_date)) {
                next_date = next_date.add(1, "day");
            }

            return next_date;
        };

        // 支払日 = 締日+4営業日
        const payment_date = ((closing_date) => {
            let base_date = closing_date;
            let next_business_date;
            for (let i = 0; i < 4; i++) {
                next_business_date = getNextBusinessDate(base_date);
                console.log(`締め日 + ${i+1}営業日: ${next_business_date.format("YYYY年MM月DD日(ddd)")}`);
                base_date = next_business_date;
            }

            return next_business_date;
        })(closing_date);

        return payment_date;
    };

    const get_posting_payload = async (form_data, app_id) => {
        const kyoryoku_id = await get_kyoryoku_id(form_data["kebanID"], form_data["company"], form_data["mail"]);
        if (kyoryoku_id) {
            form_data["ルックアップ"] = kyoryoku_id;
        }

        const payment_date = getPaymentDate(form_data["targetTerm"]);
        if (payment_date && payment_date.isValid()) {
            form_data[fieldPaymentDate_APPLY] = payment_date.format("YYYY-MM-DD");
        } else {
            console.log(`支払日を自動決定できませんでした。申込レコードに支払日を手動で入力してください。対象稼働期間: ${form_data["targetTerm"]}`);
        }

        const record = {};

        // フォームの入力内容を読み取る
        for (const key of Object.keys(form_data)) {
            // targetTermは"まで"の日付を読み取って使用する
            if (key === "targetTerm") {
                const closing_date = pat.exec(form_data[key]);
                if (closing_date) {
                    // YYYY-MM-DDの文字列として格納
                    record["closingDay"] = {"value": closing_date[1].replace("年", "-").replace("月", "-").replace("日", "")};
                } else {
                    throw new Error(`締日の読み取りに失敗しました: ${form_data[key]}`);
                }
            }

            // kintoneのレコードに入力しないフィールドは除外
            const ignore_fields = [
                "agree",
                "kebanID" // 協力会社IDによるルックアップで入力するため、posting_payloadとして設定する必要はなし
            ];
            if (ignore_fields.includes(key)) {
                continue;
            }

            // その他フィールドは値をそのまま使用
            record[key]= {"value": form_data[key]};
        }

        // その他、軽バン.COMの場合にセットする値を追加
        const closing_date = `0${record["closingDay"]["value"].split("-")[2]}`.slice(-2);
        const ke_ban_constructor_record = KE_BAN_RECORDS_BY_CLOSING[closing_date];
        record["constructionShopId"]    = {"value": ke_ban_constructor_record.ID};
        record["billingCompany"]        = {"value": ke_ban_constructor_record.NAME};
        record["paymentTiming"]         = {"value": "早払い"};
        record["applicationAmount"]     = {"value": 0}; // レコード作成後に手動で問い合わせ→追記
        record["membership_fee"]        = {"value": 0};

        return {
            app: app_id,
            record: record
        };
    };
    const payload = await get_posting_payload(form_data, env.app_id);

    // kintoneへの登録
    const tokens = [
        env.api_token_record,
        process.env.api_token_komuten,
        process.env.api_token_kyoryoku
    ];
    const API_TOKEN = `${tokens.join(",")}`;
    const kintone_post_response = await postRecord(env.app_id, API_TOKEN, payload)
        .catch((err) => {
            console.error(`kintoneレコード登録エラー：${err}`);
            throw new Error(JSON.stringify({
                status: 500,
                message: "サーバーエラーが発生しました"
            }));
        });

    if (!kintone_post_response) {
        return;
    }
};

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
            this.from_address           = process.env.wfi_dev_from_address;
            this.to_address             = process.env.wfi_dev_to_address;
            this.cc_address             = process.env.wfi_dev_cc_address;

            this.app_id                 = process.env.app_id_apply_dev;
            this.api_token_record       = process.env.api_token_apply_record_dev;
            this.api_token_files        = process.env.api_token_apply_files_dev;
            this.success_redirect_to    = `https://${this.host}/apply_complete.html`;
        } else if (this.host === process.env.form_wfi_prod) {
            // 本番環境
            this.from_address           = process.env.wfi_prod_from_address;
            this.to_address             = process.env.wfi_prod_to_address;
            this.cc_address             = process.env.wfi_prod_cc_address;

            this.app_id                 = process.env.app_id_apply_prod;
            this.api_token_record       = process.env.api_token_apply_record_prod;
            this.api_token_files        = process.env.api_token_apply_files_prod;
            this.success_redirect_to    = `https://${this.host}/apply_complete.html`;
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

function getRecord(app_id, token, payload) {
    // kintoneのレコードを取得する
    const headers = {
        "Host": `investdesign.cybozu.com:${app_id}`,
        "X-Cybozu-API-Token": token,
        "Authorization": `Basic ${token}`,
        "Content-Type": "application/json",
    };

    return axios({
        method: "get",
        url: "https://investdesign.cybozu.com/k/v1/records.json",
        data: payload,
        headers: headers
    });
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

// メールのテンプレート文面をdataの内容で置換した文字列を返す
function substituteTemplate(template, data) {
    const pattern = /{\s*(\w+?)\s*}/g;
    return template.replace(pattern, (_, token) => {
        return data[token] || "";
    });
}
