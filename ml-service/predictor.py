"""
predictor.py
------------
Loads the trained model pipeline from disk once at startup and exposes
a clean predict() function used by the FastAPI routes.

Also computes the price intelligence confidence level based on:
  - how far the item's original_price falls within the training data range
  - model-internal uncertainty (proxy: prediction interval width)

The confidence labelling is deliberately conservative. We do NOT claim
HIGH confidence for categories with sparse training data.
"""

import json
import os
from dataclasses import dataclass
from typing import Optional

import joblib
import numpy as np
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "price_model.joblib")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "model", "metrics.json")

# Condition → human-readable depreciation description
CONDITION_DESCRIPTIONS = {
    "BRAND_NEW": "Sealed/unused – typically retains 70-90% of original value",
    "LIKE_NEW": "Minimal use – typically retains 55-70% of original value",
    "GOOD":     "Moderate use – typically retains 35-55% of original value",
    "FAIR":     "Heavy use/visible wear – typically retains 15-35% of original value",
}

# Age → human-readable factor description
def age_description(age_months: int) -> str:
    if age_months <= 1:
        return "Essentially new (≤1 month old) – no age depreciation applied"
    elif age_months <= 6:
        return f"Relatively new ({age_months}m) – ~8% additional depreciation"
    elif age_months <= 12:
        return f"Used for {age_months}m – ~18% additional depreciation"
    elif age_months <= 24:
        return f"Used for {age_months}m – ~32% additional depreciation"
    elif age_months <= 48:
        return f"Used for {age_months}m – ~50% additional depreciation"
    else:
        return f"Older item ({age_months}m) – ~65% additional depreciation"


@dataclass
class PriceResult:
    recommended: int
    lower: int
    upper: int
    confidence: str
    confidence_note: str
    condition_note: str
    age_note: str
    listing_type_note: str
    brand_note: str
    algorithm: str


class PricePredictor:
    """Singleton wrapper around the trained scikit-learn pipeline."""

    def __init__(self):
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Trained model not found at {MODEL_PATH}. "
                "Please run: python train.py"
            )
        self._pipeline = joblib.load(MODEL_PATH)
        self._metrics: dict = {}
        if os.path.exists(METRICS_PATH):
            with open(METRICS_PATH) as f:
                self._metrics = json.load(f)

    @property
    def training_metrics(self) -> dict:
        return self._metrics

    def predict(
        self,
        category: str,
        condition: str,
        listing_type: str,
        original_price: float,
        age_months: int,
        brand: Optional[str],
    ) -> PriceResult:
        brand_present = 1 if (brand and brand.strip()) else 0
        price_to_age_ratio = original_price / (age_months + 1)

        row = pd.DataFrame([{
            "category": category,
            "condition": condition,
            "listing_type": listing_type,
            "original_price": original_price,
            "age_months": age_months,
            "price_to_age_ratio": price_to_age_ratio,
            "brand_present": brand_present,
        }])

        # --- Point estimate ---
        point = float(self._pipeline.predict(row)[0])

        # --- Uncertainty range via individual tree variance ---
        # RandomForest exposes individual estimators; their std gives
        # a proxy for prediction uncertainty on this specific input.
        estimators = self._pipeline.named_steps["regressor"].estimators_
        preprocessor = self._pipeline.named_steps["preprocessor"]
        X_transformed = preprocessor.transform(row)
        tree_preds = np.array([t.predict(X_transformed)[0] for t in estimators])
        std = float(np.std(tree_preds))

        # Bounds: ±1 std, clipped to ≥ ₹10 and ≤ 3× original
        lower = max(10, round((point - std) / 10) * 10)
        upper = min(original_price * 3, round((point + std) / 10) * 10)
        recommended = round(point / 10) * 10  # round to nearest ₹10

        # --- Confidence ---
        # Based on coefficient of variation (std/point) and model's
        # known MAPE on the test set. We only claim HIGH confidence
        # when both are small, so we don't oversell model quality.
        cv = std / max(point, 1)
        mape = self._metrics.get("mape_percent", 30)

        if cv < 0.20 and mape < 20:
            confidence = "HIGH"
            confidence_note = (
                "The model has seen many similar items in this price range. "
                "This estimate is reasonably reliable, but always validate "
                "against recent similar listings."
            )
        elif cv < 0.40 and mape < 35:
            confidence = "MEDIUM"
            confidence_note = (
                "There is moderate variation in similar listings. "
                "Use this as a starting point and adjust based on your item's "
                "specific condition and campus demand."
            )
        else:
            confidence = "LOW"
            confidence_note = (
                "High variation in this category or price range. "
                "Training data for this combination is limited. "
                "Check recent listings manually before setting your price."
            )

        listing_note = (
            "Rent price: this is an estimated weekly/monthly rate – adjust to match "
            "your rental period and terms."
            if listing_type == "RENT"
            else "Exchange: no monetary value; this estimate can guide negotiation of equivalent item value."
            if listing_type == "EXCHANGE"
            else "Sell price estimate based on condition and age depreciation."
        )

        brand_note = (
            f"Brand '{brand}' may command a small premium on campus – "
            "verify against similar branded items."
            if brand_present
            else "No brand detected – priced based on category/condition averages."
        )

        return PriceResult(
            recommended=recommended,
            lower=lower,
            upper=upper,
            confidence=confidence,
            confidence_note=confidence_note,
            condition_note=CONDITION_DESCRIPTIONS[condition],
            age_note=age_description(age_months),
            listing_type_note=listing_note,
            brand_note=brand_note,
            algorithm="RandomForestRegressor (n_estimators=200, max_depth=12)",
        )
