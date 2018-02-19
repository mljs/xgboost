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
import IrisDataset from 'ml-dataset-iris';

require('ml-xgboost').then(XGBoost => {
    var booster = new XGBoost({
        booster: 'gbtree',
        objective: 'multi:softmax',
        max_depth: 5,
        eta: 0.1,
        min_child_weight: 1,
        subsample: 0.5,
        colsample_bytree: 1,
        silent: 1,
        iterations: 200
    });

    var trainingSet = IrisDataset.getNumbers();
    var predictions = IrisDataset.getClasses().map(
        (elem) => IrisDataset.getDistinctClasses().indexOf(elem)
    );

    booster.train(dataset, trueLabels);
    var predictDataset = /* something to predict */
    var predictions = booster.predict(predictDataset);

    // don't forget to free your model
    booster.free()

    // you can save your model in this way
    var model = JSON.stringify(booster); // string
    // or
    var model = booster.toJSON(); // object

    // and load it
    var anotherBooster = XGBoost.load(model); // model is an object, not a string
});
```

## Development

* You should have [emscripten sdk-1.37.22](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html) installed on your computer and be able to use `emcc` and `em++`.
* Download the repo: `git clone --recursive https://github.com/mljs/xgboost`
* Run `npm run build` or `make` at the root directory.

## XGBoost library files changed

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

## License

© Contributors, 2016. Licensed under an [Apache-2](./LICENSE) license.

[npm-image]: https://img.shields.io/npm/v/ml-xgboost.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/ml-xgboost
[travis-image]: https://img.shields.io/travis/mljs/xgboost/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/mljs/xgboost
[david-image]: https://img.shields.io/david/mljs/xgboost.svg?style=flat-square
[david-url]: https://david-dm.org/mljs/xgboost
[download-image]: https://img.shields.io/npm/dm/ml-xgboost.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/ml-xgboost
