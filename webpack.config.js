const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default;

const resolve = (file) => path.resolve(__dirname, file);

const notInline = [/Platforms.tsx$/];

let commitHash = "unknown";
try {
    commitHash = require("child_process").execSync("git rev-parse --short HEAD").toString().trim();
} catch (e) {
    console.log("Can't run git");
}

module.exports = (env) => {
    const isProd = env.production == true;
    if (!isProd) console.log("DEV BUILD");

    return {
        target: "web",
        entry: {
            app: resolve("app/index.tsx"),
            report: resolve("report/index.tsx"),
        },
        mode: isProd ? "production" : "development",
        output: {
            path: resolve("dist"),
            publicPath: "/",
            clean: true,
        },
        module: {
            rules: [
                { test: /WorkerApp/, loader: "worker-loader" },
                { test: /WorkerReport/, loader: "worker-loader", options: { inline: "fallback" } },
                { test: /\.tsx?$/, loader: "ts-loader", exclude: [/node_modules/] },
                {
                    test: /\.less$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        { loader: "css-loader" },
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    plugins: [require("autoprefixer"), require("cssnano")],
                                },
                            },
                        },
                        {
                            loader: "less-loader",
                            options: { lessOptions: { javascriptEnabled: true } },
                        },
                    ],
                },
                {
                    test: /\.(svg|png|jpe?g|gif|mp4)$/,
                    loader: "file-loader",
                    options: {
                        name: "[hash:8].[ext]",
                    },
                    issuer: {
                        // force NOT inline the following issuers
                        and: notInline,
                    },
                },
                {
                    test: /\.(svg|png|jpe?g|gif|mp4)$/,
                    loader: "url-loader",
                    options: {
                        limit: 2 ** 16, // inline everything
                        name: "[hash:8].[ext]",
                    },
                    issuer: {
                        not: notInline,
                    },
                },
            ],
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx"],
            // NOTE: keep in sync with tsconfig.json and package.json
            alias: {
                "@app": resolve("app/"),
                "@assets": resolve("assets/"),
                "@pipeline": resolve("pipeline/"),
                "@report": resolve("report/"),
            },
            fallback: {
                fs: false,
                path: false,
                crypto: false,
            },
        },
        plugins: [
            new HtmlWebpackPlugin({
                chunks: ["app"],
                template: resolve("assets/app.html"),
                filename: "index.html",
                minify: isProd,
            }),
            new HtmlWebpackPlugin({
                chunks: ["report"],
                template: resolve("assets/report.html"),
                filename: "report.html",
                minify: isProd,
            }),
            new MiniCssExtractPlugin(),
            new webpack.DefinePlugin({
                env: {
                    isProd: JSON.stringify(isProd),
                    isDev: JSON.stringify(!isProd),
                    build: JSON.stringify({
                        hash: commitHash,
                        date: new Date().toISOString(),
                    }),
                },
            }),
            new CopyPlugin({
                patterns: [resolve("assets/public")],
            }),
        ].concat(
            isProd
                ? [
                      new HTMLInlineCSSWebpackPlugin({ filter: (f) => f.includes("report") }),
                      new InlineChunkHtmlPlugin([/report/]),
                  ]
                : []
        ),
        optimization: {
            minimize: isProd,
        },
        devtool: isProd ? undefined : "source-map",
        devServer: {
            allowedHosts: "all",
            client: {
                overlay: true,
                progress: true,
            },
            compress: true,
        },
    };
};

// Based on react-dev-utils/InlineChunkHtmlPlugin.js
class InlineChunkHtmlPlugin {
    constructor(tests) {
        this.tests = tests;
    }

    getInlinedTag(publicPath, assets, tag) {
        if (tag.tagName !== "script" || !(tag.attributes && tag.attributes.src)) {
            return tag;
        }
        const scriptName = publicPath ? tag.attributes.src.replace(publicPath, "") : tag.attributes.src;
        if (!this.tests.some((test) => scriptName.match(test))) {
            return tag;
        }
        const asset = assets[scriptName];
        if (asset == null) {
            return tag;
        }
        return { tagName: "script", innerHTML: asset.source(), closeTag: true };
    }

    apply(compiler) {
        let publicPath = compiler.options.output.publicPath || "";
        if (publicPath && !publicPath.endsWith("/")) {
            publicPath += "/";
        }

        compiler.hooks.compilation.tap("InlineChunkHtmlPlugin", (compilation) => {
            const tagFunction = (tag) => this.getInlinedTag(publicPath, compilation.assets, tag);

            const hooks = HtmlWebpackPlugin.getHooks(compilation);
            hooks.alterAssetTagGroups.tap("InlineChunkHtmlPlugin", (assets) => {
                assets.headTags = assets.headTags.map(tagFunction);
                assets.bodyTags = assets.bodyTags.map(tagFunction);
            });
        });
    }
}
