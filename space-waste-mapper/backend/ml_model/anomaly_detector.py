# backend/ml_model/anomaly_detector.py

import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import pandas as pd

def train_anomaly_model():
    np.random.seed(42)
    data = pd.DataFrame({
        "mean_motion": np.random.normal(15, 0.5, 100),
        "mm_dot": np.abs(np.random.normal(0.0001, 0.00005, 100)),
        "altitude_km": np.random.normal(500, 50, 100),
        "eccentricity": np.random.normal(0.01, 0.005, 100),
        "inclination": np.random.normal(98, 2, 100),
    })

    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(data)

    # ✅ Save locally to this folder
    joblib.dump(model, "anomaly_model.pkl")
    print("✅ Anomaly model trained and saved!")

if __name__ == "__main__":
    train_anomaly_model()
