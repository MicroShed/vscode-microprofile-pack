/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT license.
 * @see https://github.com/microsoft/vscode-java-pack/blob/master/webpack.config.js
 */
const webpack = require('webpack');
const path = require('path');

module.exports = function (env, argv) {
  env = env || {};

  return [{
    name: 'assets',
    mode: 'none',
    entry: {
      overview: './src/overview/assets/index.ts'
    },
    module: {
      rules: [{
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }, {
        test: /\.(scss)$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }, {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                [
                  "autoprefixer",
                  {
                    // Options
                  },
                ],
              ],
            },
            // plugins: function () {
            //   return [require('autoprefixer')];
            // }
          }
        }, {
          loader: 'sass-loader'
        }]
      }]
    },
    output: {
      filename: 'assets/[name]/index.js',
      path: path.resolve(__dirname, 'out'),
      publicPath: '/',
      devtoolModuleFilenameTemplate: "../[resource-path]"
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      })
    ],
    devtool: 'source-map',
    resolve: {
      extensions: ['.js', '.ts', '.tsx']
    }
  }, {
    name: 'extension',
    target: 'node',
    mode: 'none',
    entry: {
      extension: './src/extension.ts'
    },
    module: {
      rules: [{
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }]
    },
    resolve: {
      modules: ['node_modules', path.resolve(__dirname, 'src')],
      mainFiles: ['index'],
      extensions: ['.js', '.ts', '.json']
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'out'),
      libraryTarget: "commonjs2",
      publicPath: '/',
      devtoolModuleFilenameTemplate: "../[resource-path]"
    },
    externals: {
      vscode: 'commonjs vscode'
    },
    devtool: 'source-map'
  }]
};
