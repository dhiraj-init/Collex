"""
generate_dataset.py
-------------------
Generates a realistic synthetic training dataset for the Collex Price
Intelligence model.

In production, this would be replaced with real historical sale prices
pulled from the Collex MongoDB database. For now, it encodes real-world
pricing intuition for Indian campus second-hand goods.

Run:
    python data/generate_dataset.py
"""

import csv
import random
import os

random.seed(42)

# ---------------------------------------------------------------------------
# Domain knowledge: realistic price bounds per category in INR (₹)
# Each entry: (category, brand?, base_new_price_low, base_new_price_high)
# ---------------------------------------------------------------------------
CATEGORY_PROFILES = {
    "TEXTBOOKS": {
        "brands": ["Arihant", "RD Sharma", "HC Verma", "Cengage", "SL Loney", "None"],
        "new_price_range": (200, 1200),
    },
    "ELECTRONICS": {
        "brands": ["Samsung", "Apple", "Realme", "boAt", "JBL", "Lenovo", "HP", "Dell"],
        "new_price_range": (500, 80000),
    },
    "DORM_ESSENTIALS": {
        "brands": ["Prestige", "Bajaj", "Milton", "None"],
        "new_price_range": (150, 2500),
    },
    "APPLIANCES": {
        "brands": ["Havells", "Usha", "Philips", "Bajaj", "None"],
        "new_price_range": (300, 5000),
    },
    "FASHION": {
        "brands": ["Roadster", "H&M", "Zara", "Puma", "Nike", "None"],
        "new_price_range": (200, 6000),
    },
    "NOTES_STUDY_MATERIAL": {
        "brands": ["None"],
        "new_price_range": (50, 400),
    },
    "BICYCLES": {
        "brands": ["Hero", "Atlas", "Firefox", "Btwin"],
        "new_price_range": (3000, 25000),
    },
    "OTHER": {
        "brands": ["None"],
        "new_price_range": (100, 3000),
    },
}

# Condition depreciation multipliers (fraction of original_price retained)
CONDITION_MULTIPLIERS = {
    "BRAND_NEW": (0.70, 0.90),   # Sealed box / unused gift
    "LIKE_NEW": (0.55, 0.70),
    "GOOD": (0.35, 0.55),
    "FAIR": (0.15, 0.35),
}

# Purchase age in months → additional depreciation factor
def age_depreciation(age_months: int) -> float:
    if age_months <= 1:
        return 1.0
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


LISTING_TYPES = ["SELL", "RENT", "EXCHANGE"]
CAMPUSES = [
    "IIT Delhi", "NIT Rourkela", "BITS Pilani", "VIT Vellore",
    "DTU Delhi", "IIIT Hyderabad", "Manipal University", "SRM Chennai",
]


def generate_row() -> dict:
    category = random.choice(list(CATEGORY_PROFILES.keys()))
    profile = CATEGORY_PROFILES[category]
    brand = random.choice(profile["brands"])
    low, high = profile["new_price_range"]
    original_price = random.randint(low, high)
    condition = random.choices(
        ["BRAND_NEW", "LIKE_NEW", "GOOD", "FAIR"],
        weights=[0.05, 0.25, 0.45, 0.25],
    )[0]
    age_months = random.randint(0, 60)
    listing_type = random.choices(
        LISTING_TYPES, weights=[0.75, 0.15, 0.10]
    )[0]
    campus = random.choice(CAMPUSES)

    cond_low, cond_high = CONDITION_MULTIPLIERS[condition]
    cond_mult = random.uniform(cond_low, cond_high)
    age_mult = age_depreciation(age_months)

    # Base sale price from condition + age
    base_price = original_price * cond_mult * age_mult

    # Rent prices are significantly lower (weekly/monthly rate fraction)
    if listing_type == "RENT":
        base_price = base_price * random.uniform(0.05, 0.12)

    # Small random market noise ±10%
    noise = random.uniform(0.90, 1.10)
    sale_price = max(10, round(base_price * noise, -1))  # round to nearest ₹10

    return {
        "category": category,
        "brand": brand if brand != "None" else "",
        "original_price": original_price,
        "age_months": age_months,
        "condition": condition,
        "listing_type": listing_type,
        "campus": campus,
        "sale_price": int(sale_price),
    }


def main():
    os.makedirs(os.path.dirname(__file__), exist_ok=True)
    output_path = os.path.join(os.path.dirname(__file__), "campus_prices.csv")
    rows = [generate_row() for _ in range(3000)]

    fieldnames = [
        "category", "brand", "original_price", "age_months",
        "condition", "listing_type", "campus", "sale_price",
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"[OK] Generated {len(rows)} training rows -> {output_path}")
    print(f"  Sale price range: Rs{min(r['sale_price'] for r in rows)} - "
          f"Rs{max(r['sale_price'] for r in rows)}")


if __name__ == "__main__":
    main()
