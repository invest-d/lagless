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
    'id', 'service', 'pattern', 'cost', 'limit',
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
