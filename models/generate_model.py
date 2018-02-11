import xgboost as xgb
import numpy as np
from sklearn.datasets import load_iris

data = load_iris()
X = data.data
y = data.target

clf = xgb.XGBClassifier(objective='multi:softmax')
clf.fit(X, y)
print(clf.predict(X))

clf._Booster.save_model('output.model')