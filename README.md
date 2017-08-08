# webpack EmitAllPlugin

[![CircleCI](https://circleci.com/gh/DrewML/webpack-emit-all-plugin.svg?style=svg)](https://circleci.com/gh/DrewML/webpack-emit-all-plugin)

[webpack](https://webpack.js.org/), but without the `pack`. The `EmitAllPlugin` will emit all files in the dependency tree to `output.path` as separate files, allowing you to use loaders/plugins without the need to bundle, which can be useful for some specific use-cases.

Inspired by [this tweet](https://twitter.com/thejameskyle/status/894730299845652481).

## Install
```sh
npm install -D webpack-emit-all-plugin
```

## Usage
In your `webpack.config.js`:
```js
const path = require('path');
const EmitAllPlugin = require('webpack-emit-all-plugin');
{
    plugins: [
        new EmitAllPlugin({
            ignorePattern: /node_modules/ // default,
            path: path.join(__dirname, 'unbundled-out') // defaults to `output.path`
        })
    ]
}
```
