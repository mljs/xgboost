import loadXGBoost from './loadXGBoost';
import * as xgboostWASM from '../dist/wasm/xgboost';
module.exports = xgboostWASM.isReady.then(l => loadXGBoost(l));
