const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    entry: {
        main: "./src/main.js",
    },
    node: {
    fs: 'empty',
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname,  "dist")
    },
    devServer: {
       	 host: '0.0.0.0',
	 port: 8008,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "index.html",
            chunks: ["main"]
        })
    ]
};
