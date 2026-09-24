"""
main.py
-------
Collex ML Service — FastAPI application entry point.

Serves two API groups:
  /price  — Phase 8: Price Intelligence (ML model inference)
  /shield — Phase 9: Collex Shield risk assessment (rule engine)

Startup:
  python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Or use the helper script:
  python start.py
"""

import json
import os
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from predictor import PricePredictor
from schemas import (
    PricePredictRequest,
    PricePredictResponse,
    ReasoningMetadata,
    ShieldCheckRequest,
    ShieldCheckResponse,
)
from shield import evaluate_risk


# ---------------------------------------------------------------------------
# Application lifecycle: load model once at startup
# ---------------------------------------------------------------------------

predictor: PricePredictor | None = None
model_loaded = False
model_error: str | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global predictor, model_loaded, model_error
    try:
        predictor = PricePredictor()
        model_loaded = True
        print("[Collex ML] Price model loaded successfully")
    except FileNotFoundError as e:
        model_error = str(e)
        print(f"[Collex ML] WARNING: Price model not found: {e}")
        print("[Collex ML]   Run: python train.py to train the model first")
    yield
    # Cleanup (nothing needed for scikit-learn)


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Collex ML Service",
    description=(
        "Internal microservice providing ML-powered price intelligence "
        "and Collex Shield risk assessment for the Collex campus marketplace."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — only allow requests from the Collex Node.js backend and dev client
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",   # Node.js backend
        "http://localhost:5173",   # Vite dev client
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Meta"])
def health() -> dict[str, Any]:
    """
    Health check endpoint.
    Indicates whether the price model is loaded and ready for inference.
    """
    return {
        "status": "ok",
        "service": "collex-ml-service",
        "price_model_ready": model_loaded,
        "price_model_error": model_error,
        "shield_ready": True,   # shield is stateless rules, always ready
    }


@app.get("/metrics", tags=["Meta"])
def get_metrics() -> dict[str, Any]:
    """
    Returns training evaluation metrics for the price model.
    Exposed only on the ML service (not forwarded to frontend) so that
    the UI never overstates model quality to end users.
    """
    if not model_loaded or predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Price model is not loaded. Run python train.py first.",
        )
    return {
        "model": "RandomForestRegressor",
        "training_metrics": predictor.training_metrics,
        "note": (
            "These metrics are from the synthetic training dataset. "
            "Real-world performance will differ as actual campus sale data grows."
        ),
    }


# ---------------------------------------------------------------------------
# Phase 8: Price Intelligence
# ---------------------------------------------------------------------------

@app.post("/price/predict", response_model=PricePredictResponse, tags=["Price Intelligence"])
def predict_price(body: PricePredictRequest) -> PricePredictResponse:
    """
    Given item details, returns a suggested selling-price range.

    The confidence field is honest — LOW confidence is returned when
    the model has limited data for this category/condition combination.
    """
    if not model_loaded or predictor is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Price model is not loaded. "
                "Please run `python train.py` to train the model."
            ),
        )

    result = predictor.predict(
        category=body.category,
        condition=body.condition,
        listing_type=body.listing_type,
        original_price=body.original_price,
        age_months=body.age_months,
        brand=body.brand,
    )

    return PricePredictResponse(
        recommended_price=result.recommended,
        lower_bound=result.lower,
        upper_bound=result.upper,
        confidence=result.confidence,
        confidence_note=result.confidence_note,
        reasoning=ReasoningMetadata(
            condition_depreciation_band=result.condition_note,
            age_factor_applied=result.age_note,
            listing_type_note=result.listing_type_note,
            brand_factor=result.brand_note,
            model_algorithm=result.algorithm,
        ),
    )


# ---------------------------------------------------------------------------
# Phase 9: Collex Shield
# ---------------------------------------------------------------------------

@app.post("/shield/check", response_model=ShieldCheckResponse, tags=["Collex Shield"])
def shield_check(body: ShieldCheckRequest) -> ShieldCheckResponse:
    """
    Evaluates a listing and seller context for risk signals.

    Returns an advisory risk level (LOW / MEDIUM / HIGH) with
    human-readable signal explanations.

    IMPORTANT: This is an estimate, not a definitive fraud verdict.
    The UI must present results as advisory guidance only.
    """
    return evaluate_risk(
        listing_price=body.listing_price,
        category=body.category,
        condition=body.condition,
        original_price=body.original_price,
        age_months=body.age_months,
        brand=body.brand,
        seller_account_age_days=body.seller_account_age_days,
        seller_completed_deals=body.seller_completed_deals,
        seller_report_count=body.seller_report_count,
        seller_cancellation_ratio=body.seller_cancellation_ratio,
        listing_frequency_last_7d=body.listing_frequency_last_7d,
    )
