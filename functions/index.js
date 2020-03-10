const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp();

const fetch = require('node-fetch');
const querystring = require('querystring');

const conv = json => json.records.map(r => {
    let record = {};
    Object.keys(r).forEach(k => {
        record[k] = r[k].value;
    });
    return record;
});

const except = (obj, keys) => {
    let r = { };
    for(k in obj) {
        if(!keys.includes(k)) {
            r[k] = obj[k];
        }
    }
    return r;
}

const pattern_fields = [
    'pattern',
    'closing', 'deadline', 'early'
].join(',');

// 20パターン*12ヶ月 = 240くらいを想定
const fetch_pattern = function() {
    return fetch("https://investdesign.cybozu.com/k/v1/records.json?"+querystring.stringify({
        app: parseInt(process.env['KINTONE_PATTERN_APP_ID']),
        fields: pattern_fields,
        query: 'deadline >= TODAY() and deadline <= FROM_TODAY(12, MONTHS) order by deadline asc limit 500',
    }), {
        headers: { 'X-Cybozu-API-Token': process.env['KINTONE_PATTERN_TOKEN'] },
    })
    .then(res => {
        if(res.status == 200) {
            return res.json();
        } else {
            res.text().then(text => { throw new Error(text) });
        }
    })
    .then(conv)
    .then(records => {
        let by_pattern = { };
        records.forEach(r => {
            if(!by_pattern[r.pattern]) {
                by_pattern[r.pattern] = [ ];
            }
            by_pattern[r.pattern].push(except(r, [ 'pattern' ]));
        });
        return by_pattern;
    });
};

const fields = [
    'id', 'service', 'pattern', 'cost', 'transfer_fee', 'limit',
    'form_1', 'form_2', 'link', 'mail',
    'closing', 'deadline', 'early', 'original', 'lag', 'effect'
].join(',');

const fetch_service = function() {
    return fetch("https://investdesign.cybozu.com/k/v1/records.json?"+querystring.stringify({
        app: process.env['KINTONE_BUILDER_APP_ID'],
        fields: fields,
    }), {
        headers: { 'X-Cybozu-API-Token': process.env['KINTONE_BUILDER_TOKEN'] },
    })
    .then(res => {
        if(res.status == 200) {
            return res.json();
        } else {
            res.text().then(text => { throw new Error(text) });
        }
    })
    .then(conv)
    .then(records => {
        let by_id = { };
        records.forEach(r => {
            by_id[r.id] = except(r, [ 'id' ]);
        });
        return by_id;
    });
};

exports.helloWorld = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', 'https://investdesign.cybozu.com');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if(req.method != 'POST') {
        res.status(200).send('unexpected method');
        return;
    }

    let ids = [ ];
    console.log('fetch from kintone...');
    const json = await Promise.all([ fetch_pattern(), fetch_service() ])
    .then(result => {
        pattern = result[0];
        service = result[1];
        console.log('got '+Object.keys(pattern).length+' patterns and '+Object.keys(service).length+' services.');
        for(id in service) {
            if(pattern[service[id].pattern]) {
                console.log('service.id='+id+', pattern='+service[id].pattern);
            } else {
                console.log('no schedule for pattern[id='+service[id].pattern+'].');
            }
            service[id].schedule = pattern[service[id].pattern] || [ ];
            ids.push(id);
        }
        return JSON.stringify(service, true, "  ");
    });

    const bucket = admin.storage().bucket();
    const file = bucket.file('data.json');
    await file.save(json);
    await file.setMetadata({ contentType: 'application/json' });
    res.set('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({ success: true, service_ids: ids }));

    console.log('completed.');
});

//申込みフォームから送信されたデータをfirebaseで受け取り、kintoneに送信する
exports.send_apply = functions.https.onRequest((req, res) => {
    if (req.method != 'POST') {
        //POST以外を受け取ったときはとりあえずエラーにしとく
        res.status(405).send('Method Not Allowed');
        return;
    } else {
        //reqの中身を整形してkintone用にする
        var sendObj = {};
        sendObj.app = 159;

        var record = {};
        var company = {"value": req.body["company"]};
        record.company = company;

        var billingCompany = {"value": req.body["billingCompany"]};
        record.billingCompany = billingCompany;

        var closingDay = {"value": req.body["closingDay"]};
        record.closingDay = closingDay;

        var postalCode = {"value": req.body["postalCode"]};
        record.postalCode = postalCode;

        var prefecture = {"value": req.body["prefecture"]};
        record.prefecture = prefecture;

        var address = {"value": req.body["address"]};
        record.address = address;

        var streetAddress = {"value": req.body["streetAddress"]};
        record.streetAddress = streetAddress;

        var representative = {"value": req.body["representative"]};
        record.representative = representative;

        var mail = {"value": req.body["mail"]};
        record.mail = mail;

        var fax = {"value": req.body["fax"]};
        record.fax = fax;

        var phone = {"value": req.body["phone"]};
        record.phone = phone;

        // var invoice = {"value": req.body["invoice"]};
        // record.invoice = invoice;

        var applicationAmount = {"value": req.body["applicationAmount"]};
        record.applicationAmount = applicationAmount;

        var bankCode = {"value": req.body["bankCode"]};
        record.bankCode = bankCode;

        var bankName = {"value": req.body["bankName"]};
        record.bankName = bankName;

        var branchCode = {"value": req.body["branchCode"]};
        record.branchCode = branchCode;

        var branchName = {"value": req.body["branchName"]};
        record.branchName = branchName;

        // var deposit = {"value": req.body["deposit"]};
        // record.deposit = deposit;

        var accountNumber = {"value": req.body["accountNumber"]};
        record.accountNumber = accountNumber;

        var accountName = {"value": req.body["accountName"]};
        record.accountName = accountName;

        // var driverLicenseFront = {"value": req.body["driverLicenseFront"]};
        // record.driverLicenseFront = driverLicenseFront;

        // var driverLicenseBack = {"value": req.body["driverLicenseBack"]};
        // record.driverLicenseBack = driverLicenseBack;

        var constructionShopId = {"value": req.body["constructionShopId"]};
        record.constructionShopId = constructionShopId;

        //利用規約に同意するチェックボックスはレコードに載せる必要はない

        sendObj.record = record;

        //POSTリクエストの中身をkintoneに転送
        var request = require('request');

        /* kintone用のパラメータ*/
        var DOMAIN = 'investdesign.cybozu.com';
        var APP_ID = 159;   //アプリID
        // LAGLESSアプリの工務店IDを元に工務店マスタのレコードを参照するため、両方のアプリのAPIトークンが必要
        var API_LAGLESS = functions.config().tokens.form_apply.lagless;
        var API_KOMUTEN = functions.config().tokens.form_apply.komuten;
        var API_TOKEN = API_LAGLESS + ',' + API_KOMUTEN;

        var BASE_URL = 'https://investdesign.cybozu.com/k/v1/record.json';
        var BASIC = 'Basic ' + API_TOKEN;

        var headers = {
            'Host': 'investdesign.cybozu.com:159',
            'X-Cybozu-API-Token': API_TOKEN,
            'Authorization': BASIC,
            'Content-Type': 'application/json',
        };

        var options_postrecord = {
            url: BASE_URL,
            method: 'POST',
            headers: headers,
            'Content-Type': 'application/json',
            json: sendObj
        };

        request(options_postrecord, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // 成功
                // 完了画面に遷移
                res.status(200).redirect('https://lagless-dev.netlify.com/apply_complete.html');
            } else {
                console.log('response is ' + JSON.stringify(response));
                console.log('sendObj is ' + JSON.stringify(sendObj));
                console.log('req.body is ' + JSON.stringify(req.body));
                res.status(response.statusCode).send('レコードの登録に失敗しました');
            }
        });
    }
});
