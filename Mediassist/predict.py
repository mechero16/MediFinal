import sys
import json
import joblib
import pandas as pd
import numpy as np
import os

# --- Load model and columns ---
MODEL_FILE = os.path.join("Model", "random_forest_model.pkl")
COLUMNS_FILE = os.path.join("Model", "X_train_columns.pkl")

if not os.path.exists(MODEL_FILE) or not os.path.exists(COLUMNS_FILE):
    print(json.dumps({"error": "Model or columns file not found"}))
    sys.exit(1)

rf_loaded = joblib.load(MODEL_FILE)
X_train_cols = joblib.load(COLUMNS_FILE)

def predict(symptoms):
    vector = np.zeros(len(X_train_cols))
    for symptom in symptoms:
        if symptom in X_train_cols:
            vector[X_train_cols.index(symptom)] = 1
    df = pd.DataFrame([vector], columns=X_train_cols)
    
    rf_prediction = rf_loaded.predict(df)[0]
    rf_proba = rf_loaded.predict_proba(df)[0]
    
    # Confidence of the predicted class
    predicted_index = list(rf_loaded.classes_).index(rf_prediction)
    confidence = float(rf_proba[predicted_index] * 100)
    
    # Probabilities of all classes, sorted descending
    probabilities = {
        disease: float(prob*100) 
        for disease, prob in sorted(zip(rf_loaded.classes_, rf_proba), key=lambda x: x[1], reverse=True)
    }
    
    return {
        "predicted": rf_prediction,
        "confidence": confidence,
        "probabilities": probabilities
    }

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.stdin.read())
        symptoms = input_data.get("symptoms", [])
        result = predict(symptoms)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
