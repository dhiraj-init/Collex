"""
train.py
--------
Trains the Collex Price Intelligence model and saves both the model
pipeline and its evaluation metrics to disk.

Algorithm: RandomForestRegressor
Chosen because:
  - Handles mixed categorical + numeric features well via one-hot encoding
  - More robust to outliers than linear regression (important for campus
    goods with wildly varying price ranges)
  - Produces an interpretable feature importance ranking
  - Does NOT require feature scaling
  - Reliable enough to be interview-defensible at this data scale

Features used:
  - category (categorical, one-hot encoded)
  - condition (categorical, ordinal-encoded internally via one-hot)
  - listing_type (categorical)
  - brand_present (binary: does the item have a known brand?)
  - original_price (numeric)
  - age_months (numeric)
  - price_to_age_ratio (engineered: original_price / (age_months + 1))

Run:
    python train.py
"""

import json
import os
import sys

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

DATASET_PATH = os.path.join(os.path.dirname(__file__), "data", "campus_prices.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "price_model.joblib")
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.json")

CATEGORICAL_FEATURES = ["category", "condition", "listing_type"]
NUMERIC_FEATURES = ["original_price", "age_months", "price_to_age_ratio", "brand_present"]
TARGET = "sale_price"


def load_and_prepare(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)

    # Feature engineering
    df["brand_present"] = (df["brand"].fillna("").str.strip() != "").astype(int)
    df["price_to_age_ratio"] = df["original_price"] / (df["age_months"] + 1)

    # Drop rows missing target or key features
    df = df.dropna(subset=[TARGET, "original_price", "condition", "category"])
    df = df[df[TARGET] > 0]

    return df


def build_pipeline() -> Pipeline:
    cat_transformer = OneHotEncoder(handle_unknown="ignore", sparse_output=False)

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", cat_transformer, CATEGORICAL_FEATURES),
            ("num", "passthrough", NUMERIC_FEATURES),
        ]
    )

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=4,
        random_state=42,
        n_jobs=-1,
    )

    return Pipeline(steps=[("preprocessor", preprocessor), ("regressor", model)])


def evaluate(pipeline: Pipeline, X_test: pd.DataFrame, y_test: pd.Series) -> dict:
    y_pred = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = r2_score(y_test, y_pred)

    # Mean Absolute Percentage Error (only for non-zero targets)
    mape = float(np.mean(np.abs((y_test - y_pred) / np.maximum(y_test, 1))) * 100)

    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "r2_score": round(r2, 4),
        "mape_percent": round(mape, 2),
        "n_test_samples": len(y_test),
    }


def main():
    if not os.path.exists(DATASET_PATH):
        print(f"[ERROR] Dataset not found at {DATASET_PATH}")
        print("Run: python data/generate_dataset.py first")
        sys.exit(1)

    print("Loading dataset...")
    df = load_and_prepare(DATASET_PATH)
    print(f"  Loaded {len(df)} rows  |  Price range: Rs{df[TARGET].min()} - Rs{df[TARGET].max()}")

    feature_cols = CATEGORICAL_FEATURES + NUMERIC_FEATURES
    X = df[feature_cols]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"  Train: {len(X_train)} rows | Test: {len(X_test)} rows")

    print("Training RandomForest pipeline...")
    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)
    print("  Training complete.")

    print("Evaluating on hold-out test set...")
    metrics = evaluate(pipeline, X_test, y_test)
    print(f"  MAE  : Rs{metrics['mae']}")
    print(f"  RMSE : Rs{metrics['rmse']}")
    print(f"  R2   : {metrics['r2_score']}")
    print(f"  MAPE : {metrics['mape_percent']}%")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"  Model saved -> {MODEL_PATH}")

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"  Metrics saved -> {METRICS_PATH}")

    print("\nDone.")


if __name__ == "__main__":
    main()
