import loadXGBoost from './loadXGBoost';
const xgboostWASM = require('../dist/wasm/xgboost');
module.exports = xgboostWASM.isReady.then(l => loadXGBoost(l));
