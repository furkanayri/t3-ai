const path = require("path");
const { merge } = require("webpack-merge");

const TerserPlugin = require("terser-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

var config = {
    target: "node",
    externals: [nodeExternals()],
    entry: "./server.ts",
    output: {
        path: path.join(__dirname, "dist"),
        filename: "dist.js",
        chunkFilename: "dist.js",
        publicPath: "/",
    },
    mode: "production",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: {
            "@": path.resolve(__dirname, "./"),
        },
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.(ts|tsx)$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        babelrc: false,
                        presets: ["@babel/preset-env"],
                        plugins: [
                            [
                                "@babel/plugin-proposal-class-properties",
                                "babel-plugin-syntax-dynamic-import",
                                { loose: true },
                            ],
                        ],
                    },
                },
            },
        ],
    },

    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [{ from: "utils/mail/views", to: "views" }, { from: "flow-config.json", to: "flow-config.json" }],

        }),
    ],
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                minify: TerserPlugin.swcMinify,
                terserOptions: {
                    compress: true,
                },
            }),
        ],
    },
};

module.exports = merge(config, {
    mode: "production",
});