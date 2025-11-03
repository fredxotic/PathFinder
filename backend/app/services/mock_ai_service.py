import json
import asyncio
import random
from typing import List, Dict, Any
from app.models.decision import DecisionInput, Priority
import logging

logger = logging.getLogger(__name__)

class MockAIService:
    def __init__(self):
        logger.info("🤖 Mock AI Service initialized - No API key required!")
    
    async def analyze_decision(self, decision: DecisionInput) -> Dict[str, Any]:
        """Mock AI analysis that simulates real OpenAI responses"""
        
        logger.info(f"🧠 Mock AI analyzing decision: {decision.title}")
        
        # Simulate API delay
        await asyncio.sleep(2)
        
        # Generate realistic mock analysis
        analysis = self._generate_mock_analysis(decision)
        
        logger.info(f"✅ Mock AI analysis completed for {decision.title}")
        return analysis
    
    def _generate_mock_analysis(self, decision: DecisionInput) -> Dict[str, Any]:
        """Generate realistic mock analysis based on decision data"""
        
        # Calculate base scores with some randomness
        base_scores = {}
        for option in decision.options:
            base_score = random.randint(40, 90)
            base_scores[option] = base_score
        
        # Adjust scores based on priority weights
        scores = []
        for option in decision.options:
            priority_scores = {}
            
            for priority in decision.priorities:
                weight_factor = priority.weight / 10.0
                
                # Simulate option-specific strengths
                option_bonus = self._calculate_option_bonus(option, priority)
                priority_score = max(0, min(100, base_scores[option] + option_bonus))
                priority_scores[priority.name] = round(priority_score)
            
            # Ensure ALL priorities are included with scores
            for priority in decision.priorities:
                if priority.name not in priority_scores:
                    # Assign a reasonable score if missing
                    priority_scores[priority.name] = random.randint(50, 80)
            
            # Calculate weighted overall score
            total_weight = sum(p.weight for p in decision.priorities)
            weighted_score = sum(
                priority_scores[p.name] * (p.weight / total_weight) 
                for p in decision.priorities
            )
            
            scores.append({
                "option": option,
                "overall_score": round(weighted_score),
                "priority_scores": priority_scores  # This should never be null
            })
        
        # Sort by score and determine recommendation
        scores.sort(key=lambda x: x["overall_score"], reverse=True)
        recommended_option = scores[0]["option"]
        
        # Generate realistic summary and reasoning
        summary, reasoning = self._generate_narrative(decision, scores, recommended_option)
        
        # Calculate confidence
        confidence = self._calculate_confidence([s["overall_score"] for s in scores])
        
        return {
            "scores": scores,
            "summary": summary,
            "reasoning": reasoning,
            "recommended_option": recommended_option,
            "confidence": confidence
        }
    
    def _calculate_option_bonus(self, option: str, priority: Priority) -> int:
        """Calculate bonus points based on option name and priority type"""
        option_lower = option.lower()
        priority_lower = priority.name.lower()
        
        if "career" in priority_lower or "growth" in priority_lower:
            if any(word in option_lower for word in ["promotion", "manager", "lead", "senior", "advance", "growth"]):
                return random.randint(15, 25)
            elif any(word in option_lower for word in ["stay", "current", "maintain"]):
                return random.randint(-10, 5)
                
        elif "balance" in priority_lower or "life" in priority_lower:
            if any(word in option_lower for word in ["remote", "flexible", "part-time", "balance", "family"]):
                return random.randint(15, 25)
            elif any(word in option_lower for word in ["overtime", "intensive", "demanding"]):
                return random.randint(-15, -5)
                
        elif "financial" in priority_lower or "money" in priority_lower:
            if any(word in option_lower for word in ["raise", "bonus", "higher pay", "investment", "profit"]):
                return random.randint(15, 25)
            elif any(word in option_lower for word in ["volunteer", "non-profit", "sacrifice"]):
                return random.randint(-20, -5)
                
        elif "learning" in priority_lower:
            if any(word in option_lower for word in ["learn", "study", "course", "education", "skill"]):
                return random.randint(15, 25)
                
        elif "fulfillment" in priority_lower:
            if any(word in option_lower for word in ["passion", "purpose", "meaning", "joy", "happy"]):
                return random.randint(15, 25)
        
        # Default random bonus
        return random.randint(-5, 15)
    
    def _generate_narrative(self, decision: DecisionInput, scores: List[Dict], recommended: str) -> tuple[str, str]:
        """Generate realistic narrative analysis"""
        
        top_score = scores[0]["overall_score"]
        second_score = scores[1]["overall_score"] if len(scores) > 1 else top_score
        score_gap = top_score - second_score
        
        # Determine narrative tone based on score gap
        if score_gap > 20:
            confidence_level = "strongly"
            certainty = "clearly stands out"
        elif score_gap > 10:
            confidence_level = "moderately"
            certainty = "emerges as the better choice"
        else:
            confidence_level = "slightly"
            certainty = "has a marginal advantage"
        
        # Generate summary
        summary = f"Based on your priorities, {recommended} {certainty} with an overall score of {top_score}/100. "

        if score_gap > 15:
            summary += f"This represents a {confidence_level} stronger alignment with your stated goals compared to other options."
        else:
            summary += "The decision is relatively close, so consider your personal intuition alongside this analysis."
        
        # Generate detailed reasoning
        reasoning_parts = []
        
        # Top option strengths
        top_option_scores = next(s for s in scores if s["option"] == recommended)
        strengths = []
        for priority in decision.priorities:
            score = top_option_scores["priority_scores"][priority.name]
            if score >= 80:
                strengths.append(f"exceptional {priority.name.lower()} (score: {score})")
            elif score >= 70:
                strengths.append(f"strong {priority.name.lower()} (score: {score})")
        
        if strengths:
            reasoning_parts.append(f"**{recommended}** demonstrates {', '.join(strengths)}.")
        
        # Comparative analysis
        if len(scores) > 1:
            runner_up = scores[1]["option"]
            reasoning_parts.append(f"Compared to {runner_up}, {recommended} better balances your key priorities.")
        
        # Trade-offs
        weaknesses = []
        for priority in decision.priorities:
            score = top_option_scores["priority_scores"][priority.name]
            if score <= 60:
                weaknesses.append(priority.name.lower())
        
        if weaknesses:
            reasoning_parts.append(f"Consider that {recommended} may involve trade-offs in {', '.join(weaknesses)}.")
        
        # Context-specific advice
        if "career" in decision.context.lower():
            reasoning_parts.append("For career decisions, also consider long-term growth potential and skill development.")
        elif "personal" in decision.context.lower():
            reasoning_parts.append("For personal decisions, trust your instincts about what will bring you lasting fulfillment.")
        
        reasoning = " ".join(reasoning_parts)
        
        return summary, reasoning
    
    def _calculate_confidence(self, scores: List[float]) -> float:
        """Calculate confidence based on score differentiation"""
        if len(scores) < 2:
            return 75.0
        
        max_score = max(scores)
        min_score = min(scores)
        score_range = max_score - min_score
        
        # More differentiation = higher confidence
        base_confidence = 50 + (score_range / 100) * 40
        confidence = min(base_confidence, 95)
        
        # Add some random variation to make it feel more realistic
        confidence += random.uniform(-5, 5)
        return round(max(30, min(95, confidence)), 1)
    
    async def generate_insights(self, decision: DecisionInput, analysis: Dict[str, Any]) -> str:
        """Generate additional insights"""
        
        await asyncio.sleep(1)  # Simulate processing time
        
        insights = [
            "Consider discussing this decision with trusted mentors or colleagues who know your situation well.",
            "Think about how each option aligns with your 5-year personal and professional goals.",
            "Remember that no decision is permanent - you can always course-correct based on new information.",
            "Pay attention to your gut feeling, as it often incorporates subconscious factors not captured in this analysis."
        ]
        
        # Add context-specific insights
        if any(word in decision.context.lower() for word in ["job", "career", "work"]):
            insights.append("Research company culture and growth opportunities for career-related options.")
        elif any(word in decision.context.lower() for word in ["relationship", "family", "personal"]):
            insights.append("Consider the impact of each option on your important relationships and personal well-being.")
        
        return "\n".join(f"• {insight}" for insight in insights)