const webpack = require("webpack");

module.exports = (env, argv) => {
    const IS_DEVELOPMENT = argv.mode === "development";

    const config = {
        mode: "none",
        devtool: "none",
        module: {
            rules: [
                {
                    test: /\.png$/i,
                    use: ["url-loader"]
                },
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                ["@babel/preset-env", { targets: "defaults" }]
                            ],
                            plugins: [
                                [
                                    "@babel/plugin-proposal-nullish-coalescing-operator",
                                    { loose: false }
                                ],
                            ],
                        },
                    },
                },
            ],
        },

        entry: {
            buttonOutputTransferCsv: "./app_apply/buttonOutputTransferCsv.js",
            color_exceeding_payment: "./app_apply/color_exceeding_payment.js",
            color_unhighlight_record: "./app_apply/color_unhighlight_record.js",
            96: "./96.js",
            174: "./174.js",
            create_payment_detail: "./app_apply/button_create_payment_detail.js",
            insert_collect_credit_button: "./insert_collect_credit_button.js",
            calc_member_fee: "./app_apply/button_calc_member_fee.js",
            button_antisocial_check: "./app_apply/button_antisocial_check.js",
            button_add_kyoryoku_master: "./app_apply/button_add_kyoryoku_master.js",
            button_make_all_payment_detail_checked: "./app_apply/button_make_all_payment_detail_checked.js",
            button_make_records_ready_to_pay: "./app_apply/button_make_records_ready_to_pay.js",
            buttonMakeRecordsPaid: "./app_apply/buttonMakeRecordsPaid.js",
            buttonMakeApplyDocDateAffirmed: "./app_apply/buttonMakeApplyDocDateAffirmed.js",
            app_collect: "./app_collect.js",
            sandbox: "./app_apply/antisocialCheck/sandbox.js",
        },

        // ファイルの出力設定
        output: {
            //  出力ファイルのディレクトリ名
            path: `${__dirname}/dist`,
            // 出力ファイル名
            filename: "[name].js"
        },
        plugins: []
    };

    if (IS_DEVELOPMENT) {
        config.mode = "development";
        config.devtool = "source-map";
        config.plugins.push(
            new webpack.DefinePlugin({
                ENV: JSON.stringify({
                    APPLY: 159,
                }),
            })
        );
        return config;
    } else {
        config.mode = "production";
        config.devtool = "none";
        config.plugins.push(
            new webpack.DefinePlugin({
                ENV: JSON.stringify({
                    APPLY: 161,
                }),
            })
        );
        return config;
    }
};
