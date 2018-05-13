const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BabelPlugin = require("babel-webpack-plugin");

module.exports = {
 entry: './src/app.js',
 output: {
   path: path.resolve(__dirname, 'dist'),
   filename: 'app.[chunkhash:8].js'
 },
 module: {
   // loaders: []
   rules: [
   {
     test: /\.js$/,
     exclude: /node_modules/,
     loader: 'babel-loader'
   },
   {
    test: /\.css$/,
    use: ExtractTextPlugin.extract({
      fallback: "style-loader",
      use: "css-loader"
    })
  }
  ]
},
plugins: [

new webpack.optimize.UglifyJsPlugin({
  compress: {
   warnings: false
 },
 sourceMap: true 
}),
new HtmlWebpackPlugin({
  filename: "index.html",
  template: path.resolve(__dirname, 'index.html'),
  inject: true,
  hash: true,
  minify: {
    removeComments: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true,
    // more options:
    // https://github.com/kangax/html-minifier#options-quick-reference
  },
  // necessary to consistently work with multiple chunks via CommonsChunkPlugin
  chunksSortMode: 'dependency',
}),
new ExtractTextPlugin({
  allChunks: true,
  filename: '[name].[contenthash:8].css'
}),
new CopyWebpackPlugin([
{
  from: path.resolve(__dirname, 'static'),
  to: path.resolve(__dirname, 'dist'),
  ignore: ['.*']
}
]),
]
};