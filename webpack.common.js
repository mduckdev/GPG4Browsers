const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
module.exports = {
    entry: {
        background: path.join(__dirname, "src/background.ts"),
        content: path.join(__dirname, "src/content/index.tsx"),
        popup: path.join(__dirname, "src/index.tsx"),
    },
    output: {
        path: path.join(__dirname, "dist/js"),
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: "ts-loader",
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "postcss-loader",
                ],
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "src/css/app.css",
                    to: "./",
                },
            ],
        }),
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            "@src": path.resolve(__dirname, "src/"),
        },
    },
};
