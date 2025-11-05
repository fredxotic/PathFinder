# backend/app/services/grok_service.py
import os
import json
import asyncio
import httpx
from typing import List, Dict, Any
from dotenv import load_dotenv
from app.models.decision import DecisionInput, Priority
import logging

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class GrokService:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is required. Please check your .env file")
        
        self.api_key = api_key
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        self.client = httpx.AsyncClient(timeout=60.0)
        
        # Current available Groq models
        self.available_models = [
            "llama-3.1-8b-instant",
            "llama-3.3-70b-versatile", 
            "mixtral-8x7b-32768",
        ]
        
        logger.info(f"🤖 Groq AI Service initialized with available models: {self.available_models}")
    
    async def analyze_decision(self, decision: DecisionInput) -> Dict[str, Any]:
        """Analyze decision using Groq API with structured reasoning"""
        
        system_prompt = """You are an expert decision analysis assistant. Analyze the following decision and return ONLY valid JSON.

CRITICAL: You MUST return valid JSON with this exact structure:
{
    "scores": [
        {
            "option": "Option Name",
            "overall_score": 85,
            "priority_scores": {
                "Priority1": 90,
                "Priority2": 75
            }
        }
    ],
    "summary": "Brief analysis summary",
    "reasoning": "Detailed reasoning behind scores",
    "recommended_option": "Option Name"
}

Do not include any other text, explanations, or markdown. Only the JSON object."""
        
        user_prompt = f"""
Please analyze this decision and return ONLY the JSON response:

TITLE: {decision.title}
CONTEXT: {decision.context}

OPTIONS:
{chr(10).join(f"- {opt}" for opt in decision.options)}

PRIORITIES:
{chr(10).join(f"- {p.name} (Weight: {p.weight}): {p.description}" for p in decision.priorities)}

Return valid JSON only:"""
        
        # Try each available model until one works
        for attempt, model in enumerate(self.available_models):
            try:
                logger.info(f"🧠 Attempt {attempt + 1}: Analyzing '{decision.title}' with model: {model}")
                result = await self._make_api_call(model, system_prompt, user_prompt, decision)
                logger.info(f"✅ Successfully analyzed decision '{decision.title}' with model: {model}")
                return result
            except Exception as e:
                logger.warning(f"❌ Model {model} failed: {str(e)}")
                if attempt == len(self.available_models) - 1:
                    logger.error("❌ All Groq models failed, falling back to mock service")
                    return await self._fallback_to_mock(decision)
                continue
    
    async def _make_api_call(self, model: str, system_prompt: str, user_prompt: str, decision: DecisionInput) -> Dict[str, Any]:
        """Make API call with specific model"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.1,  # Lower temperature for more consistent JSON
            "max_tokens": 2000,
            "response_format": {"type": "json_object"}
        }
        
        logger.debug(f"📤 Sending request to Groq API with model: {model}")
        response = await self.client.post(self.base_url, json=payload, headers=headers)
        
        if response.status_code != 200:
            error_msg = f"Groq API error {response.status_code} with model {model}: {response.text}"
            logger.error(f"❌ {error_msg}")
            raise Exception(error_msg)
            
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        
        if not content:
            raise ValueError("Empty response from Groq API")
        
        # Clean the response - remove any markdown code blocks
        cleaned_content = content.strip()
        if cleaned_content.startswith('```json'):
            cleaned_content = cleaned_content[7:]
        if cleaned_content.startswith('```'):
            cleaned_content = cleaned_content[3:]
        if cleaned_content.endswith('```'):
            cleaned_content = cleaned_content[:-3]
        cleaned_content = cleaned_content.strip()
            
        logger.debug(f"📥 Received response: {cleaned_content[:200]}...")
        analysis = json.loads(cleaned_content)
        
        # Validate and fix the response structure
        analysis = self._validate_and_fix_response(analysis, decision)
        
        # Calculate confidence based on score differentiation
        scores = [opt["overall_score"] for opt in analysis["scores"]]
        confidence = self._calculate_confidence(scores)
        analysis["confidence"] = confidence
        
        logger.info(f"📊 Analysis completed - Confidence: {confidence}%, Recommended: {analysis['recommended_option']}")
        return analysis
    
    def _validate_and_fix_response(self, analysis: Dict[str, Any], decision: DecisionInput) -> Dict[str, Any]:
        """Validate and fix the AI response structure"""
        # Ensure all required keys exist
        if "scores" not in analysis:
            analysis["scores"] = []
        
        if "summary" not in analysis:
            analysis["summary"] = "Analysis completed based on your priorities."
        
        if "reasoning" not in analysis:
            analysis["reasoning"] = "The options were evaluated against your stated priorities."
        
        # Ensure scores is a list
        if not isinstance(analysis["scores"], list):
            analysis["scores"] = []
        
        # Check if all options are covered
        response_options = {score.get("option", f"Option_{i}") for i, score in enumerate(analysis["scores"])}
        decision_options = set(decision.options)
        
        # Add missing options with default scores
        for option in decision_options - response_options:
            analysis["scores"].append({
                "option": option,
                "overall_score": 50,
                "priority_scores": {p.name: 50 for p in decision.priorities}
            })
        
        # Ensure each score has required fields
        for score in analysis["scores"]:
            if "overall_score" not in score:
                score["overall_score"] = 50
            if "priority_scores" not in score:
                score["priority_scores"] = {p.name: 50 for p in decision.priorities}
        
        # Set recommended_option if missing
        if "recommended_option" not in analysis or not analysis["recommended_option"]:
            if analysis["scores"]:
                # Pick the option with highest overall score
                best_option = max(analysis["scores"], key=lambda x: x["overall_score"])
                analysis["recommended_option"] = best_option["option"]
            else:
                analysis["recommended_option"] = decision.options[0] if decision.options else "No option"
        
        return analysis
    
    def _calculate_confidence(self, scores: List[float]) -> float:
        """Calculate confidence level based on score differentiation"""
        if len(scores) < 2:
            return 50.0
        
        max_score = max(scores)
        min_score = min(scores)
        score_range = max_score - min_score
        
        # More differentiation = higher confidence
        confidence = min(30 + (score_range / 100) * 70, 95)
        return round(confidence, 1)
    
    async def _fallback_to_mock(self, decision: DecisionInput) -> Dict[str, Any]:
        """Fallback to mock service if Groq API fails"""
        logger.info("🔄 Falling back to mock AI service")
        from app.services.mock_ai_service import MockAIService
        mock_service = MockAIService()
        return await mock_service.analyze_decision(decision)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()