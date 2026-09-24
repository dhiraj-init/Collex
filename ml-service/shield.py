"""
shield.py
---------
Collex Shield: hybrid rule-based + statistical risk scoring engine.

Design principles:
  1. Transparency — every risk signal has a human-readable explanation
  2. Conservative language — signals are advisory, NOT accusations
  3. No hidden magic numbers exposed publicly — specific thresholds
     remain internal (this file stays server-side)
  4. False-positive aware — all UI copy and guidance text accounts for
     legitimate sellers being flagged (e.g. genuine fire-sales)
  5. Logged — every evaluation is returned with a structured signal list
     for admin review

Architecture: Pure rule engine in Phase 9.
Future: anomaly detection (IsolationForest or Z-score on listing corpus)
        can be inserted as an additional scoring layer without changing
        the API contract (just adds more signals to the list).
"""

from __future__ import annotations

import math
from typing import Optional

from schemas import RiskSignal, ShieldCheckResponse


# ---------------------------------------------------------------------------
# Internal scoring weights (not exposed via API)
# ---------------------------------------------------------------------------

_WEIGHTS = {
    "extreme_price_low": 40,       # price < 15% of fair market estimate
    "very_low_price": 25,          # price < 35% of fair market estimate
    "new_account": 20,             # account < 3 days old
    "recent_account": 10,          # account 3-14 days old
    "no_deals": 5,                 # 0 completed transactions
    "high_report_count": 30,       # ≥2 substantiated reports
    "moderate_report_count": 15,   # 1 report
    "high_cancellation": 15,       # cancellation ratio > 50%
    "moderate_cancellation": 8,    # cancellation ratio > 25%
    "listing_flood": 20,           # ≥6 listings in 7 days from new account
    "listing_frequency": 10,       # ≥4 listings in 7 days from any account
}

_MAX_SCORE = 100


# ---------------------------------------------------------------------------
# Fair market estimate (same logic as training data, but deterministic)
# Used only to detect anomalously low prices — no model call needed here.
# ---------------------------------------------------------------------------

_CONDITION_MULTIPLIERS = {
    "BRAND_NEW": 0.80,
    "LIKE_NEW": 0.625,
    "GOOD": 0.45,
    "FAIR": 0.25,
}

def _age_factor(age_months: Optional[int]) -> float:
    if age_months is None:
        return 0.65  # assume mid-age if unknown
    if age_months <= 1:
        return 1.00
    elif age_months <= 6:
        return 0.92
    elif age_months <= 12:
        return 0.82
    elif age_months <= 24:
        return 0.68
    elif age_months <= 48:
        return 0.50
    else:
        return 0.35


def _estimate_fair_price(
    original_price: Optional[float],
    condition: str,
    age_months: Optional[int],
) -> Optional[float]:
    """Deterministic fair market estimate — same formula as dataset generator."""
    if original_price is None or original_price <= 0:
        return None
    return original_price * _CONDITION_MULTIPLIERS.get(condition, 0.45) * _age_factor(age_months)


# ---------------------------------------------------------------------------
# Main evaluation function
# ---------------------------------------------------------------------------

def evaluate_risk(
    listing_price: float,
    category: str,
    condition: str,
    original_price: Optional[float],
    age_months: Optional[int],
    brand: Optional[str],
    seller_account_age_days: Optional[int],
    seller_completed_deals: Optional[int],
    seller_report_count: Optional[int],
    seller_cancellation_ratio: Optional[float],
    listing_frequency_last_7d: Optional[int],
) -> ShieldCheckResponse:
    score = 0
    signals: list[RiskSignal] = []

    # --- Signal 1 & 2: Unusually low price ---
    fair_price = _estimate_fair_price(original_price, condition, age_months)
    if fair_price is not None and fair_price > 0:
        ratio = listing_price / fair_price
        if ratio < 0.15:
            score += _WEIGHTS["extreme_price_low"]
            signals.append(RiskSignal(
                signal="Price is extremely below market estimate",
                detail=(
                    "This listing is priced significantly below what similar items "
                    "typically sell for on campus. While genuine sellers sometimes "
                    "offer steep discounts, this warrants extra caution. "
                    "Inspect the item carefully before any payment."
                ),
            ))
        elif ratio < 0.35:
            score += _WEIGHTS["very_low_price"]
            signals.append(RiskSignal(
                signal="Price is substantially lower than similar listings",
                detail=(
                    "Based on the item's category, condition, and age, the listed "
                    "price is lower than typical campus resale prices. "
                    "This could indicate a genuine bargain or a misrepresented item — "
                    "verify condition in person."
                ),
            ))

    # --- Signal 3 & 4: New seller account ---
    if seller_account_age_days is not None:
        if seller_account_age_days < 3:
            score += _WEIGHTS["new_account"]
            signals.append(RiskSignal(
                signal="Seller account was very recently created",
                detail=(
                    "This Collex account was created within the last 3 days. "
                    "New accounts have no transaction history to verify. "
                    "Proceed with standard campus meetup precautions."
                ),
            ))
        elif seller_account_age_days < 14:
            score += _WEIGHTS["recent_account"]
            signals.append(RiskSignal(
                signal="Seller account was recently created",
                detail=(
                    "This account is less than 2 weeks old. "
                    "There is limited transaction history to assess seller reliability."
                ),
            ))

    # --- Signal 5: No completed deals ---
    if seller_completed_deals is not None and seller_completed_deals == 0:
        score += _WEIGHTS["no_deals"]
        signals.append(RiskSignal(
            signal="Seller has no completed Collex transactions",
            detail=(
                "This seller has not completed any transactions on Collex yet. "
                "This is normal for new sellers. Follow standard safe-meetup practices."
            ),
        ))

    # --- Signal 6 & 7: Report history ---
    if seller_report_count is not None:
        if seller_report_count >= 2:
            score += _WEIGHTS["high_report_count"]
            signals.append(RiskSignal(
                signal="Seller has received multiple reports from other users",
                detail=(
                    "Other Collex users have reported this seller. "
                    "Reports are reviewed by moderators and may or may not "
                    "reflect substantiated issues. Exercise extra caution."
                ),
            ))
        elif seller_report_count == 1:
            score += _WEIGHTS["moderate_report_count"]
            signals.append(RiskSignal(
                signal="Seller has received a user report",
                detail=(
                    "At least one Collex user has submitted a report about this seller. "
                    "This is under moderator review."
                ),
            ))

    # --- Signal 8 & 9: Cancellation ratio ---
    if seller_cancellation_ratio is not None:
        if seller_cancellation_ratio > 0.5:
            score += _WEIGHTS["high_cancellation"]
            signals.append(RiskSignal(
                signal="Seller has a high rate of cancelled transactions",
                detail=(
                    "More than half of this seller's agreed transactions were cancelled. "
                    "This may indicate unreliability. Consider this when committing to a meetup."
                ),
            ))
        elif seller_cancellation_ratio > 0.25:
            score += _WEIGHTS["moderate_cancellation"]
            signals.append(RiskSignal(
                signal="Seller has a moderately elevated cancellation rate",
                detail=(
                    "This seller has cancelled a notable portion of their agreed transactions. "
                    "Confirm meetup details clearly before travelling to the meetup spot."
                ),
            ))

    # --- Signal 10 & 11: Listing frequency ---
    if listing_frequency_last_7d is not None:
        is_new = (seller_account_age_days is not None and seller_account_age_days < 14)
        if listing_frequency_last_7d >= 6 and is_new:
            score += _WEIGHTS["listing_flood"]
            signals.append(RiskSignal(
                signal="Unusually high listing frequency from a new account",
                detail=(
                    "This recently created account has posted a high volume of listings "
                    "in a short period. This pattern is uncommon for legitimate sellers."
                ),
            ))
        elif listing_frequency_last_7d >= 4:
            score += _WEIGHTS["listing_frequency"]
            signals.append(RiskSignal(
                signal="High listing frequency detected",
                detail=(
                    "This seller has posted multiple listings in the past week. "
                    "While many legitimate sellers list multiple items, "
                    "verify each item carefully."
                ),
            ))

    # Clamp to 100
    score = min(score, _MAX_SCORE)

    # --- Risk level ---
    if score >= 50:
        risk_level = "HIGH"
        buyer_guidance = (
            "Collex Shield has detected several unusual signals with this listing. "
            "If you proceed, only meet in a busy public campus location during daylight hours. "
            "Do not transfer any payment before physically inspecting the item. "
            "You can report the listing if anything seems off."
        )
    elif score >= 20:
        risk_level = "MEDIUM"
        buyer_guidance = (
            "Collex Shield noticed some signals worth being aware of. "
            "Meet at a safe, busy campus location and inspect the item before making payment. "
            "These signals do not necessarily indicate a problem — many are common for new sellers."
        )
    else:
        risk_level = "LOW"
        buyer_guidance = (
            "No major risk signals detected for this listing. "
            "As always, meet at a public campus location and inspect before payment."
        )

    return ShieldCheckResponse(
        risk_level=risk_level,
        risk_score=score,
        signals=signals,
        buyer_guidance=buyer_guidance,
    )
