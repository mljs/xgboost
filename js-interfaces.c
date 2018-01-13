//
// Created by jefferson on 12/09/17.
//
#include "js-interfaces.h"

BoosterHandle* create_model() {
    return new BoosterHandle();
}

void set_param(BoosterHandle* model, const char* arg, const char* value) {
    XGBoosterSetParam(*model, arg, value);
}

void train(float* dataset, float* labels, int samples, int dimensions, BoosterHandle* model, int iterations) {
    DMatrixHandle h_train[1];
    XGDMatrixCreateFromMat(dataset, samples, dimensions, -1, &h_train[0]);
    XGDMatrixSetFloatInfo(h_train[0], "label", labels, samples);

    for (int i = 0; i < iterations; ++i) {
        XGBoosterUpdateOneIter(*model, i, h_train[0]);
    }

    XGDMatrixFree(h_train[0]);
}

const float* predict(BoosterHandle* model, float* dataset, int samples, int dimensions) {
    DMatrixHandle h_test;
    XGDMatrixCreateFromMat(dataset, samples, dimensions, -1, &h_test);
    bst_ulong out_len;
    const float *f;
    XGBoosterPredict(*model, h_test, 0, 0, &out_len, &f);
    XGDMatrixFree(h_test);

    return f;
}

void free_memory_model(BoosterHandle* model) {
    XGBoosterFree(*model);
}
