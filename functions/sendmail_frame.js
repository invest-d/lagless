module.exports = function(mail, options) {
    const nodemailer = require("nodemailer");
    // メールの送信
    (async () => {
        try {
            const transport = nodemailer.createTransport(options);
            const result = await transport.sendMail(mail);
            console.log("メールの送信が成功しました");
            console.log(result);
        } catch (err) {
            console.log("メールの送信が失敗しました");
            console.log(err);
        }
    })();
};
