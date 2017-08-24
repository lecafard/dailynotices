let webpack = require('webpack'),
    path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin');

let cfg = {
    entry: [path.join(__dirname, './src')],
    output: {
        path: path.join(__dirname, '../static'),
        filename: 'dev/scripts/bundle.js',
        publicPath: '/static'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [ 'style-loader', {
                    loader: 'css-loader',
                    options: {
                        modules: true,
                        camelCase: true,
                        localIdentName: '[sha1:hash:base64:7]'
                    }
                }]
            }
        ]
    },
    plugins: [new HtmlWebpackPlugin({
        title: 'Fake DailyNoticesDev',
        filename: 'html/app.html',
        template: path.join(__dirname, 'tpl-app.ejs')
    })]
};

module.exports = cfg;
