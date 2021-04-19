const webpack = require("webpack");

module.exports = (env, argv) => {
    const IS_DEVELOPMENT = argv.mode === "development";
    if (IS_DEVELOPMENT) {
        return {
            mode: "development",
            devtool:"source-map",
            module: {
                rules: [
                    {
                        test: /\.png$/i,
                        use: ["url-loader"]
                    }
                ]
            },

            entry: {
                output_csv_RealtorOriginal: "./app_apply/button_output_csv_RealtorOriginalPay.js",
                output_csv_WfiEarly: "./app_apply/button_output_csv_WfiEarlyPay.js",
                generate_invoice_button: "./app_collect/generate_invoice_button.js",
                unsend_invoice_button: "./app_collect/unsend_invoice_button.js",
                color_exceeding_payment: "./color_exceeding_payment.js",
                post_cloud_sign_draft_button: "./app_collect/post_cloud_sign_draft_button.js",
                96: "./96.js",
                174: "./174.js",
                create_payment_detail: "./app_apply/button_create_payment_detail.js",
                insert_collect_credit_button: "./insert_collect_credit_button.js",
                calc_member_fee: "./app_apply/button_calc_member_fee.js",
                app_collect: "./app_collect.js",
            },

            // ファイルの出力設定
            output: {
                //  出力ファイルのディレクトリ名
                path: `${__dirname}/dist`,
                // 出力ファイル名
                filename: "[name].js"
            },
            plugins: [
                new webpack.DefinePlugin({
                    ENV: JSON.stringify({
                        APPLY: 159,
                    }),
                }),
            ]
        };
    } else {
        return {
            mode: "production",
            module: {
                rules: [
                    {
                        test: /\.png$/i,
                        use: ["url-loader"]
                    }
                ]
            },

            entry: {
                output_csv_RealtorOriginal: "./app_apply/button_output_csv_RealtorOriginalPay.js",
                output_csv_WfiEarly: "./app_apply/button_output_csv_WfiEarlyPay.js",
                generate_invoice_button: "./app_collect/generate_invoice_button.js",
                unsend_invoice_button: "./app_collect/unsend_invoice_button.js",
                color_exceeding_payment: "./color_exceeding_payment.js",
                post_cloud_sign_draft_button: "./app_collect/post_cloud_sign_draft_button.js",
                96: "./96.js",
                174: "./174.js",
                create_payment_detail: "./app_apply/button_create_payment_detail.js",
                insert_collect_credit_button: "./insert_collect_credit_button.js",
                calc_member_fee: "./app_apply/button_calc_member_fee.js",
                app_collect: "./app_collect.js",
            },

            // ファイルの出力設定
            output: {
                //  出力ファイルのディレクトリ名
                path: `${__dirname}/dist`,
                // 出力ファイル名
                filename: "[name].js"
            },
            plugins: [
                new webpack.DefinePlugin({
                    ENV: JSON.stringify({
                        APPLY: 161,
                    }),
                }),
            ]
        };
    }
};
