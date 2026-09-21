"""Economic Signals Engine – Automated Macroeconomic Anomaly & Policy Detection.

Monitors real-time observations against historical benchmarks to emit
actionable economic warnings, stabilizers, and structural alerts.
"""

from __future__ import annotations

from typing import List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models import Indicator, HistoricalData


class EconomicSignal:
    def __init__(
        self,
        signal_id: str,
        title: str,
        category: str,
        severity: str,  # "critical" | "warning" | "positive" | "info"
        indicator_name: str,
        metric_value: str,
        benchmark: str,
        summary: str,
        implication: str,
    ):
        self.signal_id = signal_id
        self.title = title
        self.category = category
        self.severity = severity
        self.indicator_name = indicator_name
        self.metric_value = metric_value
        self.benchmark = benchmark
        self.summary = summary
        self.implication = implication

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.signal_id,
            "title": self.title,
            "category": self.category,
            "severity": self.severity,
            "indicator_name": self.indicator_name,
            "metric_value": self.metric_value,
            "benchmark": self.benchmark,
            "summary": self.summary,
            "implication": self.implication,
            "detected_at": datetime.now(timezone.utc).isoformat(),
        }


def detect_economic_signals(db: Session) -> List[Dict[str, Any]]:
    """Scan latest database observations and emit active macroeconomic signals."""
    signals: List[EconomicSignal] = []

    # Helper to get latest observation value
    def get_latest(code: str) -> tuple[float | None, str | None]:
        point = (
            db.query(HistoricalData.value, HistoricalData.period)
            .join(Indicator, HistoricalData.indicator_id == Indicator.id)
            .filter(Indicator.code == code, HistoricalData.value.isnot(None))
            .order_by(desc(HistoricalData.period))
            .first()
        )
        if point and point[0] is not None:
            return float(point[0]), str(point[1])
        return None, None

    # 1. Inflation Signal
    inf_val, inf_yr = get_latest("FP.CPI.TOTL.ZG")
    if inf_val is not None:
        if inf_val >= 25.0:
            signals.append(
                EconomicSignal(
                    signal_id="sig-cpi-critical",
                    title="Severe Consumer Inflation Shock",
                    category="Prices & Monetary",
                    severity="critical",
                    indicator_name="Inflation Rate",
                    metric_value=f"{inf_val:.1f}%",
                    benchmark="Target: 6.0% – 9.0%",
                    summary=f"Consumer price inflation reached {inf_val:.1f}% in {inf_yr}, severely depressing real household purchasing power.",
                    implication="Demands sustained monetary tightening by the MPC and urgent food supply-side intervention.",
                )
            )
        elif inf_val >= 15.0:
            signals.append(
                EconomicSignal(
                    signal_id="sig-cpi-elevated",
                    title="Elevated Inflationary Momentum",
                    category="Prices & Monetary",
                    severity="warning",
                    indicator_name="Inflation Rate",
                    metric_value=f"{inf_val:.1f}%",
                    benchmark="Target: 6.0% – 9.0%",
                    summary=f"Headline inflation remains elevated above the single-digit central bank corridor at {inf_val:.1f}%.",
                    implication="Impairs real investment returns and exerts persistent upward pressure on domestic borrowing rates.",
                )
            )

    # 2. Crude Oil Fiscal Buffer Signal
    oil_val, oil_yr = get_latest("DCOILBRENTEU")
    if oil_val is not None:
        if oil_val >= 75.0:
            signals.append(
                EconomicSignal(
                    signal_id="sig-oil-stabilizer",
                    title="Favorable Commodity Export Buffer",
                    category="External Receipts",
                    severity="positive",
                    indicator_name="Brent Crude Oil",
                    metric_value=f"${oil_val:.2f}/bbl",
                    benchmark="Budget Benchmark: ~$75/bbl",
                    summary=f"Global crude prices trading at ${oil_val:.2f}/bbl in {oil_yr}, providing fiscal revenue headroom.",
                    implication="Supports foreign exchange reserve rebuilding provided domestic crude production quotas are met.",
                )
            )
        elif oil_val < 65.0:
            signals.append(
                EconomicSignal(
                    signal_id="sig-oil-deficit",
                    title="Crude Receipt Revenue Contraction",
                    category="External Receipts",
                    severity="warning",
                    indicator_name="Brent Crude Oil",
                    metric_value=f"${oil_val:.2f}/bbl",
                    benchmark="Budget Benchmark: ~$75/bbl",
                    summary=f"Crude prices subdued at ${oil_val:.2f}/bbl, below optimal sovereign fiscal breakeven levels.",
                    implication="Exerts pressure on Federation Account allocations to state and federal governments.",
                )
            )

    # 3. GDP Growth vs Demographic Growth Divergence
    gdp_val, gdp_yr = get_latest("NY.GDP.MKTP.KD.ZG")
    if gdp_val is not None:
        demographic_growth = 2.4  # Nigeria average annual population growth rate ~2.4%
        if gdp_val < demographic_growth:
            signals.append(
                EconomicSignal(
                    signal_id="sig-percapita-contraction",
                    title="Per Capita Income Contraction",
                    category="Economic Expansion",
                    severity="critical" if gdp_val <= 0 else "warning",
                    indicator_name="GDP Growth Rate",
                    metric_value=f"{gdp_val:.2f}%",
                    benchmark=f"Population Growth: ~{demographic_growth}%",
                    summary=f"Annual GDP growth ({gdp_val:.2f}%) trailed demographic expansion, leading to negative real per-capita welfare expansion.",
                    implication="Accelerates poverty incidence unless productivity and capital investment outpace population growth.",
                )
            )
        else:
            signals.append(
                EconomicSignal(
                    signal_id="sig-growth-resilient",
                    title="Positive Real Growth Margin",
                    category="Economic Expansion",
                    severity="positive",
                    indicator_name="GDP Growth Rate",
                    metric_value=f"{gdp_val:.2f}%",
                    benchmark=f"Population Growth: ~{demographic_growth}%",
                    summary=f"Real GDP expansion of {gdp_val:.2f}% outpaced population growth in {gdp_yr}.",
                    implication="Provides foundation for gradual per capita wealth accumulation.",
                )
            )

    # 4. Debt Sustainability Signal
    debt_val, debt_yr = get_latest("GC.DOD.TOTL.GD.ZS")
    if debt_val is not None:
        if debt_val > 45.0:
            signals.append(
                EconomicSignal(
                    signal_id="sig-debt-warning",
                    title="Elevated Debt-to-GDP Leverage",
                    category="Fiscal Health",
                    severity="warning",
                    indicator_name="Central Government Debt",
                    metric_value=f"{debt_val:.1f}% of GDP",
                    benchmark="DMO Ceiling: 40.0% of GDP",
                    summary=f"Debt-to-GDP stands at {debt_val:.1f}%, exceeding fiscal prudence benchmarks.",
                    implication="Constrains fiscal space as a large share of government revenue is consumed by debt servicing.",
                )
            )

    return [s.to_dict() for s in signals]
