const functions = require("firebase-functions");

const axios = require("axios");

exports.fetch_cloudSign_token = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", process.env.kintone_server);

    const url = "https://api.cloudsign.jp/token";
    const client_id = JSON.parse(req.body).client_id;
    const data = `client_id=${client_id}`;
    const config = {
        headers: {
            "accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };

    try {
        const response = await axios.post(url, data, config);
        const result = response.data;
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(400).json({
            message: "failed fetch"
        });
    }
});
