const CopyFilePlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = (env, argv) => {
    const IS_DEVELOPMENT = argv.mode === "development";

    if (IS_DEVELOPMENT) {
        return {
            name: "lagless",
            mode: "development",
            devtool: "source-map",
            entry: {
                app: "./src/app.js",
                apply: "./src/apply.js",
                ke_ban: "./src/ke_ban.js",
                ke_ban_entry: "./src/ke_ban_entry.js",
                menu: "./src/menu.js"
            },
            output: {
                filename: "[name].js",
                path: path.resolve(__dirname, "./public")
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: {
                            test: /node_modules/,
                            not: [
                                /exif-rotate-js/
                            ]
                        },
                        use: {
                            loader: "babel-loader",
                            options: {
                                presets: [
                                    [
                                        "@babel/preset-env",
                                        {
                                            "targets": {
                                                "ie": "11"
                                            },
                                            "modules": "commonjs"
                                        }
                                    ]
                                ],
                                plugins: [
                                    "@babel/plugin-transform-runtime",
                                    "add-module-exports"
                                ],
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
                ),
                new webpack.ProvidePlugin({
                    Promise: "es6-promise",
                }),
                new webpack.DefinePlugin({
                    ENV: JSON.stringify({
                        apply_endpoint: "https://us-central1-lagless.cloudfunctions.net/send_apply_dev",
                        ke_ban_endpoint: "https://us-central1-lagless.cloudfunctions.net/ke_ban_form_dev",
                        filename_suffix: "dev",
                    }),
                }),
            ]
        };
    } else {
        return {
            name: "lagless",
            mode: "production",
            devtool: "none",
            entry: {
                app: "./src/app.js",
                apply: "./src/apply.js",
                ke_ban: "./src/ke_ban.js",
                ke_ban_entry: "./src/ke_ban_entry.js",
                menu: "./src/menu.js"
            },
            output: {
                filename: "[name].js",
                path: path.resolve(__dirname, "./public")
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: {
                            test: /node_modules/,
                            not: [
                                /exif-rotate-js/
                            ]
                        },
                        use: {
                            loader: "babel-loader",
                            options: {
                                presets: [
                                    [
                                        "@babel/preset-env",
                                        {
                                            "targets": {
                                                "ie": "11"
                                            },
                                            "modules": "commonjs"
                                        }
                                    ]
                                ],
                                plugins: [
                                    "@babel/plugin-transform-runtime",
                                    "add-module-exports"
                                ],
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
                ),
                new webpack.ProvidePlugin({
                    Promise: "es6-promise",
                }),
                new webpack.DefinePlugin({
                    ENV: JSON.stringify({
                        apply_endpoint: "https://us-central1-lagless.cloudfunctions.net/send_apply",
                        ke_ban_endpoint: "https://us-central1-lagless.cloudfunctions.net/ke_ban_form",
                        filename_suffix: "prod",
                    }),
                }),
            ]
        };
    }
};
