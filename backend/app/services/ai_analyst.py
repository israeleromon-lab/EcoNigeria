import os
import json
import requests
from google import genai
from google.genai import types
from typing import Dict, Any, List

class AIAnalystEngine:
    """Uses OpenRouter API (Primary) or Gemini API (Backup) to analyze economic data."""
    
    def __init__(self, gemini_api_key: str | None = None, openrouter_api_key: str | None = None):
        self.gemini_api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")
        self.openrouter_api_key = openrouter_api_key or os.getenv("OPENROUTER_API_KEY")
        
        self.gemini_client = None
        if self.gemini_api_key:
            self.gemini_client = genai.Client(api_key=self.gemini_api_key)
            
    def _get_mock_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback if no APIs are available."""
        return {
            "summary": "This is a mock AI summary since API keys are missing or failed.",
            "key_insights": [
                "Economic indicators show a mixed trend.",
                "Inflation remains a concern for policy makers.",
                "GDP growth is stable but requires structural reforms."
            ],
            "outlook": "Neutral to Positive",
            "risk_factors": ["Global supply chain disruptions", "FX volatility"]
        }

    def _call_openrouter(self, prompt: str) -> Dict[str, Any]:
        """Calls OpenRouter API using requests."""
        if not self.openrouter_api_key:
            raise ValueError("OpenRouter API key missing")
            
        headers = {
            "Authorization": f"Bearer {self.openrouter_api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "meta-llama/llama-3.3-70b-instruct",
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
        
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=15
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
                temperature=0.2
            )
        )
        return json.loads(response.text)
        
    def generate_report(self, indicator_data: List[Dict[str, Any]], country: str = "Nigeria") -> Dict[str, Any]:
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
        
        # Try OpenRouter First
        try:
            print("Attempting to generate report via OpenRouter...")
            return self._call_openrouter(prompt)
        except Exception as e:
            print(f"OpenRouter failed ({e}). Falling back to Gemini...")
            
        # Fallback to Gemini
        try:
            return self._call_gemini(prompt)
        except Exception as e:
            print(f"Gemini failed ({e}). Falling back to mock data...")
            
        return self._get_mock_analysis(indicator_data)
