#ifndef XGBOOST_JS_JS_INTERFACES_H
#define XGBOOST_JS_JS_INTERFACES_H

#include "xgboost/include/xgboost/c_api.h"

#include <utility>

typedef std::pair<BoosterHandle*, DMatrixHandle*>* Model;

#ifdef __cplusplus
extern "C" {
#endif

Model create_model(float* dataset, float* labels, int rows, int cols);
void set_param(Model model, char* arg, char* value);
void train_full_model(Model model, int iterations);
long predict_one(Model model, float* dataset, int dimensions, float* prediction);
long prediction_size(Model model, float* dataset, int dimensions, const float** output);
void free_memory_model(Model model);
int save_model(Model model);
void get_file_content(char* buffer, int size);
Model load_model(char* serialized, int size);

#ifdef __cplusplus
}
#endif

#endif //XGBOOST_JS_JS_INTERFACES_H
