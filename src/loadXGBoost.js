var Matrix = require('ml-matrix').Matrix;

module.exports = function (xgboost) {
    /* eslint-disable camelcase */
    const create_model = xgboost.cwrap('create_model', 'number', ['array', 'array', 'number', 'number']);
    const free_model = xgboost.cwrap('free_memory_model', null, ['number']);
    const set_param = xgboost.cwrap('set_param', null, ['number', 'string', 'string']);
    const train = xgboost.cwrap('train_full_model', null, ['number', 'number']);
    const predict_one = xgboost.cwrap('predict_one', 'number', ['number', 'array', 'number']);
    /* eslint-enable camelcase */

    const defaultOptions = {
        "booster": "gbtree",
        "objective": "reg:linear",
        "max_depth": "5",
        "eta": "0.1",
        "min_child_weight": "1",
        "subsample": "0.5",
        "colsample_bytree": "1",
        "silent":"1"
    };

    class XGBoost {
        constructor(options) {
        }

        train(data, labels) {

            var X = Matrix.checkMatrix(data);
            var rows = X.rows;
            var cols = X.columns;

            var flattenData = X.to1DArray();
            this.model = create_model(new Uint8Array(Float32Array.from(flattenData).buffer), new Uint8Array(Float32Array.from(labels).buffer), rows, cols);
            console.log("model created");
            var variables = Object.keys(defaultOptions);
            for(var i = 0; i < variables.length; ++i) {
                var variable = variables[i];
                var value = defaultOptions[variable];
                console.log(variable, value);
                set_param(this.model, variable, value);
            }

            train(this.model, 200);
        }

        predict(data) {
            var Xtest = Matrix.checkMatrix(data);
            var result = new Array(Xtest.rows);
            for (var i = 0; i < Xtest.rows; i++) {
                var current = Xtest.getRow(i);
                result[i] = predict_one(this.model, new Uint8Array(Float32Array.from(current).buffer), Xtest.columns);
            }

            return result;
        }

        free() {
            console.log("free");
            free_model(this.model);
        }
    }

    return XGBoost;
};
