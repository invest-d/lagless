const CopyFilePlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
    name: "lagless",
    mode: "development",
    devtool:"eval-source-map",
    entry: {
        apply: "./src/apply.js"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "./public")
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    },
    plugins: [
        new CopyFilePlugin(
            [
                {
                    context: "./node_modules/bootstrap/dist/css",
                    from: "bootstrap.min.css",
                    to: path.resolve( __dirname , "./public/css" )
                },
                {
                    context: "./node_modules/flatpickr/dist",
                    from: "flatpickr.min.css",
                    to: path.resolve( __dirname , "./public/css" )
                }
            ],
            { copyUnmodified: true }
        )
    ]
};
