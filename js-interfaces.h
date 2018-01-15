#ifndef XGBOOST_JS_JS_INTERFACES_H
#define XGBOOST_JS_JS_INTERFACES_H

#include "xgboost/include/xgboost/c_api.h"

#include <utility>
#include <iostream>
#include <cstdio>

typedef std::pair<BoosterHandle*, DMatrixHandle*>* Model;

#ifdef __cplusplus
extern "C" {
#endif

Model create_model(float* dataset, float* labels, int rows, int cols);
void set_param(Model model, char* arg, char* value);
void train_full_model(Model model, int iterations);
float predict_one(Model model, float* dataset, int dimensions);
void free_memory_model(Model model);
char* save_model(Model model);
Model load_model(const char* serialized);

#ifdef __cplusplus
}
#endif

#endif //XGBOOST_JS_JS_INTERFACES_H
