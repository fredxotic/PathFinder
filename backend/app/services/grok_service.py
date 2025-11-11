import os
import json
import asyncio
import httpx
from typing import List, Dict, Any
from dotenv import load_dotenv
from app.models.decision import DecisionInput, Priority, AnalysisResult, OptionScore
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
        
        # Current available Groq models - prioritize the most capable ones
        self.available_models = [
            "llama-3.3-70b-versatile",  # Most capable model first
            "mixtral-8x7b-32768",
            "llama-3.1-8b-instant",
        ]
        
        logger.info(f"🤖 Groq AI Service initialized with available models: {self.available_models}")
    
    async def analyze_decision(self, decision: DecisionInput) -> AnalysisResult:
        """Analyze decision using Groq API with detailed structured reasoning and return AnalysisResult"""
        
        system_prompt = """You are an expert decision analysis assistant with deep expertise in strategic thinking, risk assessment, and personal development. Your role is to provide comprehensive, nuanced analysis that helps users make informed decisions.

CRITICAL: You MUST return valid JSON with this exact structure:
{
    "scores": [
        {
            "option": "Option Name",
            "overall_score": 85,
            "priority_scores": {
                "Priority1": 90,
                "Priority2": 75
            },
            "strengths": ["Key strength 1", "Key strength 2"],
            "weaknesses": ["Potential drawback 1", "Potential drawback 2"],
            "risks": ["Risk factor 1", "Risk factor 2"],
            "opportunities": ["Opportunity 1", "Opportunity 2"]
        }
    ],
    "summary": "Comprehensive executive summary of the analysis",
    "reasoning": "Detailed, nuanced reasoning behind scores and recommendations",
    "recommended_option": "Option Name",
    "key_insights": [
        "Important insight 1",
        "Important insight 2"
    ],
    "next_steps": [
        "Recommended action 1",
        "Recommended action 2"
    ],
    "comparative_analysis": "Detailed comparison of top options"
}

Provide genuinely helpful, specific analysis - not generic platitudes. Focus on concrete factors, trade-offs, and strategic implications."""
        
        user_prompt = f"""
Please provide a comprehensive analysis of this decision scenario:

**DECISION TITLE:** {decision.title}

**CONTEXT & BACKGROUND:**
{decision.context}

**AVAILABLE OPTIONS:**
{chr(10).join(f"{i+1}. {opt}" for i, opt in enumerate(decision.options))}

**KEY PRIORITIES & WEIGHTS:**
{chr(10).join(f"- {p.name} (Weight: {p.weight}/10): {p.description}" for p in decision.priorities)}

**ANALYSIS REQUEST:**
For each option, provide:
1. Overall score (0-100) based on weighted priorities
2. Individual priority scores with specific justifications
3. Key strengths and competitive advantages
4. Potential weaknesses and limitations
5. Identified risks and mitigation considerations
6. Hidden opportunities and upside potential

For the overall analysis, include:
- Detailed comparative analysis between top options
- Strategic implications of each choice
- Key insights that might not be immediately obvious
- Concrete next steps for the recommended option

Return ONLY valid JSON:"""
        
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
                    logger.error("❌ All Groq models failed, falling back to enhanced mock service")
                    return await self._fallback_to_mock(decision)
                continue
    
    async def _make_api_call(self, model: str, system_prompt: str, user_prompt: str, decision: DecisionInput) -> AnalysisResult:
        """Make API call with specific model and return AnalysisResult"""
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
            "temperature": 0.3,  # Slightly higher for more creative insights
            "max_tokens": 4000,  # Increased for more detailed analysis
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
        analysis_dict = json.loads(cleaned_content)
        
        # Validate and enhance the response structure
        analysis_dict = self._validate_and_enhance_response(analysis_dict, decision)
        
        # Convert to AnalysisResult object
        analysis_result = self._convert_to_analysis_result(analysis_dict, decision)
        
        logger.info(f"📊 Analysis completed - Confidence: {analysis_result.confidence}%, Recommended: {analysis_result.recommended_option}")
        return analysis_result
    
    def _validate_and_enhance_response(self, analysis_dict: Dict[str, Any], decision: DecisionInput) -> Dict[str, Any]:
        """Validate and enhance the AI response structure"""
        
        # Ensure all required top-level keys exist
        required_keys = ["scores", "summary", "reasoning", "recommended_option"]
        for key in required_keys:
            if key not in analysis_dict:
                if key == "scores":
                    analysis_dict[key] = []
                elif key == "summary":
                    analysis_dict[key] = f"Analysis of '{decision.title}' based on your priorities."
                elif key == "reasoning":
                    analysis_dict[key] = "The options were evaluated against your stated priorities with consideration of strategic implications."
                elif key == "recommended_option":
                    analysis_dict[key] = decision.options[0] if decision.options else "No option"
        
        # Enhanced keys for better analysis
        enhanced_keys = ["key_insights", "next_steps", "comparative_analysis"]
        for key in enhanced_keys:
            if key not in analysis_dict:
                if key == "key_insights":
                    analysis_dict[key] = ["Consider both short-term and long-term implications of your decision."]
                elif key == "next_steps":
                    analysis_dict[key] = ["Review the analysis with trusted advisors before finalizing your decision."]
                elif key == "comparative_analysis":
                    analysis_dict[key] = "Further comparison needed between the top options."
        
        # Ensure scores is a list
        if not isinstance(analysis_dict["scores"], list):
            analysis_dict["scores"] = []

        
        # FIX FOR EXTRA CHART OPTION (DEPLOYMENT BUG):
        # 1. Map all user-provided options to ensure we only process those.
        decision_options_set = set(decision.options)
        
        # 2. Filter out any scores that were invented by the AI and are not in the user's options list.
        # This prevents the AI's hallucinated options (the 'extra option') from reaching the UI.
        analysis_dict["scores"] = [
            score for score in analysis_dict["scores"] 
            if score.get("option") in decision_options_set
        ]
        
        response_options = {score.get("option") for score in analysis_dict["scores"]}
        
        # 3. Add missing user-provided options with enhanced default structure (if the AI missed one)
        for option in decision_options_set - response_options:
            analysis_dict["scores"].append({
                "option": option,
                "overall_score": 50,
                "priority_scores": {p.name: 50 for p in decision.priorities},
                "strengths": ["Needs further evaluation"],
                "weaknesses": ["Limited information available"],
                "risks": ["Unknown factors present"],
                "opportunities": ["Potential for positive outcomes"]
            })
        
        # Enhance each score with additional analysis dimensions
        for score in analysis_dict["scores"]:
            # Ensure required fields
            if "overall_score" not in score:
                score["overall_score"] = 50
            if "priority_scores" not in score:
                score["priority_scores"] = {p.name: 50 for p in decision.priorities}
            
            # Add enhanced analysis dimensions if missing
            enhanced_dimensions = ["strengths", "weaknesses", "risks", "opportunities"]
            for dimension in enhanced_dimensions:
                if dimension not in score or not score[dimension]:
                    if dimension == "strengths":
                        score[dimension] = ["Aligns with some priorities"]
                    elif dimension == "weaknesses":
                        score[dimension] = ["May involve trade-offs"]
                    elif dimension == "risks":
                        score[dimension] = ["Standard implementation risks"]
                    elif dimension == "opportunities":
                        score[dimension] = ["Potential for positive outcomes"]
        
        # Ensure recommended_option is valid (only pick from the user's options)
        if (analysis_dict["recommended_option"] not in decision_options_set and 
            analysis_dict["scores"]):
            # Pick the option with highest overall score
            best_option = max(analysis_dict["scores"], key=lambda x: x["overall_score"])
            analysis_dict["recommended_option"] = best_option["option"]
        
        # Enhance summary if too generic
        if len(analysis_dict["summary"].split()) < 15:  # If summary is too brief
            top_option = next((s for s in analysis_dict["scores"] if s["option"] == analysis_dict["recommended_option"]), None)
            if top_option:
                # Use a cleaner way to get the first priority name for the summary
                first_priority_name = decision.priorities[0].name if decision.priorities else 'your criteria'
                analysis_dict["summary"] = (f"{analysis_dict['recommended_option']} is recommended with a score of {top_option['overall_score']}/100, "
                                     f"demonstrating strong alignment with your key priorities including {first_priority_name}.")
        
        return analysis_dict
    
    def _convert_to_analysis_result(self, analysis_dict: Dict[str, Any], decision: DecisionInput) -> AnalysisResult:
        """Convert validated response dictionary to AnalysisResult object"""
        
        # Calculate confidence based on score differentiation and analysis depth
        scores = [opt["overall_score"] for opt in analysis_dict["scores"]]
        confidence = self._calculate_confidence(scores, analysis_dict)
        
        # Create OptionScore objects
        option_scores = []
        for score_data in analysis_dict["scores"]:
            option_scores.append(OptionScore(
                option=score_data["option"],
                overall_score=score_data["overall_score"],
                priority_scores=score_data["priority_scores"],
                strengths=score_data["strengths"],
                weaknesses=score_data["weaknesses"],
                risks=score_data["risks"],
                opportunities=score_data["opportunities"]
            ))
        
        # Create AnalysisResult object - make sure this is correct
        analysis_result = AnalysisResult(
            decision_id=None,  # Will be set when saved to database
            scores=option_scores,
            summary=analysis_dict["summary"],
            reasoning=analysis_dict["reasoning"],
            confidence=confidence,
            recommended_option=analysis_dict["recommended_option"],
            key_insights=analysis_dict.get("key_insights", []),
            next_steps=analysis_dict.get("next_steps", []),
            comparative_analysis=analysis_dict.get("comparative_analysis", "")
        )
        
        # Debug: Print the created object to verify
        print(f"✅ Created AnalysisResult: {analysis_result}")
        return analysis_result
    
    def _calculate_confidence(self, scores: List[float], analysis_dict: Dict[str, Any]) -> float:
        """Calculate confidence level based on score differentiation and analysis quality"""
        if len(scores) < 2:
            return 60.0
        
        max_score = max(scores)
        min_score = min(scores)
        score_range = max_score - min_score
        
        # Base confidence from score differentiation
        base_confidence = 40 + (score_range / 100) * 40
        
        # Boost confidence for detailed analysis
        analysis_quality_boost = 0
        reasoning_words = len(analysis_dict.get("reasoning", "").split())
        if reasoning_words > 100:
            analysis_quality_boost += 10
        if len(analysis_dict.get("key_insights", [])) >= 2:
            analysis_quality_boost += 5
        if analysis_dict.get("comparative_analysis") and len(analysis_dict["comparative_analysis"].split()) > 50:
            analysis_quality_boost += 5
        
        confidence = min(base_confidence + analysis_quality_boost, 95)
        return round(confidence, 1)
    
    async def _fallback_to_mock(self, decision: DecisionInput) -> AnalysisResult:
        """Fallback to mock service if Groq API fails"""
        logger.info("🔄 Falling back to mock AI service")
        try:
            # Try enhanced mock first
            from app.services.mock_ai_service import MockAIService
            mock_service = MockAIService()
            return await mock_service.analyze_decision(decision)
        except ImportError:
            # Fallback to basic mock
            from app.services.mock_ai_service import MockAIService
            mock_service = MockAIService()
            return await mock_service.analyze_decision(decision)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()