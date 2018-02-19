import loadXGBoost from './loadXGBoost';

var xgboostWASM = require('../dist/wasm/xgboost');

module.exports = xgboostWASM.isReady.then((l) => loadXGBoost(l));
