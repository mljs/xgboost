import loadXGBoost from './loadXGBoost';
const xgboost = require('../dist/wasm/xgboost');
module.exports = xgboost.isReady.then(l => loadXGBoost(l));
