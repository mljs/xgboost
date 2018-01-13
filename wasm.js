'use strict';

const loadXGBoost = require('./src/loadXGBoost');
const xgboost = require('./dist/wasm/xgboost');
module.exports = xgboost.isReady.then(l => loadXGBoost(l));