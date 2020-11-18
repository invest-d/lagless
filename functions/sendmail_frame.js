const nodemailer = require("nodemailer");

module.exports = async function(mail, options) {
    // メールの送信
    try {
        const transport = nodemailer.createTransport(options);
        const result = await transport.sendMail(mail);
        console.log("メールの送信が成功しました");
        console.log(result);
    } catch (err) {
        console.log("メールの送信が失敗しました");
        console.log(err);
    }
};
