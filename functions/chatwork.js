const functions = require('firebase-functions');

const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

const env = process.env;

module.exports = functions.https.onRequest(async (req, res) => {
    console.log(req.body);
    const data = req.body.data;
    return fetch(`https://api.chatwork.com/v2/rooms/${env['CHATWORK_ROOM_ID']}/messages/`, {
        method: 'POST',
        body: new URLSearchParams({ body: [
            `[${req.body.event_name}]`,
            data.item.title,
            `at ${data.occurrence.request.url}`,
            `see ${data.url}`,
        ].join("\n") }),
        headers: {
            'X-ChatWorkToken': env['CHATWORK_TOKEN'],
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
    .then(chatwork_res => {
        if(chatwork_res.status != 200) {
            chatwork_res.text()
            .then(text => {
                throw new Error(text);
            });
            return;
        }
        
        res.set('Content-Type', 'application/json');
        res.status(200).send(chatwork_res.json());
    })
    .catch(chatwork_err => {
        res.set('Content-Type', 'text/plain');
        res.status(500).send(chatwork_err);
    });
});
