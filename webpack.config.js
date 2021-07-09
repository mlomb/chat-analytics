const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default;

const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

const prod = !(process.env.MODE === "development");
const resolve = (file) => path.resolve(__dirname, file);

console.log("Mode", process.env.MODE, prod);

const config = {
    entry: {
        index: resolve("site/HomePage.tsx"),
        report: resolve("site/ReportPage.tsx")
    },
    mode: process.env.MODE || 'development',
    output: {
        path: resolve("public"),
        publicPath: ''
    },
    module: {
        rules: [
            { test: /worker\./i, loader: "worker-loader" },
            { test: /\.tsx?$/, loader: "ts-loader", exclude: [/node_modules/] },
			{ test: /\.less$/, use: [
                MiniCssExtractPlugin.loader,
                { loader: "css-loader" },
                { loader: 'postcss-loader', options: { postcssOptions: { plugins: [require("autoprefixer"), require("cssnano")] } } },
                { loader: "less-loader" }
            ] },
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    },
	plugins: [
		new HtmlWebpackPlugin({
            chunks: ["index"],
			template: resolve("site/assets/index.html"),
            filename: "index.html",
            minify: prod
		}),
		new HtmlWebpackPlugin({
            chunks: ["report"],
			template: resolve("site/assets/report.html"),
            filename: "report.html",
            minify: prod ? {
                removeComments: false
            } : { }
		}),
        new MiniCssExtractPlugin(),
        new HTMLInlineCSSWebpackPlugin(),
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/.*/]),
	],
	optimization: {
        minimize: prod
    },
    devServer: {
        contentBase: resolve("public"),
        compress: false
    }
};


module.exports = config;