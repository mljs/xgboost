import fs from 'fs';

import Matrix from 'ml-matrix';


export default function loadXGBoost(xgboost) {
  /* eslint-disable camelcase */
  const create_model = xgboost.cwrap('create_model', 'number', ['array', 'array', 'number', 'number']);
  const free_model = xgboost.cwrap('free_memory_model', null, ['number']);
  const set_param = xgboost.cwrap('set_param', null, ['number', 'string', 'string']);
  const train = xgboost.cwrap('train_full_model', null, ['number', 'number']);
  const predict_one = xgboost.cwrap('predict_one', 'number', ['number', 'array', 'number', 'number']);
  const predict_size = xgboost.cwrap('prediction_size', 'number', ['number', 'array', 'number', 'number']);
  const save_model = xgboost.cwrap('save_model', 'number', ['number']);
  const get_file_content = xgboost.cwrap('get_file_content', null, ['number', 'number']);
  const load_model = xgboost.cwrap('load_model', 'number', ['number', 'number']);

  const defaultOptions = {
    booster: 'gbtree',
    objective: 'reg:linear',
    max_depth: 5,
    eta: 0.1,
    min_child_weight: 1,
    subsample: 0.5,
    colsample_bytree: 1,
    silent: 1,
    iterations: 200,
    predictionSize: 1
  };
    /* eslint-enable camelcase */


  class XGBoost {

    /**
     * @constructor
     * @param {object} options - Same parameters described [here](https://github.com/dmlc/xgboost/blob/master/doc/parameter.md), Default parameters below.
     * @param {string} [options.booster='gbtree']
     * @param {string} [options.objective='reg:linear']
     * @param {number} [options.max_depth=5]
     * @param {number} [options.eta=0.1]
     * @param {number} [options.min_child_weight=1]
     * @param {number} [options.subsample=0.5]
     * @param {number} [options.colsample_bytree=1]
     * @param {number} [options.silent=1]
     * @param {number} [options.iterations=200]
     * @param {object} model - for load purposes.
     */
    constructor(options, model) {
      if (options === true) {
        var array = new Uint8Array(model.model);
        var offset = xgboost._malloc(array.length);
        xgboost.HEAPU8.set(array, offset);
        this.model = load_model(offset, array.length);
        xgboost._free(offset);

        if (this.model === 0) {
          throw new Error('Error while loading the model!');
        }
        this.options = model.options;
      } else {
        this.checkLabels = options.objective === 'multi:softmax';
        this.options = Object.assign({}, defaultOptions, options);
      }

      for (var key in this.options) {
        if (key === 'iterations' || key === 'labels') {
          continue;
        }
        this.options[key] = this.options[key].toString();
      }
    }

    /**
     * Train the decision tree with the given training set and labels.
     * @param {Matrix|Array<Array<number>>} trainingSet
     * @param {Array<number>} trainingValues
     */
    train(trainingSet, trainingValues) {
      if (this.checkLabels) {
        /* eslint-disable camelcase */
        this.options.num_class = new Set(trainingValues).size.toString();
        /* eslint-enable camelcase */
      }

      var X = Matrix.checkMatrix(trainingSet);
      var rows = X.rows;
      var cols = X.columns;

      var flattenData = X.to1DArray();
      this.model = create_model(new Uint8Array(Float32Array.from(flattenData).buffer), new Uint8Array(Float32Array.from(trainingValues).buffer), rows, cols);
      var variables = Object.keys(this.options);
      for (var i = 0; i < variables.length; ++i) {
        var variable = variables[i];
        if (variable === 'iterations') {
          continue;
        }

        var value = this.options[variable];
        set_param(this.model, variable, value);
      }

      train(this.model, this.options.iterations);
    }

    /**
     * Predicts the output given the matrix to predict.
     * @param {Matrix|Array<Array<number>>} toPredict
     * @return {Array<number>} predictions
     */
    predict(toPredict) {
      var Xtest = Matrix.checkMatrix(toPredict);
      var predictions = new Array(Xtest.rows);
      var predictionSize = predict_size(this.model, new Uint8Array(Float32Array.from(Xtest.getRow(0)).buffer), Xtest.columns, undefined);
      if (this.options.labels && this.options.labels.length !== predictionSize) {
        throw new RangeError(`The number of labels is not the same as the prediction size. Labels: ${this.options.labels.length}, Prediction size: ${predictionSize}`);
      }

      for (var i = 0; i < Xtest.rows; i++) {
        var current = Xtest.getRow(i);
        var predictionPointer = xgboost._malloc(predictionSize * 4);
        xgboost.HEAPF32.set(new Float32Array(predictionSize), predictionPointer / 4);


        predictionSize = predict_one(this.model, new Uint8Array(Float32Array.from(current).buffer), Xtest.columns, predictionPointer);

        var isSizeOne = predictionSize === 1;
        var prediction = isSizeOne ? xgboost.getValue(predictionPointer, 'float') : new Array(predictionSize);
        if (!isSizeOne) {
          for (var j = 0; j < predictionSize; ++j) {
            prediction[j] = xgboost.getValue(predictionPointer + j * 4, 'float');
          }
        }
        predictions[i] = prediction;
        xgboost._free(predictionPointer);
      }

      if (this.options.labels) {
        var predictedLabels = new Array(predictions.length);
        predictions = Matrix.checkMatrix(predictions);
        for (i = 0; i < predictions.length; ++i) {
          predictedLabels[i] = this.options.labels[predictions.maxRowIndex(i)[1]];
        }

        predictions = predictedLabels;
      }

      return predictions;
    }

    /**
     * Export the current model to JSON.
     * @return {object} - Current model.
     */
    toJSON() {
      if (!this.model) throw new Error('No model trained to save');
      var size = save_model(this.model);
      if (size === -1) {
        throw new Error('Error while saving the model, please report this error');
      }

      var offset = xgboost._malloc(size);
      xgboost.HEAPU8.set(new Uint8Array(size), offset);
      get_file_content(offset, size);
      var array = new Array(size);
      for (var i = 0; i < size; ++i) {
        array[i] = xgboost.getValue(offset + i, 'i8');
      }
      xgboost._free(offset);

      return {
        name: 'ml-xgboost',
        model: array,
        options: this.options
      };
    }

    /**
     * Load a Decision tree classifier with the given model.
     * @param {object} model
     * @return {XGBoost}
     */
    static load(model) {
      if (model.name !== 'ml-xgboost') {
        throw new RangeError(`Invalid model: ${model.name}`);
      }

      return new XGBoost(true, model);
    }

    /**
     * Load a model trained from other programming language
     * @param {string} filepath
     * @param {object} options
     * @param {Array} [options.labels] - Some classifiers are trained with a one-hot encoder (Ex: Python API) so the
     * current classifier returns the probability of each class, if you want the single predictions, you should provide
     * an array with the corresponding labels, if you are doing regression you should ignore this option
     * @return {XGBoost} model
     */
    static loadFromModel(filepath, options = {}) {
      var binary = fs.readFileSync(filepath);
      return new XGBoost(true, {
        model: binary,
        options: options
      });
    }

    /**
     * Free the memory allocated for the model. Since this memory is stored in the memory model of emscripten,
     * it is allocated within an ArrayBuffer and WILL NOT BE GARBARGE COLLECTED, you have to explicitly free it.
     * So not calling this will result in memory leaks. As of today in the browser, there is no way to hook the
     * garbage collection of the XGBoost object to free it automatically. Free the memory that was created by the
     * compiled XGBoost library to. store the model. This model is reused every time the predict method is called.
     */
    free() {
      free_model(this.model);
    }
  }

  return XGBoost;
}
