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

    class XGBoost {
        constructor(options) {
            this.checkLabels = options.objective === 'multi:softmax';
            this.options = Object.assign({}, defaultOptions, options);
            for (var key in this.options) {
                this.options[key] = this.options[key].toString();
            }
        }

        train(data, labels) {
            if (this.checkLabels) {
                /* eslint-disable camelcase */
                this.options.num_class = new Set(labels).size.toString();
                /* eslint-enable camelcase */
            }

            var X = Matrix.checkMatrix(data);
            var rows = X.rows;
            var cols = X.columns;

            var flattenData = X.to1DArray();
            this.model = create_model(new Uint8Array(Float32Array.from(flattenData).buffer), new Uint8Array(Float32Array.from(labels).buffer), rows, cols);
            var variables = Object.keys(this.options);
            for (var i = 0; i < variables.length; ++i) {
                var variable = variables[i];
                var value = this.options[variable];
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
            free_model(this.model);
        }
    }

    return XGBoost;
}
