# xgboost

  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![David deps][david-image]][david-url]
  [![npm download][download-image]][download-url]



## Installation

`$ npm install ml-xgboost`

## [API Documentation](https://mljs.github.io/xgboost/)

## Example

```js
const xgboost = require('ml-xgboost');
```

## Development

* You should have [emscripten](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html) installed on your computer and be able to use `emcc` and `em++`.
* Download the repo: `git clone --recursive https://github.com/mljs/xgboost`
* change lines inside of the xgboost library files:
    * dmlc-core/include/dmlc/base.h line 45 [here](./xgboost/dmlc-core/include/dmlc/base.h)
    * rabit/include/dmlc/base.h line 45 [here](./xgboost/rabit/include/dmlc/base.h)

       ```C++
       #if (!defined(DMLC_LOG_STACK_TRACE) && defined(__GNUC__) && !defined(__MINGW32__))
       #define DMLC_LOG_STACK_TRACE 1
       #undef DMLC_LOG_STACK_TRACE
       #endif
       ```
       **Note**: this is to avoid compilation issues with the execinfo.h library that is not needed in the JS library
    * in case that you get the following error:

        `./xgboost/include/xgboost/c_api.h:29:9: error: unknown type name 'uint64_t'`

        just add this import at the beginning of [this](./xgboost/include/xgboost/c_api.h) file after the first `define`:

        ```C++
        #include <stdint.h>
        ```
* Run `npm run build` at the root directory.

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/ml-xgboost.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/ml-xgboost
[travis-image]: https://img.shields.io/travis/mljs/xgboost/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/mljs/xgboost
[david-image]: https://img.shields.io/david/mljs/xgboost.svg?style=flat-square
[david-url]: https://david-dm.org/mljs/xgboost
[download-image]: https://img.shields.io/npm/dm/ml-xgboost.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/ml-xgboost
