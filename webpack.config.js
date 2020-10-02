const CopyFilePlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = (env, argv) => {
    const IS_DEVELOPMENT = argv.mode === "development";

    return {
        name: "lagless",
        mode: IS_DEVELOPMENT ? "development" : "production",
        devtool: IS_DEVELOPMENT ? "eval-source-map" : "none",
        entry: {
            app: "./src/app.js",
            apply: "./src/apply.js",
            ke_ban: "./src/ke_ban.js",
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
};
