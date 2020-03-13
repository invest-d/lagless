const functions = require('firebase-functions');

const Busboy = require('busboy');
const FormData = require('form-data');
const axios = require('axios');

exports.send_apply = functions.https.onRequest(async (req, res) => {
    console.log('フォーム送信開始');
    if (req.method != 'POST') {
        //POST以外を受け取ったときはとりあえずエラーにしとく
        res.status(405).send('Method Not Allowed');
        return;
    } else {
        var sendObj = {};
        sendObj.app = 159;
        var record = {};
        var file_key_result = [];

        // 送信元のフォームのURLからuserパラメータを受け取り、ファイルアップロードがいくつあるかを確認する。
        var user_query = req.headers.referer.match(/user=.+?($|&)/);
        console.log('user_query is');
        console.log(user_query);
        var user_type = 'new';
        if (user_query.length > 0) {
            user_type = user_query[0].replace('&', '').split('=')[1];
        }
        console.log('user type is ' + user_type);
        // 2回目のフォームの場合、アップロードするファイルは請求書データのみなので1
        var UPLOAD_REQUIRED = (user_type === "existing")
            ? 1
            : 3;
        console.log(UPLOAD_REQUIRED + 'uploads will be executed.');

        const busboy = new Busboy({ headers: req.headers });
        const allowMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        var busboy_result = new Promise((resolve, reject) => {
            busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                if (mimetype == 'application/octet-stream') {
                    // 添付ファイルが未入力の場合（application/octet-stream）はスルー
                    // 未入力はそもそもフォームでバリデーションをかけているが、2回目以降のフォームの場合は運転免許証画像の欄が未入力のまま送信されてくる。スルーでよい。
                    file.resume();
                }
                else if (!allowMimeTypes.includes(mimetype.toLocaleLowerCase())) {
                    console.error('unexpected mimetype.');
                    console.error(mimetype);
                    res.status(406).redirect(req.headers.referer);
                    resolve();
                    return;
                } else {
                    const form = new FormData();
                    var ext = String(mimetype).split('/')[1];

                    form.append('file', file, `${fieldname}.${ext}`);
                    var headers = Object.assign(form.getHeaders(), {
                        'X-Cybozu-API-Token': 'mENAJTSO5KWYIGZhtudKom64B98CUqVZLqwGKEMe'
                    });
                    axios.post('https://investdesign.cybozu.com/k/v1/file.json', form, { headers })
                    .then(result => {
                        if(result.data) {
                            if(result.data.fileKey) {
                                // res.status(200).send("OK");
                                // kintoneにアップロードしたファイルのファイルキーを配列に保持
                                file_key_result.push({[fieldname]: {"value": [{"fileKey": result.data.fileKey}]}});

                                // アップロードすべきファイルが全て終わるまでresolveしない
                                if (file_key_result.length == UPLOAD_REQUIRED) {
                                    // すべてのアップロードが終わったら、それぞれのフィールドオブジェクトをrecordにマージしてからようやくresolveする。
                                    console.log('upload completed.');
                                    file_key_result.forEach(result => {
                                        record = Object.assign(record, result);
                                    });
                                    resolve(record);
                                }
                            } else {
                                console.error(result.data);
                                res.status(500).redirect(req.headers.referer);
                                resolve();
                            }
                        } else {
                            console.error(result);
                            res.status(500).redirect(req.headers.referer);
                            resolve();
                        }
                    })
                    .catch(err => {
                        console.error(err.response);
                        res.status(500).redirect(req.headers.referer);
                        resolve();
                    });
                }
            });
            busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated) => {
                record = Object.assign(record, {[fieldname]: {"value": val}});
            });
            busboy.on('finish', () => {
            });
            busboy.end(req.rawBody);
        });

        busboy_result.then(function (record) {
            console.log(req.rawBody);
            console.log(JSON.stringify(record));


            // データ加工
            // FAX番号を入力してもらってる場合はメールアドレスに加工して保存
            var mail_or_fax = record["email-fax-input"]["value"];
            console.log('email address input is '+ mail_or_fax);
            if (mail_or_fax == 'fax') {
                var fax_number = record.fax.value;
                var emailed_fax = `lagless+fax-${fax_number}@invest-d.com`;
                record = Object.assign(record, {"mail": {"value": emailed_fax}});
                delete record["fax"];
            }


            // 預金種目を日本語に変換(初回申込みのみ)
            if (user_type !== "existing") {
                var deposit_type = record.deposit.value;
                var ja_deposit_type = "";
                if (deposit_type == "ordinary") {
                    ja_deposit_type = "普通";
                } else {
                    ja_deposit_type = "当座";
                }
                record = Object.assign(record, {"deposit": {"value": ja_deposit_type}});
            }


            // 不要な要素を削除
            delete record["email-fax-input"];
            delete record["agree"];


            // sendObjと結合してkintoneにレコード登録
            sendObj.record = record;
            console.log('get sendObj completed.');
            console.log(JSON.stringify(sendObj));

            var request = require('request');

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
                    console.error('response is ' + JSON.stringify(response));
                    console.error('sendObj is ' + JSON.stringify(sendObj));
                    console.error('req.body is ' + JSON.stringify(req.body));
                    res.status(response.statusCode).redirect(req.headers.referer);
                }
            });
        });

        // //reqの中身を整形してkintone用にする
        // var sendObj = {};
        // sendObj.app = 159;

        // var record = {};
        // var company = {"value": req.body["company"]};
        // record.company = company;

        // var billingCompany = {"value": req.body["billingCompany"]};
        // record.billingCompany = billingCompany;

        // var closingDay = {"value": req.body["closingDay"]};
        // record.closingDay = closingDay;

        // var postalCode = {"value": req.body["postalCode"]};
        // record.postalCode = postalCode;

        // var prefecture = {"value": req.body["prefecture"]};
        // record.prefecture = prefecture;

        // var address = {"value": req.body["address"]};
        // record.address = address;

        // var streetAddress = {"value": req.body["streetAddress"]};
        // record.streetAddress = streetAddress;

        // var representative = {"value": req.body["representative"]};
        // record.representative = representative;

        // // メールアドレスもしくはFAXのいずれかを必須入力。
        // // どちらか入力してくれた方を採用する。
        // if (String(req.body["email-fax-input"]) === "email") {
        //     var mail = {"value": req.body["mail"]};
        //     record.mail = mail;
        // } else {
        //     // FAXを入力してくれた場合も【メールアドレスとして】登録。
        //     // メールアドレスを使ってFAX送信が可能になるサービスを利用。
        //     var fax = req.body["fax"];
        //     var mail = {"value": `lagless+fax-${fax}@invest-d.com`};
        //     record.mail = mail;
        // }

        // var phone = {"value": req.body["phone"]};
        // record.phone = phone;

        // var invoice = {"value": [{"fileKey": file_keys["invoice"]}]};
        // record.invoice = invoice;

        // var applicationAmount = {"value": req.body["applicationAmount"]};
        // record.applicationAmount = applicationAmount;

        // var bankCode = {"value": req.body["bankCode"]};
        // record.bankCode = bankCode;

        // var bankName = {"value": req.body["bankName"]};
        // record.bankName = bankName;

        // var branchCode = {"value": req.body["branchCode"]};
        // record.branchCode = branchCode;

        // var branchName = {"value": req.body["branchName"]};
        // record.branchName = branchName;

        // // var deposit = {"value": req.body["deposit"]};
        // // record.deposit = deposit;

        // var accountNumber = {"value": req.body["accountNumber"]};
        // record.accountNumber = accountNumber;

        // var accountName = {"value": req.body["accountName"]};
        // record.accountName = accountName;

        // var driverLicenseFront = {"value": [{"fileKey": file_keys["driverLicenseFront"]}]};
        // record.driverLicenseFront = driverLicenseFront;

        // var driverLicenseBack = {"value": [{"fileKey": file_keys["driverLicenseBack"]}]};
        // record.driverLicenseBack = driverLicenseBack;

        // var constructionShopId = {"value": req.body["constructionShopId"]};
        // record.constructionShopId = constructionShopId;

        // //利用規約に同意するチェックボックスはレコードに載せる必要はない

        // sendObj.record = record;

        // //POSTリクエストの中身をkintoneに転送
        // var request = require('request');

        // /* kintone用のパラメータ*/
        // var DOMAIN = 'investdesign.cybozu.com';
        // var APP_ID = 159;   //アプリID
        // // LAGLESSアプリの工務店IDを元に工務店マスタのレコードを参照するため、両方のアプリのAPIトークンが必要
        // var API_LAGLESS = functions.config().tokens.form_apply.lagless;
        // var API_KOMUTEN = functions.config().tokens.form_apply.komuten;
        // var API_TOKEN = API_LAGLESS + ',' + API_KOMUTEN;

        // var BASE_URL = 'https://investdesign.cybozu.com/k/v1/record.json';
        // var BASIC = 'Basic ' + API_TOKEN;

        // var headers = {
        //     'Host': 'investdesign.cybozu.com:159',
        //     'X-Cybozu-API-Token': API_TOKEN,
        //     'Authorization': BASIC,
        //     'Content-Type': 'application/json',
        // };

        // var options_postrecord = {
        //     url: BASE_URL,
        //     method: 'POST',
        //     headers: headers,
        //     'Content-Type': 'application/json',
        //     json: sendObj
        // };

        // request(options_postrecord, function (error, response, body) {
        //     if (!error && response.statusCode == 200) {
        //         // 成功
        //         // 完了画面に遷移
        //         res.status(200).redirect('https://lagless-dev.netlify.com/apply_complete.html');
        //     } else {
        //         console.log('response is ' + JSON.stringify(response));
        //         console.log('sendObj is ' + JSON.stringify(sendObj));
        //         console.log('req.body is ' + JSON.stringify(req.body));
        //         res.status(response.statusCode).send('レコードの登録に失敗しました');
        //     }
        // });
    }
});
