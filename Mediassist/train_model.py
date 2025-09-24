import os
import zipfile
import sys
import kagglehub
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import plotly.figure_factory as ff

# ==========================
# Configuration
# ==========================
BASE_DIR = "Model"
os.makedirs(BASE_DIR, exist_ok=True)
MODEL_FILE = os.path.join(BASE_DIR, "random_forest_model.pkl")
COLUMNS_FILE = os.path.join(BASE_DIR, "X_train_columns.pkl")
DATASET_NAME = "kaushil268/disease-prediction-using-machine-learning"

# ==========================
# Download dataset
# ==========================
print("📥 Downloading dataset...")
dataset_path = kagglehub.dataset_download(DATASET_NAME)
print("Dataset downloaded to:", dataset_path)

# Auto-unzip if needed
if dataset_path.endswith(".zip"):
    print("📂 Extracting dataset...")
    with zipfile.ZipFile(dataset_path, 'r') as zip_ref:
        zip_ref.extractall(BASE_DIR)
    dataset_path = BASE_DIR
    print(f"Dataset extracted to: {BASE_DIR}")

# ==========================
# Load CSVs
# ==========================
try:
    training_df = pd.read_csv(os.path.join(dataset_path, "Training.csv"))
    testing_df = pd.read_csv(os.path.join(dataset_path, "Testing.csv"))
except FileNotFoundError as e:
    print(f"❌ CSV file not found: {e}")
    sys.exit(1)

X_train = training_df.drop(columns=["prognosis", "Unnamed: 133"], errors='ignore')
y_train = training_df["prognosis"]

X_test = testing_df.drop(columns=["prognosis"], errors='ignore')
y_test = testing_df["prognosis"]

print(f"✅ Number of symptoms: {X_train.shape[1]}")
print(f"✅ Unique diseases: {y_train.nunique()}")

# ==========================
# Train Random Forest
# ==========================
print("⚙️ Training Random Forest model...")
rf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)

# ==========================
# Evaluate model
# ==========================
rf_preds = rf.predict(X_test)
rf_acc = accuracy_score(y_test, rf_preds)
print(f"🎯 Random Forest Accuracy: {rf_acc:.4f}")
print("\n--- Classification Report ---")
print(classification_report(y_test, rf_preds))

# ==========================
# Confusion Matrix with Plotly
# ==========================
cm = confusion_matrix(y_test, rf_preds, labels=rf.classes_)
fig = ff.create_annotated_heatmap(
    z=cm.tolist(),
    x=rf.classes_.tolist(),
    y=rf.classes_.tolist(),
    colorscale='Blues',
    showscale=True,
    reversescale=False
)
fig.update_layout(
    title="Confusion Matrix",
    xaxis_title="Predicted",
    yaxis_title="Actual",
    xaxis=dict(tickangle=45)
)
fig.show()

# ==========================
# Save model & feature columns
# ==========================
joblib.dump(rf, MODEL_FILE)
joblib.dump(list(X_train.columns), COLUMNS_FILE)
print(f"✅ Model saved to: {MODEL_FILE}")
print(f"✅ Feature columns saved to: {COLUMNS_FILE}")

# ==========================
# Sample predictions
# ==========================
print("\n--- Sample Predictions ---")
sample_probs = rf.predict_proba(X_test[:5])
for i, probs in enumerate(sample_probs):
    prob_dict = {disease: float(p*100) for disease, p in zip(rf.classes_, probs)}
    most_likely = max(prob_dict, key=prob_dict.get)
    print(f"Sample {i+1}: {most_likely} ({prob_dict[most_likely]:.2f}%)")
