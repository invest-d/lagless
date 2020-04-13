const functions = require('firebase-functions');

const Busboy = require('busboy');
const FormData = require('form-data');
const axios = require('axios');

exports.send_apply = functions.https.onRequest(async (req, res) => {
    interceptor(req.headers.referer, res);
    console.log('フォーム送信開始');
    if (req.method != 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    } else {
        var sendObj = {};
        sendObj.app = process.env.app_id_apply;
        var record = {};
        var file_key_result = [];

        // 送信元のフォームのURLからuserパラメータを受け取り、ファイルアップロードがいくつあるかを確認する。
        var user_query = req.headers.referer.match(/user=.+?($|&)/);
        console.log('user_query is');
        console.log(user_query);
        var user_type = 'new';
        if (user_query !== null && user_query.length > 0) {
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
                        'X-Cybozu-API-Token': process.env.api_token_apply_files
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
                var deposit_type = record.deposit_Form.value;
                var ja_deposit_type = "";
                if (deposit_type == "ordinary") {
                    ja_deposit_type = "普通";
                } else {
                    ja_deposit_type = "当座";
                }
                record = Object.assign(record, {"deposit_Form": {"value": ja_deposit_type}});
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
            var API_APPLY = process.env.api_token_apply;
            var API_KOMUTEN = process.env.api_token_komuten;
            var API_TOKEN = API_APPLY + ',' + API_KOMUTEN;

            var BASE_URL = 'https://investdesign.cybozu.com/k/v1/record.json';
            var BASIC = 'Basic ' + API_TOKEN;

            var headers = {
                'Host': 'investdesign.cybozu.com:' + process.env.app_id_apply,
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
                    res.status(200).send(process.env.apply_success_page_url);
                } else {
                    console.error('response is ' + JSON.stringify(response));
                    console.error('sendObj is ' + JSON.stringify(sendObj));
                    console.error('req.body is ' + JSON.stringify(req.body));
                    res.status(response.statusCode).redirect(req.headers.referer);
                }
            });
        });
    }
});

// リクエストヘッダを確認し、hostが正規のフォームであればそれをCORSに設定
function interceptor(referer, res){
    host = extractHostDomain(referer);
    console.log('requested from ' + String(host));

    if(isAllowedOrigin(host)){
        // 開発版のフォームなら開発版のドメインを、本番のフォームなら本番のドメインを設定
        res.set('Access-Control-Allow-Origin','https://'+host);
    }
}

function extractHostDomain(url) {
    let host_domain;

    if (url.indexOf("://") > -1) {
        host_domain = url.split('/')[2];
    }
    else {
        host_domain = url.split('/')[0];
    }

    host_domain = host_domain.split(':')[0];

    return host_domain;
}

function isAllowedOrigin(host){
    if(host == process.env.form_dev)return true;
    if(host == process.env.form_prod)return true;

    return false;
}
