#include "js-interfaces.h"

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

char* save_model(Model model) {
    int success = XGBoosterSaveModel(*(model->first), "model.txt");
    if(success < 0) return NULL;
    FILE *f = fopen("model.txt", "rb");
    fseek(f, 0, SEEK_END);
    long fsize = ftell(f);
    fseek(f, 0, SEEK_SET);  //same as rewind(f);

    char *string = (char *) malloc((fsize + 1) * sizeof(char));
    fread(string, fsize, 1, f);
    fclose(f);

    string[fsize] = 0;
    return string;
}

Model load_model(const char* serialized) {
    FILE *f = fopen("model.txt", "w");
    fprintf(f, "%s", serialized);
    fclose(f);
    BoosterHandle* model = new BoosterHandle();
    int success = XGBoosterLoadModel(*model, "model.txt");
    if(success < 0) return NULL;
    return new std::pair<BoosterHandle*, DMatrixHandle*>(model, NULL);
}

void free_memory_model(Model model) {
    XGBoosterFree(*(model->first));
    if(*(model->second) != NULL) {
        XGDMatrixFree(*(model->second));
    }
    delete model;
}
