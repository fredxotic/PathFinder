import os
import json
import asyncio
from openai import AsyncOpenAI
from typing import List, Dict, Any
from app.models.decision import DecisionInput, Priority
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.client = AsyncOpenAI(api_key=api_key)
        logger.info("AI Service initialized successfully")
    
    async def analyze_decision(self, decision: DecisionInput) -> Dict[str, Any]:
        """Analyze decision using OpenAI GPT-4 with structured reasoning"""
        
        system_prompt = """You are a expert decision analysis assistant. Your role is to help users make better life and career decisions by providing structured, objective analysis.

Analysis Framework:
1. For each option, score it against each priority (0-100)
2. Consider real-world implications, risks, and opportunities
3. Provide balanced reasoning considering both quantitative and qualitative factors
4. Highlight potential trade-offs and long-term impacts

Response Format - MUST BE VALID JSON:
{
    "scores": [
        {
            "option": "Option Name",
            "overall_score": 85,
            "priority_scores": {
                "Career Growth": 90,
                "Work-Life Balance": 75,
                ...
            }
        }
    ],
    "summary": "Comprehensive analysis summary...",
    "reasoning": "Detailed reasoning behind scores...",
    "recommended_option": "Option Name"
}

Be objective, practical, and focus on helping the user make an informed decision."""
        
        user_prompt = f"""
Decision Analysis Request:

Title: {decision.title}
Context: {decision.context}

Options:
{chr(10).join(f"- {opt}" for opt in decision.options)}

Priorities (with weights 1-10):
{chr(10).join(f"- {p.name} (Weight: {p.weight}/10): {p.description}" for p in decision.priorities)}

Please analyze these options against the stated priorities and provide scores and reasoning.
Return ONLY valid JSON, no other text.
"""
        
        try:
            logger.info(f"Starting AI analysis for decision: {decision.title}")
            
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo-1106",  # Using 3.5 for cost, can upgrade to gpt-4-1106-preview
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from AI service")
                
            analysis = json.loads(content)
            
            # Validate the response structure
            self._validate_analysis_response(analysis, decision)
            
            # Calculate confidence based on score differentiation
            scores = [opt["overall_score"] for opt in analysis["scores"]]
            confidence = self._calculate_confidence(scores)
            analysis["confidence"] = confidence
            
            logger.info(f"AI analysis completed successfully for {decision.title}")
            return analysis
            
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON response from AI: {e}")
            raise Exception("AI service returned invalid response format")
        except Exception as e:
            logger.error(f"Error in AI analysis: {str(e)}")
            raise Exception(f"AI analysis failed: {str(e)}")
    
    def _validate_analysis_response(self, analysis: Dict[str, Any], decision: DecisionInput):
        """Validate the structure of the AI response"""
        required_keys = ["scores", "summary", "reasoning", "recommended_option"]
        for key in required_keys:
            if key not in analysis:
                raise ValueError(f"Missing required key in AI response: {key}")
        
        if not isinstance(analysis["scores"], list):
            raise ValueError("Scores must be a list")
        
        # Check if all options are covered
        response_options = {score["option"] for score in analysis["scores"]}
        decision_options = set(decision.options)
        
        if response_options != decision_options:
            raise ValueError(f"AI response doesn't cover all options. Expected: {decision_options}, Got: {response_options}")
    
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