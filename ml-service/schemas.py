"""
schemas.py
----------
Pydantic models for request/response validation.
Keeps the FastAPI endpoints clean and provides automatic OpenAPI docs.
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field


# --- Price Intelligence (Phase 8) ---

class PricePredictRequest(BaseModel):
    """
    Input payload for the /price/predict endpoint.
    Mirrors the fields available when a user fills in the Sell Item form.
    """
    category: Literal[
        "TEXTBOOKS",
        "ELECTRONICS",
        "DORM_ESSENTIALS",
        "APPLIANCES",
        "FASHION",
        "NOTES_STUDY_MATERIAL",
        "BICYCLES",
        "OTHER",
    ]
    condition: Literal["BRAND_NEW", "LIKE_NEW", "GOOD", "FAIR"]
    listing_type: Literal["SELL", "RENT", "EXCHANGE"] = "SELL"
    original_price: float = Field(..., gt=0, description="Original store purchase price (₹)")
    age_months: int = Field(..., ge=0, le=240, description="Approximate age of the item in months")
    brand: Optional[str] = Field(default=None, description="Brand name if applicable")

    model_config = {
        "json_schema_extra": {
            "example": {
                "category": "ELECTRONICS",
                "condition": "GOOD",
                "listing_type": "SELL",
                "original_price": 8000,
                "age_months": 18,
                "brand": "Samsung",
            }
        }
    }


class ReasoningMetadata(BaseModel):
    condition_depreciation_band: str
    age_factor_applied: str
    listing_type_note: str
    brand_factor: str
    model_algorithm: str


class PricePredictResponse(BaseModel):
    """
    Price intelligence result returned to the Sell Item form.
    Always includes explicit confidence and a reasoning metadata block
    so the UI can honestly represent model certainty.
    """
    recommended_price: int = Field(..., description="Point estimate (₹), rounded to nearest ₹10")
    lower_bound: int = Field(..., description="Lower end of suggested price range (₹)")
    upper_bound: int = Field(..., description="Upper end of suggested price range (₹)")
    confidence: Literal["HIGH", "MEDIUM", "LOW"]
    confidence_note: str
    reasoning: ReasoningMetadata


# --- Collex Shield (Phase 9) ---

class ShieldCheckRequest(BaseModel):
    """
    Input for risk assessment. Can be called from listing creation or
    from the listing detail page. All fields are optional except price
    so partial information still produces a useful risk assessment.
    """
    listing_price: float = Field(..., gt=0, description="Price the seller listed (₹)")
    category: Literal[
        "TEXTBOOKS",
        "ELECTRONICS",
        "DORM_ESSENTIALS",
        "APPLIANCES",
        "FASHION",
        "NOTES_STUDY_MATERIAL",
        "BICYCLES",
        "OTHER",
    ]
    condition: Literal["BRAND_NEW", "LIKE_NEW", "GOOD", "FAIR"]
    original_price: Optional[float] = Field(default=None, gt=0)
    age_months: Optional[int] = Field(default=None, ge=0)
    brand: Optional[str] = None
    seller_account_age_days: Optional[int] = Field(
        default=None,
        ge=0,
        description="Days since the seller account was created",
    )
    seller_completed_deals: Optional[int] = Field(default=None, ge=0)
    seller_report_count: Optional[int] = Field(default=None, ge=0)
    seller_cancellation_ratio: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    listing_frequency_last_7d: Optional[int] = Field(
        default=None,
        ge=0,
        description="Number of listings posted by this seller in the last 7 days",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "listing_price": 200,
                "category": "ELECTRONICS",
                "condition": "LIKE_NEW",
                "original_price": 8000,
                "age_months": 6,
                "seller_account_age_days": 2,
                "seller_completed_deals": 0,
                "seller_report_count": 0,
                "seller_cancellation_ratio": 0.0,
                "listing_frequency_last_7d": 5,
            }
        }
    }


class RiskSignal(BaseModel):
    signal: str
    detail: str


class ShieldCheckResponse(BaseModel):
    """
    Risk assessment output.

    IMPORTANT: risk_level is an estimate, not a definitive accusation.
    The UI must present these as advisory warnings, not fraud verdicts.
    """
    risk_level: Literal["LOW", "MEDIUM", "HIGH"]
    risk_score: int = Field(..., ge=0, le=100, description="Internal score (0=safest, 100=highest risk)")
    signals: list[RiskSignal]
    buyer_guidance: str
    disclaimer: str = (
        "Collex Shield provides advisory signals based on statistical patterns. "
        "It does not definitively identify fraud. Always inspect items in person "
        "at a public campus location before completing a transaction."
    )
