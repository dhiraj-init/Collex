# Collex Shield

**Version**: 1.0  
**Service**: `ml-service/` — `shield.py`  
**Endpoint**: `POST /api/v1/ml/shield/check` (via Node.js proxy)

---

## Overview

Collex Shield is a hybrid risk assessment system that evaluates listings and seller context for unusual patterns. It returns advisory signals to help buyers make informed decisions.

**Critical design principle**: Collex Shield does NOT accuse sellers of fraud. It provides statistical advisory signals. Legitimate sellers can and will trigger signals (e.g., a student urgently selling before exams at a steep discount). The UI language must always be advisory, never accusatory.

---

## Architecture

### Phase 9 (Current): Pure Rule Engine

```
Incoming listing + seller context
        |
        v
    Rule Engine (shield.py)
        |
        ├── Price anomaly detection (vs. deterministic fair price estimate)
        ├── Account age signals
        ├── Transaction history signals
        ├── Conduct/report history signals
        └── Listing frequency signals
        |
        v
    Risk score (0-100)
    Risk level (LOW / MEDIUM / HIGH)
    Signal list (human-readable)
        |
        v
    Response to Node.js -> Client
```

### Future Phase: Anomaly Detection Layer

```
Rule Engine score
        +
IsolationForest / Z-score on listing corpus
  (trained on historical listing embeddings)
        |
        v
Combined risk score
```

The API contract (request/response schema) is designed to accommodate this without breaking changes.

---

## Risk Signals

The rule engine evaluates the following signals. **Specific thresholds are internal and not documented here** to prevent gaming by bad actors.

| Signal Category | Description | Advisory UI text |
|----------------|-------------|-----------------|
| Extreme low price | Listing price is far below the model's fair market estimate | "Price is extremely below market estimate" |
| Substantially low price | Price is notably below similar listings | "Price is substantially lower than similar listings" |
| New account (< 3 days) | Seller account created very recently | "Seller account was very recently created" |
| Recent account (3-14 days) | Seller account created within 2 weeks | "Seller account was recently created" |
| No completed deals | Zero verified campus transactions | "Seller has no completed Collex transactions" |
| Multiple reports | 2+ user reports against this seller | "Seller has received multiple reports from other users" |
| Single report | 1 user report under review | "Seller has received a user report" |
| High cancellation | Cancellation ratio > threshold | "Seller has a high rate of cancelled transactions" |
| Moderate cancellation | Elevated cancellation ratio | "Seller has a moderately elevated cancellation rate" |
| Listing flood from new account | Very high listing frequency from brand-new account | "Unusually high listing frequency from a new account" |
| High listing frequency | Multiple listings in 7 days from any account | "High listing frequency detected" |

---

## Risk Levels

| Level | Score Range | Meaning |
|-------|------------|---------|
| LOW | 0-19 | No meaningful unusual signals detected |
| MEDIUM | 20-49 | One or more signals worth being aware of |
| HIGH | 50-100 | Several concurrent signals warrant extra caution |

Scores are additive from individual signal weights. Score is capped at 100.

---

## Seller Data Privacy

Sensitive seller data (report count, cancellation ratio) is:
1. **Resolved server-side** by the Node.js backend (not sent from the client)
2. **Never exposed** in the raw response - only advisory text is returned
3. **Never used to definitively accuse** - combined with the full signal picture

The specific weight assigned to each signal is **not exposed via the API** to prevent reverse engineering by bad actors.

---

## API Contract

**Request** (`POST /api/v1/ml/shield/check`):
```json
{
  "listing_price": 200,
  "category": "ELECTRONICS",
  "condition": "LIKE_NEW",
  "original_price": 8000,
  "age_months": 6,
  "seller_account_age_days": 2,
  "seller_completed_deals": 0,
  "seller_report_count": 0,
  "seller_cancellation_ratio": 0.0,
  "listing_frequency_last_7d": 5
}
```

**Response**:
```json
{
  "risk_level": "HIGH",
  "risk_score": 65,
  "signals": [
    {
      "signal": "Price is extremely below market estimate",
      "detail": "This listing is priced significantly below what similar items typically sell for on campus. While genuine sellers sometimes offer steep discounts, this warrants extra caution. Inspect the item carefully before any payment."
    },
    {
      "signal": "Seller account was very recently created",
      "detail": "This Collex account was created within the last 3 days. New accounts have no transaction history to verify. Proceed with standard campus meetup precautions."
    }
  ],
  "buyer_guidance": "Collex Shield has detected several unusual signals...",
  "disclaimer": "Collex Shield provides advisory signals based on statistical patterns. It does not definitively identify fraud..."
}
```

---

## UI Guidelines

The frontend MUST follow these language rules when displaying Collex Shield results:

### DO
- "Collex Shield noticed unusual signals in this listing."
- "Price is substantially lower than similar listings."
- "Seller account was recently created."
- "Inspect the item before making payment."
- "These signals do not necessarily indicate a problem."

### DO NOT
- "This listing is fraudulent."
- "This seller is a scammer."
- "Do not buy from this seller."
- Expose the numeric `risk_score` to end users
- Show risk level for LOW-risk listings prominently (use subtle badge, not alert)

---

## False Positive Concerns

Collex Shield will produce false positives. Common legitimate scenarios that trigger HIGH risk:

| Scenario | Signals triggered | Reason it's not fraud |
|----------|------------------|-----------------------|
| Student urgently selling before placement season | Extreme low price | Genuine time pressure |
| First-year student creating first listing | New account + no deals | Normal for new users |
| Student selling multiple items at semester end | High listing frequency | Legitimate mass declutter |
| Damaged-but-functional item listed very cheap | Low price anomaly | Accurately described item |
| Student lending/exchanging items for the first time | No completed deals | First-time legitimate use |

These scenarios reinforce why buyer guidance text always acknowledges legitimate scenarios and never makes definitive accusations.

---

## Moderation Integration

Every shield check is available for admin review via:
- The `risk_score` and `signals` list are stored in the Report model when a user files a manual report
- Moderators can use shield data as supporting context when reviewing reports
- Moderators can dismiss signals as false positives (creating audit trail)

---

## Logging and Audit Trail

All shield evaluations that result in MEDIUM or HIGH risk are:
1. Logged in the server with the listing ID and seller ID
2. Available to MODERATOR and SUPER_ADMIN roles in the admin panel (future)
3. Never surfaced publicly beyond the buyer's session

---

## Limitations

1. **Rule-based only**: No ML anomaly detection yet. A sophisticated bad actor who knows general thresholds (but not exact weights) could potentially avoid detection.

2. **No image analysis**: Duplicate or stock images cannot currently be detected. This is a planned future signal.

3. **No message analysis**: Suspicious patterns in chat (requests to move off-platform, requests for advance payments) are not yet analyzed.

4. **No cross-campus correlation**: A banned seller from one campus cannot be detected if they create a new account.

5. **Cold start problem**: New legitimate sellers will always trigger account-age and no-deals signals. The system inherently penalizes new users even when they are entirely legitimate.

6. **Static thresholds**: Currently hardcoded. In production, thresholds should be dynamically adjusted based on false positive feedback from moderators.

---

## Future Improvements

| Improvement | Expected Impact | Complexity |
|------------|-----------------|-----------|
| IsolationForest on listing feature vectors | Medium | Medium |
| Duplicate image detection (image hashing) | High | Medium |
| Message pattern analysis (NLP) | High | High |
| Seller behavior sequence modeling | High | High |
| Adaptive thresholds from moderator feedback | Medium | Medium |
| Cross-device fingerprinting (privacy-safe) | High | High |

---

## Interview Defense

**"How do you prevent gaming the shield?"**

Specific scoring weights are not documented or exposed via the API. The shield evaluates a combination of signals simultaneously - improving one signal doesn't guarantee a lower risk score if other signals are present. We also plan to add behavioral signals (message patterns, device signals) that are much harder to fake than account age.

**"What about false positives? A legitimate seller might be flagged."**

This is expected and accounted for. The UI language is explicitly advisory, not accusatory. A seller flagged HIGH risk can still complete a transaction normally. The signal explanations always acknowledge legitimate interpretations. In a future version, sellers can dispute signals and moderators can dismiss false positives, creating a feedback loop that improves the system.

**"Why not start with ML instead of rules?"**

Rules are interpretable, debuggable, and fast to iterate. With no historical fraud labels, there is nothing to train a supervised anomaly detection model on. Rules also give us the labeled dataset (flagged vs. unflagged transactions) needed to train future ML models. Starting with rules is the right engineering decision at this stage.
