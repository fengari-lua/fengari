const webpack = require('webpack');
const path = require('path');
const BabiliPlugin = require("babili-webpack-plugin");

module.exports = [
    {
        entry: './src/fengari.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'fengari.js',
            library: 'fengari'
        },
        plugins: [
            new webpack.DefinePlugin({
                WEB: JSON.stringify(true),
            })
        ]
    },
    {
        entry: './src/fengari.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'fengari.min.js',
            library: 'fengari'
        },
        plugins: [
            new BabiliPlugin(),
            new webpack.DefinePlugin({
                WEB: JSON.stringify(true),
            })
        ]
    }
];
