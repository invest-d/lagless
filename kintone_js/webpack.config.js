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
                output_csv: "./output_csv.js",
                generate_invoice_button: "./generate_invoice_button.js",
                add_to_queue_button: "./add_to_queue_button.js",
                unsend_invoice_button: "./unsend_invoice_button.js",
                color_exceeding_payment: "./color_exceeding_payment.js",
                generate_acceptance_letter_button: "./generate_acceptance_letter_button.js",
                post_cloud_sign_draft_button: "./post_cloud_sign_draft_button.js",
                174: "./174.js",
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
            module: {
                rules: [
                    {
                        test: /\.png$/i,
                        use: ["url-loader"]
                    }
                ]
            },

            entry: {
                output_csv: "./output_csv.js",
                generate_invoice_button: "./generate_invoice_button.js",
                add_to_queue_button: "./add_to_queue_button.js",
                unsend_invoice_button: "./unsend_invoice_button.js",
                color_exceeding_payment: "./color_exceeding_payment.js",
                generate_acceptance_letter_button: "./generate_acceptance_letter_button.js",
                post_cloud_sign_draft_button: "./post_cloud_sign_draft_button.js",
                174: "./174.js",
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
