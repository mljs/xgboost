import Matrix from 'ml-matrix';

export default function loadXGBoost(xgboost) {
    /* eslint-disable camelcase */
    const create_model = xgboost.cwrap('create_model', 'number', ['array', 'array', 'number', 'number']);
    const free_model = xgboost.cwrap('free_memory_model', null, ['number']);
    const set_param = xgboost.cwrap('set_param', null, ['number', 'string', 'string']);
    const train = xgboost.cwrap('train_full_model', null, ['number', 'number']);
    const predict_one = xgboost.cwrap('predict_one', 'number', ['number', 'array', 'number']);

    const defaultOptions = {
        booster: 'gbtree',
        objective: 'reg:linear',
        max_depth: 5,
        eta: 0.1,
        min_child_weight: 1,
        subsample: 0.5,
        colsample_bytree: 1,
        silent: 1
    };
    /* eslint-enable camelcase */

    /**
     * @class XGBoost
     */
    class XGBoost {

        /**
         * @param {object} options - Same parameters described [here](https://github.com/dmlc/xgboost/blob/master/doc/parameter.md), Default parameters below.
         * @param {string} [options.booster='gbtree']
         * @param {string} [options.objective='reg:linear']
         * @param {number} [options.max_depth=5]
         * @param {number} [options.eta=0.1]
         * @param {number} [options.min_child_weight=1]
         * @param {number} [options.subsample=0.5]
         * @param {number} [options.colsample_bytree=1]
         * @param {number} [options.silent=1]
         */
        constructor(options) {
            this.checkLabels = options.objective === 'multi:softmax';
            this.options = Object.assign({}, defaultOptions, options);
            for (var key in this.options) {
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
                var value = this.options[variable];
                set_param(this.model, variable, value);
            }

            train(this.model, 200);
        }

        /**
         * Predicts the output given the matrix to predict.
         * @param {Matrix|Array<Array<number>>} toPredict
         * @return {Array<number>} predictions
         */
        predict(toPredict) {
            var Xtest = Matrix.checkMatrix(toPredict);
            var predictions = new Array(Xtest.rows);
            for (var i = 0; i < Xtest.rows; i++) {
                var current = Xtest.getRow(i);
                predictions[i] = predict_one(this.model, new Uint8Array(Float32Array.from(current).buffer), Xtest.columns);
            }

            return predictions;
        }

        /**
         * Free the memory allocated for the model. Since this memory is stored in the memory model of emscripten,
         * it is allocated within an ArrayBuffer and WILL NOT BE GARBARGE COLLECTED, you have to explicitly free it.
         * So not calling this will result in memory leaks. As of today in the browser, there is no way to hook the
         * garbage collection of the SVM object to free it automatically. Free the memory that was created by the
         * compiled libsvm library to. store the model. This model is reused every time the predict method is called.
         */
        free() {
            free_model(this.model);
        }
    }

    return XGBoost;
}
