module.exports = function (xgboost) {
    /* eslint-disable camelcase */
    /*
    const predict_one_probability = xgboost.cwrap('libsvm_predict_one_probability', 'number', ['number', 'array', 'number', 'number']);
    const add_instance = xgboost.cwrap('add_instance', null, ['number', 'array', 'number', 'number', 'number']);
    const create_svm_nodes = xgboost.cwrap('create_svm_nodes', 'number', ['number', 'number']);
    const train_problem = xgboost.cwrap('libsvm_train_problem', 'number', ['number', 'string']);
    const svm_get_nr_sv = xgboost.cwrap('svm_get_nr_sv', 'number', ['number']);
    const svm_get_nr_class = xgboost.cwrap('svm_get_nr_class', 'number', ['number']);
    const svm_get_sv_indices = xgboost.cwrap('svm_get_sv_indices', null, ['number', 'number']);
    const svm_get_labels = xgboost.cwrap('svm_get_labels', null, ['number', 'number']);
    const svm_free_model = xgboost.cwrap('svm_free_model', null, ['number']);
    const svm_cross_validation = xgboost.cwrap('libsvm_cross_validation', null, ['number', 'string', 'number', 'number']);
    const free_problem = xgboost.cwrap('free_problem', null, ['number']);
    const serialize_model = xgboost.cwrap('serialize_model', 'number', ['number']);
    const deserialize_model = xgboost.cwrap('deserialize_model', 'number', ['string']);
    */

    const create_model = xgboost.cwrap('create_model', 'number');
    const set_param = xgboost.cwrap('set_param', null, ['number', 'string', 'string']);
    //const train = xgboost.cwrap('train', null, ['array', 'array', 'number', 'number']);
    //const predict = xgboost.cwrap('predict', 'array', ['number', 'array', 'number', 'number']);
    const free_memory_model = xgboost.cwrap('free_memory_model', null, ['number']);
    //const free_memory_matrix = xgboost.cwrap('free_memory_matrix', null, ['number']);
    /* eslint-enable camelcase */

    class XGBoost {
        constructor(options = {}) {
            this.model = create_model();
            var keys = Object.keys(options);
            for(var i = 0; i < keys.length; ++i) {
                console.log(keys[i], options[keys[i]]);
                set_param(this.model, keys[i], options[keys[i]]);
            }
        }

        free() {
            free_memory_model(this.model);
        }
    }

    return XGBoost;
};
