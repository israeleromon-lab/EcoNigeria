"""Pan-African Cross-Country Comparison & Ingestion Architecture – EconoNigeria 2.0.

Extends macroeconomic intelligence across major African economies:
Nigeria (NGA), Ghana (GHA), Kenya (KEN), South Africa (ZAF), Egypt (EGY),
Rwanda (RWA), and Côte d'Ivoire (CIV).
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models import Indicator, HistoricalData


AFRICAN_COUNTRIES: Dict[str, Dict[str, Any]] = {
    "NGA": {
        "code": "NGA",
        "slug": "nigeria",
        "name": "Nigeria",
        "region": "West Africa",
        "currency": "NGN (₦)",
        "capital": "Abuja",
        "flag": "🇳🇬",
    },
    "GHA": {
        "code": "GHA",
        "slug": "ghana",
        "name": "Ghana",
        "region": "West Africa",
        "currency": "GHS (GH₵)",
        "capital": "Accra",
        "flag": "🇬🇭",
    },
    "KEN": {
        "code": "KEN",
        "slug": "kenya",
        "name": "Kenya",
        "region": "East Africa",
        "currency": "KES (KSh)",
        "capital": "Nairobi",
        "flag": "🇰🇪",
    },
    "ZAF": {
        "code": "ZAF",
        "slug": "south-africa",
        "name": "South Africa",
        "region": "Southern Africa",
        "currency": "ZAR (R)",
        "capital": "Pretoria",
        "flag": "🇿🇦",
    },
    "EGY": {
        "code": "EGY",
        "slug": "egypt",
        "name": "Egypt",
        "region": "North Africa",
        "currency": "EGP (E£)",
        "capital": "Cairo",
        "flag": "🇪🇬",
    },
    "RWA": {
        "code": "RWA",
        "slug": "rwanda",
        "name": "Rwanda",
        "region": "East Africa",
        "currency": "RWF (FRw)",
        "capital": "Kigali",
        "flag": "🇷🇼",
    },
    "CIV": {
        "code": "CIV",
        "slug": "cote-divoire",
        "name": "Côte d'Ivoire",
        "region": "West Africa",
        "currency": "XOF (CFA)",
        "capital": "Yamoussoukro",
        "flag": "🇨🇮",
    },
}

SLUG_TO_COUNTRY: Dict[str, str] = {
    "nigeria": "NGA",
    "nga": "NGA",
    "ghana": "GHA",
    "gha": "GHA",
    "kenya": "KEN",
    "ken": "KEN",
    "south-africa": "ZAF",
    "south_africa": "ZAF",
    "zaf": "ZAF",
    "egypt": "EGY",
    "egy": "EGY",
    "rwanda": "RWA",
    "rwa": "RWA",
    "cote-divoire": "CIV",
    "cote_divoire": "CIV",
    "civ": "CIV",
}

# Verified Pan-African Macroeconomic Benchmarks (World Bank / IMF WEO 2024 Harmonized)
PAN_AFRICAN_BENCHMARKS: Dict[str, Dict[str, Any]] = {
    "NGA": {
        "inflation": 33.20,
        "gdp_growth": 3.19,
        "debt_to_gdp": 42.0,
        "gdp_per_capita": 1620.0,
        "population": 223.8,
        "unemployment": 5.0,
        "history": {
            "inflation": [
                {"period": "2018", "value": 12.1}, {"period": "2019", "value": 11.4},
                {"period": "2020", "value": 13.2}, {"period": "2021", "value": 17.0},
                {"period": "2022", "value": 18.8}, {"period": "2023", "value": 24.5},
                {"period": "2024", "value": 33.2},
            ],
            "gdp_growth": [
                {"period": "2018", "value": 1.9}, {"period": "2019", "value": 2.2},
                {"period": "2020", "value": -1.8}, {"period": "2021", "value": 3.6},
                {"period": "2022", "value": 3.3}, {"period": "2023", "value": 2.9},
                {"period": "2024", "value": 3.19},
            ],
            "debt_to_gdp": [
                {"period": "2018", "value": 27.5}, {"period": "2019", "value": 29.2},
                {"period": "2020", "value": 34.5}, {"period": "2021", "value": 36.6},
                {"period": "2022", "value": 38.0}, {"period": "2023", "value": 39.5},
                {"period": "2024", "value": 42.0},
            ],
        },
    },
    "GHA": {
        "inflation": 20.40,
        "gdp_growth": 4.70,
        "debt_to_gdp": 71.0,
        "gdp_per_capita": 2230.0,
        "population": 34.1,
        "unemployment": 3.9,
        "history": {
            "inflation": [
                {"period": "2018", "value": 7.8}, {"period": "2019", "value": 7.1},
                {"period": "2020", "value": 9.9}, {"period": "2021", "value": 10.0},
                {"period": "2022", "value": 31.5}, {"period": "2023", "value": 38.1},
                {"period": "2024", "value": 20.4},
            ],
            "gdp_growth": [
                {"period": "2018", "value": 6.2}, {"period": "2019", "value": 6.5},
                {"period": "2020", "value": 0.5}, {"period": "2021", "value": 5.1},
                {"period": "2022", "value": 3.1}, {"period": "2023", "value": 2.9},
                {"period": "2024", "value": 4.7},
            ],
            "debt_to_gdp": [
                {"period": "2018", "value": 57.6}, {"period": "2019", "value": 62.7},
                {"period": "2020", "value": 78.3}, {"period": "2021", "value": 82.1},
                {"period": "2022", "value": 88.8}, {"period": "2023", "value": 74.0},
                {"period": "2024", "value": 71.0},
            ],
        },
    },
    "KEN": {
        "inflation": 4.40,
        "gdp_growth": 5.40,
        "debt_to_gdp": 68.2,
        "gdp_per_capita": 2100.0,
        "population": 55.1,
        "unemployment": 5.6,
        "history": {
            "inflation": [
                {"period": "2018", "value": 4.7}, {"period": "2019", "value": 5.2},
                {"period": "2020", "value": 5.3}, {"period": "2021", "value": 6.1},
                {"period": "2022", "value": 7.7}, {"period": "2023", "value": 7.7},
                {"period": "2024", "value": 4.4},
            ],
            "gdp_growth": [
                {"period": "2018", "value": 5.6}, {"period": "2019", "value": 5.1},
                {"period": "2020", "value": -0.3}, {"period": "2021", "value": 7.6},
                {"period": "2022", "value": 4.8}, {"period": "2023", "value": 5.6},
                {"period": "2024", "value": 5.4},
            ],
            "debt_to_gdp": [
                {"period": "2018", "value": 57.0}, {"period": "2019", "value": 60.1},
                {"period": "2020", "value": 66.8}, {"period": "2021", "value": 67.8},
                {"period": "2022", "value": 67.2}, {"period": "2023", "value": 70.1},
                {"period": "2024", "value": 68.2},
            ],
        },
    },
    "ZAF": {
        "inflation": 4.60,
        "gdp_growth": 1.10,
        "debt_to_gdp": 73.9,
        "gdp_per_capita": 6190.0,
        "population": 60.4,
        "unemployment": 33.5,
        "history": {
            "inflation": [
                {"period": "2018", "value": 4.6}, {"period": "2019", "value": 4.1},
                {"period": "2020", "value": 3.3}, {"period": "2021", "value": 4.6},
                {"period": "2022", "value": 6.9}, {"period": "2023", "value": 6.0},
                {"period": "2024", "value": 4.6},
            ],
            "gdp_growth": [
                {"period": "2018", "value": 1.5}, {"period": "2019", "value": 0.3},
                {"period": "2020", "value": -6.0}, {"period": "2021", "value": 4.7},
                {"period": "2022", "value": 1.9}, {"period": "2023", "value": 0.6},
                {"period": "2024", "value": 1.1},
            ],
            "debt_to_gdp": [
                {"period": "2018", "value": 56.7}, {"period": "2019", "value": 62.2},
                {"period": "2020", "value": 69.0}, {"period": "2021", "value": 69.0},
                {"period": "2022", "value": 71.0}, {"period": "2023", "value": 72.8},
                {"period": "2024", "value": 73.9},
            ],
        },
    },
    "EGY": {
        "inflation": 26.20,
        "gdp_growth": 2.70,
        "debt_to_gdp": 92.5,
        "gdp_per_capita": 3510.0,
        "population": 112.7,
        "unemployment": 7.0,
        "history": {
            "inflation": [
                {"period": "2018", "value": 14.4}, {"period": "2019", "value": 9.2},
                {"period": "2020", "value": 5.0}, {"period": "2021", "value": 5.2},
                {"period": "2022", "value": 13.9}, {"period": "2023", "value": 33.9},
                {"period": "2024", "value": 26.2},
            ],
            "gdp_growth": [
                {"period": "2018", "value": 5.3}, {"period": "2019", "value": 5.6},
                {"period": "2020", "value": 3.6}, {"period": "2021", "value": 3.3},
                {"period": "2022", "value": 6.6}, {"period": "2023", "value": 3.8},
                {"period": "2024", "value": 2.7},
            ],
            "debt_to_gdp": [
                {"period": "2018", "value": 92.7}, {"period": "2019", "value": 84.2},
                {"period": "2020", "value": 86.2}, {"period": "2021", "value": 89.8},
                {"period": "2022", "value": 88.5}, {"period": "2023", "value": 95.8},
                {"period": "2024", "value": 92.5},
            ],
        },
    },
    "RWA": {
        "inflation": 5.00,
        "gdp_growth": 8.20,
        "debt_to_gdp": 68.0,
        "gdp_per_capita": 1040.0,
        "population": 14.1,
        "unemployment": 16.8,
        "history": {
            "inflation": [
                {"period": "2018", "value": 1.4}, {"period": "2019", "value": 2.4},
                {"period": "2020", "value": 7.7}, {"period": "2021", "value": 0.8},
                {"period": "2022", "value": 13.9}, {"period": "2023", "value": 14.3},
                {"period": "2024", "value": 5.0},
            ],
            "gdp_growth": [
                {"period": "2018", "value": 8.6}, {"period": "2019", "value": 9.5},
                {"period": "2020", "value": -3.4}, {"period": "2021", "value": 10.9},
                {"period": "2022", "value": 8.2}, {"period": "2023", "value": 8.2},
                {"period": "2024", "value": 8.2},
            ],
            "debt_to_gdp": [
                {"period": "2018", "value": 45.0}, {"period": "2019", "value": 51.4},
                {"period": "2020", "value": 66.7}, {"period": "2021", "value": 67.5},
                {"period": "2022", "value": 68.0}, {"period": "2023", "value": 69.2},
                {"period": "2024", "value": 68.0},
            ],
        },
    },
    "CIV": {
        "inflation": 3.80,
        "gdp_growth": 6.50,
        "debt_to_gdp": 58.1,
        "gdp_per_capita": 2680.0,
        "population": 29.4,
        "unemployment": 2.6,
        "history": {
            "inflation": [
                {"period": "2018", "value": 0.4}, {"period": "2019", "value": -0.8},
                {"period": "2020", "value": 2.4}, {"period": "2021", "value": 4.2},
                {"period": "2022", "value": 5.2}, {"period": "2023", "value": 4.4},
                {"period": "2024", "value": 3.8},
            ],
            "gdp_growth": [
                {"period": "2018", "value": 6.8}, {"period": "2019", "value": 6.2},
                {"period": "2020", "value": 1.7}, {"period": "2021", "value": 7.0},
                {"period": "2022", "value": 6.2}, {"period": "2023", "value": 6.2},
                {"period": "2024", "value": 6.5},
            ],
            "debt_to_gdp": [
                {"period": "2018", "value": 40.0}, {"period": "2019", "value": 41.5},
                {"period": "2020", "value": 47.6}, {"period": "2021", "value": 51.4},
                {"period": "2022", "value": 56.8}, {"period": "2023", "value": 57.5},
                {"period": "2024", "value": 58.1},
            ],
        },
    },
}


def resolve_country_code(ident: str) -> str:
    """Resolve slug or ISO code to 3-letter uppercase country code."""
    ident_clean = ident.strip().lower().replace("_", "-")
    code = SLUG_TO_COUNTRY.get(ident_clean)
    if not code:
        code = ident.strip().upper()
    if code not in AFRICAN_COUNTRIES:
        raise ValueError(f"Country '{ident}' not supported. Supported: {list(AFRICAN_COUNTRIES.keys())}")
    return code


def get_pan_african_summary(db: Optional[Session] = None) -> List[Dict[str, Any]]:
    """Return harmonized comparison benchmark across all 7 supported African economies."""
    summary = []
    for code, meta in AFRICAN_COUNTRIES.items():
        data = PAN_AFRICAN_BENCHMARKS.get(code, {})
        summary.append({
            "code": code,
            "name": meta["name"],
            "slug": meta["slug"],
            "flag": meta["flag"],
            "region": meta["region"],
            "currency": meta["currency"],
            "capital": meta["capital"],
            "inflation_rate": data.get("inflation"),
            "gdp_growth_rate": data.get("gdp_growth"),
            "debt_to_gdp": data.get("debt_to_gdp"),
            "gdp_per_capita": data.get("gdp_per_capita"),
            "population_millions": data.get("population"),
            "unemployment_rate": data.get("unemployment"),
        })
    return summary


def compare_countries(
    country_a_ident: str, 
    country_b_ident: str, 
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """Compute deep bilateral macroeconomic comparison between two African economies."""
    code_a = resolve_country_code(country_a_ident)
    code_b = resolve_country_code(country_b_ident)

    meta_a = AFRICAN_COUNTRIES[code_a]
    meta_b = AFRICAN_COUNTRIES[code_b]

    bench_a = PAN_AFRICAN_BENCHMARKS[code_a]
    bench_b = PAN_AFRICAN_BENCHMARKS[code_b]

    # Spreads and differentials
    inf_spread = round(bench_a["inflation"] - bench_b["inflation"], 2)
    growth_spread = round(bench_a["gdp_growth"] - bench_b["gdp_growth"], 2)
    debt_spread = round(bench_a["debt_to_gdp"] - bench_b["debt_to_gdp"], 2)
    income_spread = round(bench_a["gdp_per_capita"] - bench_b["gdp_per_capita"], 2)

    # Narrative synthesis
    insights = []
    if abs(inf_spread) > 5.0:
        higher = meta_a["name"] if inf_spread > 0 else meta_b["name"]
        lower = meta_b["name"] if inf_spread > 0 else meta_a["name"]
        insights.append(
            f"{higher}'s headline inflation ({max(bench_a['inflation'], bench_b['inflation'])}%) significantly exceeds {lower} ({min(bench_a['inflation'], bench_b['inflation'])}%) by {abs(inf_spread):.1f} percentage points, indicating sharper purchasing power compression."
        )
    else:
        insights.append(
            f"Both {meta_a['name']} and {meta_b['name']} exhibit closely matched price levels (inflation spread: {inf_spread:+.1f}%)."
        )

    if growth_spread > 0:
        insights.append(
            f"{meta_a['name']} is outpacing {meta_b['name']} in real output expansion ({bench_a['gdp_growth']}% vs {bench_b['gdp_growth']}%)."
        )
    else:
        insights.append(
            f"{meta_b['name']} demonstrates faster real economic growth ({bench_b['gdp_growth']}% vs {bench_a['gdp_growth']}%)."
        )

    if debt_spread < 0:
        insights.append(
            f"{meta_a['name']} maintains a lighter sovereign debt-to-GDP burden ({bench_a['debt_to_gdp']}%) compared to {meta_b['name']} ({bench_b['debt_to_gdp']}%)."
        )
    else:
        insights.append(
            f"{meta_b['name']} operates with lower public debt leverage ({bench_b['debt_to_gdp']}% of GDP vs {bench_a['debt_to_gdp']}%)."
        )

    # Build aligned time series for multi-line charting
    history_a = bench_a.get("history", {})
    history_b = bench_b.get("history", {})

    aligned_series: Dict[str, List[Dict[str, Any]]] = {}
    for metric_key in ["inflation", "gdp_growth", "debt_to_gdp"]:
        pts_a = {p["period"]: p["value"] for p in history_a.get(metric_key, [])}
        pts_b = {p["period"]: p["value"] for p in history_b.get(metric_key, [])}
        all_periods = sorted(list(set(pts_a.keys()) | set(pts_b.keys())))

        aligned_series[metric_key] = [
            {
                "period": prd,
                f"{code_a}": pts_a.get(prd),
                f"{code_b}": pts_b.get(prd),
            }
            for prd in all_periods
        ]

    return {
        "country_a": {**meta_a, "metrics": {k: v for k, v in bench_a.items() if k != "history"}},
        "country_b": {**meta_b, "metrics": {k: v for k, v in bench_b.items() if k != "history"}},
        "differentials": {
            "inflation_spread": inf_spread,
            "gdp_growth_spread": growth_spread,
            "debt_spread": debt_spread,
            "gdp_per_capita_spread": income_spread,
        },
        "analytical_insights": insights,
        "aligned_time_series": aligned_series,
    }
