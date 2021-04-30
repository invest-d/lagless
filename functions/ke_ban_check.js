const functions = require("firebase-functions");
const axios = require("axios");
const ke_ban_form = require("./ke_ban_form");

const existsSameApply = async (app_id, token, applicant_id, worked_term) => {
    // 申し込みアプリに、ドライバーIDと稼働期間の両方が等しいレコードが存在するかどうかを判定する
    // worked_term -> "YYYY年MM月DD日からYYYY年MM月DD日まで"
    const closing = ke_ban_form.extractClosing(worked_term).replace("年", "-").replace("月", "-").replace("日", "");
    const END_POINT = "https://investdesign.cybozu.com/k/v1/records.json";
    const headers = {
        "Host": `investdesign.cybozu.com:${app_id}`,
        "X-Cybozu-API-Token": token,
        "Authorization": `Basic ${token}`,
        "Content-Type": "application/json",
    };
    const payload = {
        app: app_id,
        query: `kebanID = "${applicant_id}" and closingDay = "${closing}"`
    };

    const resp = await axios({
        method: "get",
        url: END_POINT,
        data: payload,
        headers: headers
    });

    console.log("重複チェック結果:");
    console.log(JSON.stringify(payload));
    console.log(JSON.stringify(resp.data.records));
    return resp.data.records.length > 0;
};

exports.ke_ban_check = functions.https.onRequest(async (req, res) => {
    if (req.method != "POST") {
        res.status(405).json({message: "Method Not Allowed"});
        return;
    }

    console.log(`KE-BAN:requested from ${String(req.headers.referer)}`);
    const env = new ke_ban_form.Environ(req.headers.referer);
    ke_ban_form.setCORS(env, res);
    console.log("KE-BAN:重複申込チェック");

    const req_body = JSON.parse(req.body);
    console.log(req_body);
    const exists_apply = await existsSameApply(env.app_id, env.api_token_record, req_body.applicant_id, req_body.worked_term)
        .catch((e) => {
            console.error(e);
            res.status(500).json({
                message: "申込確認時サーバーエラー。サーバーログを参照してください"
            });
            return undefined;
        });

    if (typeof exists_apply !== "undefined") {
        res.status(200).json({
            exists: exists_apply
        });
    }
});
