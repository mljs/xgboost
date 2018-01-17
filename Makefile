CC = emcc
CXX = em++

ifndef RABIT
	RABIT = xgboost/rabit
endif

ifndef DMLC_CORE
	DMLC_CORE = xgboost/dmlc-core
endif

CFLAGS = -g4 -Wall -fPIC --memory-init-file 0 -std=c++11
CFLAGS += -I$(DMLC_CORE)/include -I$(RABIT)/include -Ixgboost/include
BUILD_DIR=dist
EXPORTED_FUNCTIONS="['_create_model', '_set_param', '_train_full_model', '_predict_one', '_free_memory_model', '_save_model', '_get_file_content', '_load_model']"
COMPILED_FILES = xgboost/lib/libxgboost.so

all:
	cd xgboost; make -j4 config=../make/minimum.mk; cd ..;
	mkdir -p $(BUILD_DIR)/wasm;
	$(CXX) $(CFLAGS) js-interfaces.cpp $(COMPILED_FILES) -o $(BUILD_DIR)/wasm/xgboost.js --pre-js src/wasmPreJS.js -s WASM=1 -s "BINARYEN_METHOD='native-wasm'" -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS) -s SAFE_HEAP=1
	# mkdir -p $(BUILD_DIR)/asm;
	# $(CXX) $(CFLAGS) js-interfaces.cpp $(COMPILED_FILES) -o $(BUILD_DIR)/asm/xgboost.js --pre-js src/asmPreJS.js -s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS) -s ASSERTIONS=10 -s ALLOW_MEMORY_GROWTH=1

clean:
	cd xgboost; make clean_all; cd ..;

test:
	cd xgboost; make -j4 config=make/minimum.mk; cd ..;
	$(CXX) $(CFLAGS) js-interfaces.cpp -c
	$(CXX) $(CFLAGS) main.cpp -o main.html $(COMPILED_FILES) -s ASSERTIONS=1 -s WASM=1 js-interfaces.o