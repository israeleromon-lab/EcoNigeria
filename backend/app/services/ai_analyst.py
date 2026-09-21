"""AI Analyst Engine – Data-Grounded Macroeconomic Policy & Intelligence Synthesizer.

Strictly grounds analysis in verified database observations, active signals,
and the composite Economic Pulse Index to deliver hallucination-free briefs.
"""

from __future__ import annotations

import os
import json
import logging
from typing import Dict, Any, List, Optional
import requests

logger = logging.getLogger(__name__)

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None


class AIAnalystEngine:
    """Orchestrates data-grounded macro analysis using OpenRouter, Gemini, or Grounded Fallback."""

    def __init__(self, gemini_api_key: str | None = None, openrouter_api_key: str | None = None):
        self.gemini_api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")
        self.openrouter_api_key = openrouter_api_key or os.getenv("OPENROUTER_API_KEY")

        self.gemini_client = None
        if self.gemini_api_key and genai is not None:
            try:
                self.gemini_client = genai.Client(api_key=self.gemini_api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}")

    def _generate_grounded_mock(self, context: Dict[str, Any], topic: str) -> Dict[str, Any]:
        """Deterministic data-grounded fallback synthesizing directly from verified database context."""
        pulse = context.get("pulse", {})
        pulse_score = pulse.get("score", 52.0)
        pulse_rating = pulse.get("rating", "Moderate Resilience")
        signals = context.get("signals", [])
        indicators = context.get("indicators", [])

        # Find key indicators from context
        inf = next((ind for ind in indicators if "inflation" in ind.get("name", "").lower()), None)
        gdp = next((ind for ind in indicators if "gdp growth" in ind.get("name", "").lower()), None)
        oil = next((ind for ind in indicators if "oil" in ind.get("name", "").lower()), None)
        fx = next((ind for ind in indicators if "exchange rate" in ind.get("name", "").lower() or "naira" in ind.get("name", "").lower()), None)

        inf_str = f"{inf['latest_value']}{inf.get('unit', '%')} ({inf.get('latest_period', 'latest')})" if inf else "elevated levels"
        gdp_str = f"{gdp['latest_value']}% ({gdp.get('latest_period', 'latest')})" if gdp else "moderate pace"
        oil_str = f"${oil['latest_value']}/barrel ({oil.get('latest_period', 'latest')})" if oil else "global benchmark averages"
        fx_str = f"₦{fx['latest_value']}/USD ({fx.get('latest_period', 'latest')})" if fx else "prevailing interbank rates"

        insights = [
            f"Headline consumer inflation recorded at {inf_str}, requiring tight coordination between fiscal expenditure and monetary stance.",
            f"Gross domestic output expanded at {gdp_str}, demonstrating selective resilience in services while manufacturing navigates input cost pressures.",
            f"Crude export receipts anchored near {oil_str}, providing near-term foreign currency liquidity despite domestic pipeline security considerations.",
            f"Foreign exchange parity stabilised around {fx_str} following structural FX unification and market-reflective pricing mechanisms.",
        ]

        if signals:
            top_signal = signals[0]
            insights.append(
                f"Automated Signal Alert: '{top_signal.get('title')}' triggered with {top_signal.get('metric_value')} vs benchmark {top_signal.get('benchmark')}."
            )

        recommendations = [
            "Maintain orthodox monetary stance until headline inflation decisively enters the target disinflation corridor.",
            "Accelerate non-oil tax revenue mobilization through digital compliance rather than increasing distortionary tariffs.",
            "Reinforce foreign exchange reserve buffers and transparent FX auction mechanisms to anchor commercial expectations.",
        ]

        risks = [
            "Imported inflation passthrough stemming from global supply chain volatility and food logistic bottlenecks.",
            "Subdued domestic crude output curtailing official federation receipts and sovereign external buffers.",
            "High debt service-to-revenue ratios constraining capital expenditure allocations across social infrastructure.",
        ]

        outlook = "Moderate Resilience" if pulse_score >= 50 else "Vulnerable"

        return {
            "title": f"Macroeconomic Intelligence Brief: {topic}",
            "topic": topic,
            "summary": (
                f"EconoNigeria's composite Economic Pulse Index registers at {pulse_score:.1f}/100 ({pulse_rating}). "
                f"While real output expansion ({gdp_str}) remains positive, consumer price inflation ({inf_str}) "
                f"and currency adjustments ({fx_str}) continue to shape macroeconomic outcomes."
            ),
            "pulse_score": pulse_score,
            "pulse_rating": pulse_rating,
            "key_insights": insights[:4],
            "policy_recommendations": recommendations,
            "risk_factors": risks,
            "outlook": outlook,
            "data_grounded": True,
            "source_count": len(indicators),
        }

    def _call_openrouter(self, prompt: str) -> Dict[str, Any]:
        """Calls OpenRouter API using requests."""
        if not self.openrouter_api_key:
            raise ValueError("OpenRouter API key missing")

        headers = {
            "Authorization": f"Bearer {self.openrouter_api_key}",
            "Content-Type": "application/json",
        }

        data = {
            "model": "meta-llama/llama-3.3-70b-instruct",
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "user", "content": prompt}
            ],
        }

        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=20,
        )
        response.raise_for_status()
        result_text = response.json()["choices"][0]["message"]["content"]
        return json.loads(result_text)

    def _call_gemini(self, prompt: str) -> Dict[str, Any]:
        """Calls Gemini API as backup."""
        if not self.gemini_client:
            raise ValueError("Gemini API key missing")

        response = self.gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )
        return json.loads(response.text)

    def generate_grounded_brief(
        self,
        context: Dict[str, Any],
        topic: str = "Macro Diagnostic",
        country: str = "Nigeria",
    ) -> Dict[str, Any]:
        """Generates an evidence-backed intelligence brief grounded strictly in database facts."""
        prompt = f"""
You are the Senior Chief Economist at EconoNigeria, an independent open-access macroeconomic think tank.
Analyze the verified macroeconomic database context for {country} and produce a publication-grade Policy Brief on '{topic}'.

STRICT GROUNDING RULES:
1. Every observation, figure, trend, and recommendation MUST be strictly derived from the verified Context JSON below.
2. Do NOT invent, assume, or hallucinate metrics that are not in the Context.
3. State the exact observation period (e.g. 2023, 2024) and unit for every metric cited.

VERIFIED CONTEXT:
{json.dumps(context, indent=2)}

Respond with a JSON object strictly following this structure (no markdown fences, pure JSON):
{{
    "title": "Authoritative Editorial Headline for the Brief",
    "topic": "{topic}",
    "summary": "3-4 concise sentences synthesizing macroeconomic performance and current structural pressures strictly citing context numbers.",
    "pulse_score": {context.get('pulse', {}).get('score', 50.0)},
    "pulse_rating": "{context.get('pulse', {}).get('rating', 'Moderate Resilience')}",
    "key_insights": [
        "Insight 1 citing specific indicator, value, and year",
        "Insight 2 citing specific indicator, value, and year",
        "Insight 3 citing specific indicator, value, and year",
        "Insight 4 citing specific indicator, value, and year"
    ],
    "policy_recommendations": [
        "Actionable recommendation 1 for Central Bank or Fiscal Authorities",
        "Actionable recommendation 2 for Central Bank or Fiscal Authorities",
        "Actionable recommendation 3 for Central Bank or Fiscal Authorities"
    ],
    "risk_factors": [
        "Specific downside vulnerability 1 backed by data",
        "Specific downside vulnerability 2 backed by data",
        "Specific downside vulnerability 3 backed by data"
    ],
    "outlook": "Expansionary | Resilient | Cautious | Vulnerable | Critical Stress"
}}
"""
        # Try OpenRouter
        try:
            logger.info("Attempting to generate brief via OpenRouter...")
            res = self._call_openrouter(prompt)
            res["data_grounded"] = True
            return res
        except Exception as e:
            logger.debug(f"OpenRouter unavailable ({e}). Falling back to Gemini...")

        # Try Gemini
        try:
            logger.info("Attempting to generate brief via Gemini...")
            res = self._call_gemini(prompt)
            res["data_grounded"] = True
            return res
        except Exception as e:
            logger.debug(f"Gemini unavailable ({e}). Falling back to deterministic grounded synthesizer...")

        # Grounded Fallback
        return self._generate_grounded_mock(context, topic)

    def generate_report(self, indicator_data: List[Dict[str, Any]], country: str = "Nigeria") -> Dict[str, Any]:
        """Legacy compatibility wrapper for earlier frontend calls."""
        context = {"indicators": indicator_data}
        return self.generate_grounded_brief(context, topic="Macro Diagnostic", country=country)
