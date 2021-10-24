const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default;
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const webpack = require('webpack');

const mode = process.env.MODE || 'development';
const prod = !(mode === "development");
const resolve = (file) => path.resolve(__dirname, file);

console.log("Mode:", mode);

const config = {
    target: "web",
    entry: {
        index: resolve("site/Index.tsx"),
        report: resolve("site/Report.tsx")
    },
    mode,
    output: {
        path: resolve("dist"),
        publicPath: '/',
        clean: true
    },
    module: {
        rules: [
            { test: /worker\./i, loader: "worker-loader" },
            { test: /\.tsx?$/, loader: "ts-loader", exclude: [/node_modules/] },
			{ test: /\.less$/, use: [
                MiniCssExtractPlugin.loader,
                { loader: "css-loader" },
                { loader: 'postcss-loader', options: { postcssOptions: { plugins: [require("autoprefixer"), require("cssnano")] } } },
                { loader: "less-loader", options: { lessOptions: { javascriptEnabled: true } } }
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
            minify: prod
		}),
        new MiniCssExtractPlugin(),
	].concat(prod ? [
        new HTMLInlineCSSWebpackPlugin(),
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/.*/]),   
    ] : [
        new webpack.HotModuleReplacementPlugin()
    ]),
	optimization: {
        minimize: prod
    },
    devtool: prod ? undefined : 'source-map',
    devServer: {
        host: '0.0.0.0',
        static: {
            publicPath: resolve("public"),
        },
        client: {
            overlay: true,
            progress: true
        },
        compress: true
    }
};

module.exports = config;
