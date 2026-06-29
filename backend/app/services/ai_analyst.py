import os
import json
from google import genai
from google.genai import types
from typing import Dict, Any, List

class AIAnalystEngine:
    """Uses Gemini API to analyze economic data and generate insights."""
    
    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
            
    def _get_mock_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback if no API key is provided."""
        return {
            "summary": "This is a mock AI summary since no Gemini API key is configured.",
            "key_insights": [
                "Economic indicators show a mixed trend.",
                "Inflation remains a concern for policy makers.",
                "GDP growth is stable but requires structural reforms."
            ],
            "outlook": "Neutral to Positive",
            "risk_factors": ["Global supply chain disruptions", "FX volatility"]
        }
        
    def generate_report(self, indicator_data: List[Dict[str, Any]], country: str = "Nigeria") -> Dict[str, Any]:
        if not self.client:
            return self._get_mock_analysis(indicator_data)
            
        prompt = f"""
        You are an expert economic analyst for {country}. Analyze the following macroeconomic indicator data and provide a concise intelligence report.
        
        Data: {json.dumps(indicator_data, indent=2)}
        
        Respond with a JSON object in this exact format, without markdown formatting:
        {{
            "summary": "A 2-3 sentence overview of the current economic situation.",
            "key_insights": ["Insight 1", "Insight 2", "Insight 3"],
            "outlook": "Positive, Negative, or Neutral",
            "risk_factors": ["Risk 1", "Risk 2"]
        }}
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            return self._get_mock_analysis(indicator_data)
