#include "js-interfaces.h"

#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <fstream>
#include <string>
#include <memory>
#include <rabit/rabit.h>

Model create_model(float* dataset, float* labels, int rows, int cols) {
    BoosterHandle* model = new BoosterHandle();
    DMatrixHandle* h_train = new DMatrixHandle();
    XGDMatrixCreateFromMat(dataset, rows, cols, -1, h_train);
    XGDMatrixSetFloatInfo(*h_train, "label", labels, rows);
    XGBoosterCreate(h_train, 1, model);

    return new std::pair<BoosterHandle*, DMatrixHandle*>(model, h_train);
}

void set_param(Model model, char* arg, char* value) {
    XGBoosterSetParam(*(model->first), arg, value);
}

void train_full_model(Model model, int iterations) {
    for (int i = 0; i < iterations; ++i) {
        XGBoosterUpdateOneIter(*(model->first), i, *(model->second));
    }
}

float predict_one(Model model, float* dataset, int dimensions) {
    DMatrixHandle h_test;
    XGDMatrixCreateFromMat(dataset, 1, dimensions, -1, &h_test);
    bst_ulong out_len;
    const float *f;
    XGBoosterPredict(*(model->first), h_test, 0, 0, &out_len, &f);
    XGDMatrixFree(h_test);

    return f[0];
}

void free_memory_model(Model model) {
    XGBoosterFree(*(model->first));
    if((model->second) != nullptr) {
        XGDMatrixFree(*(model->second));
    }
    delete model;
}

int save_model(Model model) {
    int success = XGBoosterSaveModel(*(model->first), "testfile.model");
    if(success < 0) {
        return -1;
    }

    int size = 0;
    std::ifstream test("testfile.model", std::ifstream::binary);
    if(test) {
        std::filebuf* pbuf = test.rdbuf();
        size = static_cast<int>(pbuf->pubseekoff(0, test.end, test.in));
        test.close();
    }

    return size;
}

void get_file_content(char* buffer, int size) {
    std::unique_ptr<dmlc::Stream> fi(dmlc::Stream::Create("testfile.model", "r"));
    size_t readed = fi->Read(buffer, size);
}

Model load_model(char* serialized, int size) {
    std::unique_ptr<dmlc::Stream> fi(dmlc::Stream::Create("load.model", "w"));
    fi->Write(serialized, size);
    fi.reset();

    BoosterHandle* loadModel = new BoosterHandle();
    XGBoosterCreate(0, 0, loadModel);
    int success = XGBoosterLoadModel(*loadModel, "load.model");
    if(success < 0) {
        return nullptr;
    }

    return new std::pair<BoosterHandle*, DMatrixHandle*>(loadModel, nullptr);
}