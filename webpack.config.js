const path = require('path');
// const webpack = require("webpack");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
    entry: path.resolve(__dirname, './public/js/importFace.js'), // 入口文件
    output: {
        path: path.resolve(__dirname, './public/js/dist'), // 输出目录
        filename: 'importFace.js' // 输出文件名
    },
    // resolve: {
    //     fallback: {
    //         buffer: require.resolve('buffer/'),
    //     }
    // },
    // plugins: [
    //     // new webpack.ProvidePlugin({
    //     //     Buffer: ['buffer', 'Buffer'],
    //     // }),
    //     new NodePolyfillPlugin()
    // ],
    resolve: {
        fallback: {
            fs: false
        }
    },
};