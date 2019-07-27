const path = require("path");

module.exports = {
    mode: "development",
    entry: {
        activity: "./main.ts"
    },
    output: {
        filename: "activity.js",
        libraryTarget: "umd",
        path: path.resolve(__dirname, "dist")
    },
    devServer: {
        contentBase: [
            path.join(__dirname),
            path.join(__dirname, "node_modules/@calculemus/oli-hammock/assets"),
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [ { test: /.ts$/, loader: "ts-loader"} ]
    },
    externals: {
    },
}
