const functions = require("firebase-functions");

exports.send_apply_dev = functions.https.onRequest((req, res) => {
    res.json({
        message: "send_apply_dev"
    });
});
