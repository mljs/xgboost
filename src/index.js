import * as xgboostWASM from '../dist/wasm/xgboost';

import loadXGBoost from './loadXGBoost';

module.exports = xgboostWASM.isReady.then((l) => loadXGBoost(l));
