const functions = require('firebase-functions');

const Busboy = require('busboy');
const FormData = require('form-data');
const axios = require('axios');

exports.send_apply = functions.https.onRequest(async (req, res) => {
    if (req.method != 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    // 開発環境か、もしくは本番環境のトークン等の各種データを取得。それ以外のドメインの場合は例外をthrow
    const env = new Environ(req.headers.referer).create();

    setCORS(env, res);

    console.log('フォームデータ受信');
    const sendObj = {};
    sendObj.app = env.app_id;
    const record = {};

    const busboy = new Busboy({ headers: req.headers });
    const allowMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const file_uploads = [];
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        // 請求書データ等のファイルアップロード
        if (String(mimetype) === 'application/octet-stream') {
            // 添付ファイルが未入力の場合（application/octet-stream）はスルー
            // 未入力はそもそもフォームでバリデーションをかけているが、2回目以降のフォームの場合は運転免許証画像の欄が未入力のまま送信されてくる。スルーでよい。
            file.resume();
        } else {
            const upload = new Promise((resolve, reject) => {
                if (!allowMimeTypes.includes(mimetype.toLocaleLowerCase())) {
                    console.error('unexpected mimetype.');
                    console.error(mimetype);
                    reject({status: 406, message: '添付ファイルは ' + allowMimeTypes.map(t=>t.split('/')[1]) + ' のいずれかの形式で送信してください。'});
                } else {
                    const form = new FormData();
                    const ext = String(mimetype).split('/')[1];

                    form.append('file', file, `${fieldname}.${ext}`);
                    const headers = Object.assign(form.getHeaders(), {
                        'X-Cybozu-API-Token': env.api_token_files
                    });
                    axios.post('https://investdesign.cybozu.com/k/v1/file.json', form, { headers })
                    .then(result => {
                        resolve({
                            'fieldname': fieldname,
                            'value': [{"fileKey": result.data.fileKey}]
                        });
                    })
                    .catch(err => {
                        console.error('file upload error.');
                        console.error(err);
                        reject({status: 500, message: '不明なエラーが発生しました。'});
                    });
                }
            });

            file_uploads.push(upload);
        }
    });
    busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated) => {
        record[fieldname]= {'value': val};
    });
    busboy.on('finish', () => {
        // ファイルアップロードが全て終わってから、kintoneへのレコード登録を行う。
        Promise.all(file_uploads)
        .then(results => {
            results.forEach(result => { record[result['fieldname']] = {'value': result['value']} });

            // データ加工
            // 送信元のフォームのURLからuserパラメータを取得
            const user_query = req.headers.referer.match(/user=.+?($|&)/);
            console.log('user_query is');
            console.log(user_query);
            const user_type = (user_query !== null && user_query.length > 0)
                ? user_query[0].replace('&', '').split('=')[1]
                : 'new'; //userパラメータが無い場合は新規ユーザとする（フォームもパラメータが無い場合は新規として扱っている）

            console.log('user type is ' + user_type);

            // 預金種目を日本語に変換(新規ユーザのみ)
            if (user_type !== "existing") {
                // どちらかを選んでいないとフォームからの送信は出来ない仕様
                const ja_deposit_type = (record['deposit_Form']['value'] === "ordinary")
                    ? "普通"
                    : "当座";

                record["deposit_Form"] = {"value": ja_deposit_type};
            }

            // 不要な要素を削除
            delete record["agree"];

            // sendObjと結合してkintoneにレコード登録可能な形に整える
            sendObj['record'] = record;
            console.log('generate sendObj completed.');
            console.log(JSON.stringify(sendObj));

            // kintoneへの登録開始
            const request = require('request');

            // 申込みアプリの工務店IDを元に工務店マスタのレコードを参照するため、両方のアプリのAPIトークンが必要
            const API_TOKEN = env.api_token_record + ',' + process.env.api_token_komuten;

            const BASE_URL = 'https://investdesign.cybozu.com/k/v1/record.json';
            const BASIC = 'Basic ' + API_TOKEN;

            const headers = {
                'Host': 'investdesign.cybozu.com:' + env.app_id,
                'X-Cybozu-API-Token': API_TOKEN,
                'Authorization': BASIC,
                'Content-Type': 'application/json',
            };

            const options_postrecord = {
                url: BASE_URL,
                method: 'POST',
                headers: headers,
                'Content-Type': 'application/json',
                json: sendObj
            };

            request(options_postrecord, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // 成功
                    res.status(200).send(env.success_redirect_to);
                } else {
                    console.error('response is ' + response.statusCode + ': ' + response.body.code + ': ' + response.body.message);
                    console.log('headers is ' + JSON.stringify(headers));
                    console.error('sendObj is ' + JSON.stringify(sendObj));
                    console.error('req.body is ' + JSON.stringify(req.body));
                    res.status(response.statusCode).send(response.body.message);
                }
            });
        })
        .catch(err => res.status(err.status).send(err.message));
    });
    busboy.end(req.rawBody);
});

// reqのhostをCORSに設定する。固定値にしないのは、開発・本番 複数ドメインのCORSを設定するため
// 開発or本番以外のドメインからのリクエストはそもそもenvをインスタンス化出来ないのでチェックしない
function setCORS(env, res){
    console.log('requested from ' + String(env.host));

    // リクエスト元が開発版のフォームなら開発版のドメインを、本番のフォームなら本番のドメインを設定。
    res.set('Access-Control-Allow-Origin','https://' + env.host);
}

class Environ {
    constructor(referer) {
        this.referer = referer;
        this.host = extractHostDomain(referer);
    }

    create() {
        if (this.host === process.env.form_dev) {
            return new EnvDev(this.referer);
        }
        else if (this.host === process.env.form_prod) {
            return new EnvProd(this.referer);
        }
        else {
            throw new Error('invalid referer.');
        }
    }
}

class EnvDev extends Environ {
    constructor(referer) {
        super(referer);
        this.app_id = process.env.app_id_apply_dev;
        this.api_token_record = process.env.api_token_apply_record_dev;
        this.api_token_files = process.env.api_token_apply_files_dev;
        this.success_redirect_to = 'https://' + this.host + '/apply_complete.html';
    }
}

class EnvProd extends Environ {
    constructor(referer) {
        super(referer);
        this.app_id = process.env.app_id_apply_prod;
        this.api_token_record = process.env.api_token_apply_record_prod;
        this.api_token_files = process.env.api_token_apply_files_prod;
        this.success_redirect_to = 'https://' + this.host + '/apply_complete.html';
    }
}

function extractHostDomain(url) {
    // スラッシュで区切ってドメイン部分とポート番号を抜き出す
    const domain_and_port = (url.indexOf("://") > -1)
        ? url.split('/')[2]
        : url.split('/')[0];

    // ドメイン部分だけ抜き出す
    return domain_and_port.split(':')[0];
}
