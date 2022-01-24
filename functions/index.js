const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.chatwork = require("./chatwork");
exports.zengin = require("./zengin");

const database = require("./database");

exports.helloWorld = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "https://investdesign.cybozu.com");
    res.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if(req.method != "POST") {
        res.status(200).send("unexpected method");
        return;
    }

    console.log("fetch from kintone...");
    const result = await Promise.all([
        database.fetch_pattern(process.env),
        database.fetch_service(process.env),
    ]);

    const pattern = result[0];
    const service = result[1];
    console.log(`got ${Object.keys(pattern).length} patterns and ${Object.keys(service).length} services.`);
    for(const id in service) {
        if(pattern[service[id].pattern]) {
            console.log(`service.id=${id}, pattern=${service[id].pattern}`);
        } else {
            console.log(`no schedule for pattern[id=${service[id].pattern}].`);
        }
        service[id].schedule = pattern[service[id].pattern] || [ ];
    }
    const json = JSON.stringify(service, true, "  ");

    // upload...
    const bucket = admin.storage().bucket();
    const file = bucket.file("data.json");
    await file.save(json);
    await file.setMetadata({ contentType: "application/json" });
    res.set("Content-Type", "application/json");
    res.status(200).send(JSON.stringify({ success: true, service_ids: Object.keys(service) }));

    console.log("completed.");
});

//申込みフォームから送信されたデータをfirebaseで受け取り、kintoneに送信する
exports.send_apply = require("./send_apply").send_apply;

exports.send_apply_dev = require("./send_apply").send_apply;

exports.attach_apply_files = require("./attach_apply_files").attach_apply_files;

// クラウドサインWeb APIのアクセストークンを取得する
exports.fetch_cloudSign_token = require("./fetch_cloudSign_token").fetch_cloudSign_token;

// WFIの申し込みフォームからの送信
exports.ke_ban_form = require("./ke_ban_form").ke_ban_form;
exports.ke_ban_form_dev = require("./ke_ban_form").ke_ban_form;
exports.ke_ban_check = require("./ke_ban_check.js").ke_ban_check;
exports.ke_ban_check_dev = require("./ke_ban_check.js").ke_ban_check;

// 法人番号API
exports.searchCorporateByName = require("./corporateApi.js").searchCorporateByName;
