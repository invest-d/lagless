const functions = require('firebase-functions');
let data = null;

const strip = element => {
    return Object.assign({
        code: element.code,
        name: element.name,
        kana: element.kana,
    }, element.branches ? {
        branches: Object.values(element.branches).map(strip),
    } : { });
};

module.exports = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', 'https://investdesign.cybozu.com');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if(!data) {
        console.log('Loading data...');
        data = require('zengin-code');
        console.log(`${Object.keys(data).length} banks ready.`);
    }

    const banks = [ ];

    if(!req.query.bank) {
        res.status(400).send('Bad request');
        return;
    }
    
    const ids = (typeof req.query.bank == 'string') ? [ req.query.bank ] : req.query.bank;
    ids.forEach(id => {
        if(data[id]) {
            banks.push(strip(data[id]));
        }
    });

    res.set('Content-Type', 'text/javascript');
    res.status(200).send(JSON.stringify({ banks: banks }));
});
