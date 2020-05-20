module.exports = {
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
        generate_invoice_button: "./generate_invoice_button.js"
    },

    // ファイルの出力設定
    output: {
    //  出力ファイルのディレクトリ名
        path: `${__dirname}/dist`,
        // 出力ファイル名
        filename: "[name].js"
    }
};
