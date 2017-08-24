let webpack = require('webpack'),
    path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    ClosureCompilerPlugin = require('webpack-closure-compiler');

let cfg = {
    entry: ['whatwg-fetch', path.join(__dirname, './src')],
    output: {
        path: path.join(__dirname, '../static'),
        filename: 'scripts/bundle-[hash].js',
        publicPath: '/static'
    },
    module: {
        rules: [
        /*
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }, */
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({ 
                    fallback: 'style-loader',
                    use: {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            camelCase: true,
                            localIdentName: '[sha1:hash:base64:7]'
                        }
                    }
                })
            }
        ]
    },
    plugins: [    
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new HtmlWebpackPlugin({
            title: 'Daily Notices',
            filename: 'html/app.html',
            template: path.join(__dirname, 'tpl-app.ejs')
        }),
        new ExtractTextPlugin('styles/bundle-[hash].css'),
        new ClosureCompilerPlugin({
            compiler: {
                language_out: 'ECMASCRIPT5',
                compilation_level: 'SIMPLE'
            }
        })
    ]
};

module.exports = cfg;
