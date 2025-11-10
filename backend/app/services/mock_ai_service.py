import json
import asyncio
import random
from typing import List, Dict, Any
from app.models.decision import DecisionInput, Priority
import logging

logger = logging.getLogger(__name__)

class MockAIService:
    def __init__(self):
        logger.info("🤖 Mock AI Service initialized - Providing detailed analysis")
    
    async def analyze_decision(self, decision: DecisionInput) -> Dict[str, Any]:
        """Mock AI analysis with detailed, realistic responses"""
        
        logger.info(f"🧠 Mock AI analyzing decision: {decision.title}")
        
        # Simulate API delay
        await asyncio.sleep(1.5)
        
        # Generate highly detailed mock analysis
        analysis = self._generate_detailed_analysis(decision)
        
        logger.info(f"✅ Enhanced Mock AI analysis completed for {decision.title}")
        return analysis
    
    def _generate_detailed_analysis(self, decision: DecisionInput) -> Dict[str, Any]:
        """Generate highly detailed mock analysis"""
        
        scores = []
        option_details = {}
        
        # Generate detailed scores and analysis for each option
        for option in decision.options:
            base_score = random.randint(45, 85)
            priority_scores = {}
            
            # Generate priority-specific scores with realistic variations
            for priority in decision.priorities:
                # Base score with priority weighting influence
                priority_base = base_score + (priority.weight - 5) * 3
                
                # Add option-specific adjustments
                option_adjustment = self._calculate_detailed_adjustment(option, priority)
                final_score = max(10, min(95, priority_base + option_adjustment))
                priority_scores[priority.name] = round(final_score)
            
            # Calculate weighted overall score
            total_weight = sum(p.weight for p in decision.priorities)
            weighted_score = sum(
                priority_scores[p.name] * (p.weight / total_weight) 
                for p in decision.priorities
            )
            
            # Generate detailed analysis dimensions
            strengths = self._generate_strengths(option, priority_scores, decision.priorities)
            weaknesses = self._generate_weaknesses(option, priority_scores, decision.priorities)
            risks = self._generate_risks(option, decision.context)
            opportunities = self._generate_opportunities(option, decision.context)
            
            option_details[option] = {
                "overall_score": round(weighted_score),
                "priority_scores": priority_scores,
                "strengths": strengths,
                "weaknesses": weaknesses,
                "risks": risks,
                "opportunities": opportunities
            }
            
            scores.append({
                "option": option,
                "overall_score": round(weighted_score),
                "priority_scores": priority_scores,
                "strengths": strengths,
                "weaknesses": weaknesses,
                "risks": risks,
                "opportunities": opportunities
            })
        
        # Sort by score and determine recommendation
        scores.sort(key=lambda x: x["overall_score"], reverse=True)
        recommended_option = scores[0]["option"]
        
        # Generate comprehensive narrative
        summary, reasoning, comparative_analysis = self._generate_comprehensive_narrative(
            decision, scores, recommended_option, option_details
        )
        
        # Generate key insights and next steps
        key_insights = self._generate_key_insights(decision, scores, recommended_option)
        next_steps = self._generate_next_steps(recommended_option, decision.context)
        
        # Calculate confidence
        confidence = self._calculate_confidence([s["overall_score"] for s in scores])
        
        return {
            "scores": scores,
            "summary": summary,
            "reasoning": reasoning,
            "recommended_option": recommended_option,
            "confidence": confidence,
            "key_insights": key_insights,
            "next_steps": next_steps,
            "comparative_analysis": comparative_analysis
        }
    
    def _calculate_detailed_adjustment(self, option: str, priority: Priority) -> int:
        """Calculate detailed adjustment based on option-priority alignment"""
        option_lower = option.lower()
        priority_lower = priority.name.lower()
        
        # Career/Growth priorities
        if any(word in priority_lower for word in ["career", "growth", "advancement", "professional"]):
            career_keywords = {
                "promotion": 25, "manager": 20, "lead": 18, "senior": 15, "advance": 15,
                "growth": 12, "development": 10, "skill": 8, "learn": 8, "training": 5
            }
            for keyword, bonus in career_keywords.items():
                if keyword in option_lower:
                    return bonus + random.randint(-3, 5)
        
        # Work-life balance priorities
        elif any(word in priority_lower for word in ["balance", "life", "family", "personal"]):
            balance_keywords = {
                "remote": 22, "flexible": 20, "balance": 18, "family": 15, "personal": 12,
                "time": 10, "freedom": 15, "autonomy": 12, "control": 10
            }
            negative_keywords = {
                "overtime": -20, "intensive": -15, "demanding": -12, "stress": -15, "pressure": -12
            }
            for keyword, bonus in balance_keywords.items():
                if keyword in option_lower:
                    return bonus + random.randint(-3, 5)
            for keyword, penalty in negative_keywords.items():
                if keyword in option_lower:
                    return penalty + random.randint(-5, 3)
        
        # Financial priorities
        elif any(word in priority_lower for word in ["financial", "money", "income", "salary"]):
            financial_keywords = {
                "raise": 25, "bonus": 22, "higher pay": 25, "investment": 18, "profit": 15,
                "salary": 12, "income": 10, "financial": 8, "revenue": 10
            }
            negative_keywords = {
                "volunteer": -25, "non-profit": -15, "sacrifice": -20, "reduce": -15, "cut": -12
            }
            for keyword, bonus in financial_keywords.items():
                if keyword in option_lower:
                    return bonus + random.randint(-3, 5)
            for keyword, penalty in negative_keywords.items():
                if keyword in option_lower:
                    return penalty + random.randint(-5, 3)
        
        # Learning/Development priorities
        elif any(word in priority_lower for word in ["learning", "education", "skill", "development"]):
            learning_keywords = {
                "learn": 20, "study": 18, "course": 15, "education": 15, "skill": 12,
                "training": 10, "certification": 12, "degree": 15, "workshop": 8
            }
            for keyword, bonus in learning_keywords.items():
                if keyword in option_lower:
                    return bonus + random.randint(-3, 5)
        
        # Fulfillment/Passion priorities
        elif any(word in priority_lower for word in ["fulfillment", "passion", "purpose", "meaning"]):
            fulfillment_keywords = {
                "passion": 22, "purpose": 20, "meaning": 18, "fulfillment": 15, "joy": 12,
                "happy": 10, "satisfaction": 12, "impact": 15, "contribution": 12
            }
            for keyword, bonus in fulfillment_keywords.items():
                if keyword in option_lower:
                    return bonus + random.randint(-3, 5)
        
        # Default random adjustment with smaller range
        return random.randint(-8, 12)
    
    def _generate_strengths(self, option: str, priority_scores: Dict[str, int], priorities: List[Priority]) -> List[str]:
        """Generate realistic strengths based on priority scores"""
        strengths = []
        option_lower = option.lower()
        
        # Identify top-performing priorities
        top_priorities = sorted(priority_scores.items(), key=lambda x: x[1], reverse=True)[:2]
        
        for priority_name, score in top_priorities:
            if score >= 75:
                if "career" in priority_name.lower():
                    strengths.append(f"Strong career advancement potential (score: {score})")
                elif "financial" in priority_name.lower():
                    strengths.append(f"Excellent financial benefits (score: {score})")
                elif "balance" in priority_name.lower():
                    strengths.append(f"Great work-life balance alignment (score: {score})")
                elif "learning" in priority_name.lower():
                    strengths.append(f"Strong skill development opportunities (score: {score})")
                else:
                    strengths.append(f"Excellent alignment with {priority_name} (score: {score})")
        
        # Contextual strengths
        if any(word in option_lower for word in ["remote", "flexible"]):
            strengths.append("Offers flexibility and location independence")
        if any(word in option_lower for word in ["learn", "study", "course"]):
            strengths.append("Provides valuable learning and growth experiences")
        if any(word in option_lower for word in ["lead", "manage", "direct"]):
            strengths.append("Develops leadership and management capabilities")
        
        # Ensure at least 2 strengths
        while len(strengths) < 2:
            generic_strengths = [
                "Good alignment with multiple priorities",
                "Offers valuable experience and exposure",
                "Provides opportunity for personal growth",
                "Has potential for positive outcomes"
            ]
            strengths.append(random.choice(generic_strengths))
        
        return strengths[:4]  # Limit to top 4 strengths
    
    def _generate_weaknesses(self, option: str, priority_scores: Dict[str, int], priorities: List[Priority]) -> List[str]:
        """Generate realistic weaknesses based on priority scores"""
        weaknesses = []
        option_lower = option.lower()
        
        # Identify lowest-performing priorities
        low_priorities = sorted(priority_scores.items(), key=lambda x: x[1])[:2]
        
        for priority_name, score in low_priorities:
            if score <= 60:
                if "financial" in priority_name.lower():
                    weaknesses.append(f"Limited financial upside (score: {score})")
                elif "career" in priority_name.lower():
                    weaknesses.append(f"Moderate career growth potential (score: {score})")
                elif "balance" in priority_name.lower():
                    weaknesses.append(f"Potential work-life balance challenges (score: {score})")
                else:
                    weaknesses.append(f"Weaker alignment with {priority_name} (score: {score})")
        
        # Contextual weaknesses
        if any(word in option_lower for word in ["risk", "uncertain", "new"]):
            weaknesses.append("Involves higher uncertainty and implementation risk")
        if any(word in option_lower for word in ["time", "demanding", "intensive"]):
            weaknesses.append("May require significant time commitment")
        if any(word in option_lower for word in ["cost", "investment", "expensive"]):
            weaknesses.append("Could involve substantial financial investment")
        
        # Ensure at least 1 weakness
        if not weaknesses:
            generic_weaknesses = [
                "May involve some trade-offs with other priorities",
                "Implementation could present unexpected challenges",
                "Success depends on external factors beyond direct control"
            ]
            weaknesses.append(random.choice(generic_weaknesses))
        
        return weaknesses[:3]  # Limit to top 3 weaknesses
    
    def _generate_risks(self, option: str, context: str) -> List[str]:
        """Generate realistic risks"""
        risks = []
        option_lower = option.lower()
        context_lower = context.lower()
        
        # Common risks for most options
        base_risks = [
            "Unexpected implementation challenges",
            "Timeline delays or scope creep",
            "Resource constraints impacting execution"
        ]
        risks.extend(random.sample(base_risks, 1))
        
        # Option-specific risks
        if any(word in option_lower for word in ["new", "change", "switch"]):
            risks.append("Learning curve and adaptation period required")
        if any(word in option_lower for word in ["investment", "cost", "spend"]):
            risks.append("Financial outlay with uncertain return on investment")
        if any(word in context_lower for word in ["career", "job", "professional"]):
            risks.append("Impact on long-term career trajectory")
        if any(word in context_lower for word in ["personal", "relationship", "family"]):
            risks.append("Potential impact on personal relationships")
        
        return risks[:3]
    
    def _generate_opportunities(self, option: str, context: str) -> List[str]:
        """Generate realistic opportunities"""
        opportunities = []
        option_lower = option.lower()
        context_lower = context.lower()
        
        # Common opportunities
        base_opportunities = [
            "Potential for unexpected positive outcomes",
            "Opportunity to develop new skills and capabilities",
            "Chance to build valuable relationships and networks"
        ]
        opportunities.extend(random.sample(base_opportunities, 1))
        
        # Option-specific opportunities
        if any(word in option_lower for word in ["learn", "study", "course"]):
            opportunities.append("Acquisition of valuable knowledge and credentials")
        if any(word in option_lower for word in ["lead", "manage", "direct"]):
            opportunities.append("Development of leadership and strategic thinking skills")
        if any(word in context_lower for word in ["career", "professional"]):
            opportunities.append("Enhanced marketability and career options")
        
        return opportunities[:2]
    
    def _generate_comprehensive_narrative(self, decision: DecisionInput, scores: List[Dict], 
                                        recommended: str, option_details: Dict) -> tuple[str, str, str]:
        """Generate comprehensive narrative analysis"""
        
        top_score = scores[0]["overall_score"]
        second_score = scores[1]["overall_score"] if len(scores) > 1 else top_score
        score_gap = top_score - second_score
        
        # Determine narrative tone
        if score_gap > 25:
            confidence_level = "strongly"
            emphasis = "clear and compelling choice"
        elif score_gap > 15:
            confidence_level = "moderately"
            emphasis = "distinct advantage"
        elif score_gap > 5:
            confidence_level = "slightly"
            emphasis = "marginal edge"
        else:
            confidence_level = "minimally"
            emphasis = "very close call"
        
        # Generate comprehensive summary
        top_strengths = option_details[recommended]["strengths"][:2]
        summary = (f"After thorough analysis, **{recommended}** emerges as the recommended choice with an overall score of {top_score}/100. "
                  f"This option {confidence_level} demonstrates {emphasis} based on your stated priorities. "
                  f"Key strengths include {top_strengths[0].lower()} and {top_strengths[1].lower()}. ")
        
        if score_gap <= 10:
            summary += "Given the close scores, personal intuition and secondary factors should play a significant role in your final decision."
        
        # Generate detailed reasoning
        reasoning_parts = []
        
        # Top option analysis
        top_details = option_details[recommended]
        reasoning_parts.append(f"**{recommended} Analysis:**")
        reasoning_parts.append(f"- **Overall Score:** {top_score}/100")
        
        # Priority performance
        high_priority = max(top_details["priority_scores"].items(), key=lambda x: x[1])
        reasoning_parts.append(f"- **Strongest Alignment:** {high_priority[0]} (score: {high_priority[1]}/100)")
        
        # Strengths emphasis
        if top_details["strengths"]:
            reasoning_parts.append(f"- **Key Advantages:** {', '.join(top_details['strengths'][:2])}")
        
        # Risk considerations
        if top_details["risks"]:
            reasoning_parts.append(f"- **Considerations:** {top_details['risks'][0]}")
        
        # Comparative analysis
        if len(scores) > 1:
            runner_up = scores[1]["option"]
            runner_up_details = option_details[runner_up]
            gap_analysis = f"The {score_gap}-point advantage of {recommended} over {runner_up} primarily comes from "
            
            # Find where recommended option outperforms
            better_priorities = []
            for priority in decision.priorities:
                if (top_details["priority_scores"][priority.name] > 
                    runner_up_details["priority_scores"][priority.name] + 10):
                    better_priorities.append(priority.name)
            
            if better_priorities:
                gap_analysis += f"superior performance in {', '.join(better_priorities[:2])}."
            else:
                gap_analysis += "more balanced performance across all priorities."
            
            reasoning_parts.append(f"**Comparative Insight:** {gap_analysis}")
        
        reasoning = "\n".join(reasoning_parts)
        
        # Generate comparative analysis
        comparative = self._generate_comparative_analysis(scores, option_details, decision.priorities)
        
        return summary, reasoning, comparative
    
    def _generate_comparative_analysis(self, scores: List[Dict], option_details: Dict, priorities: List[Priority]) -> str:
        """Generate detailed comparative analysis"""
        if len(scores) < 2:
            return "Single option analysis: focus on implementation planning."
        
        top_option = scores[0]["option"]
        second_option = scores[1]["option"]
        
        comparisons = []
        
        # Compare top two options across priorities
        for priority in priorities[:3]:  # Compare top 3 priorities
            top_score = option_details[top_option]["priority_scores"][priority.name]
            second_score = option_details[second_option]["priority_scores"][priority.name]
            
            if top_score > second_score + 5:
                comparisons.append(f"{top_option} outperforms {second_option} in {priority.name} ({top_score} vs {second_score})")
            elif second_score > top_score + 5:
                comparisons.append(f"{second_option} has an advantage in {priority.name} ({second_score} vs {top_score})")
        
        # Add strategic considerations
        if comparisons:
            base_text = "Key differentiators between the top options: " + "; ".join(comparisons[:3])
        else:
            base_text = "The top options are closely matched across most priorities."
        
        # Add trade-off analysis
        if len(scores) >= 2:
            trade_offs = []
            top_weakness = option_details[top_option]["weaknesses"][0] if option_details[top_option]["weaknesses"] else "some implementation challenges"
            second_strength = option_details[second_option]["strengths"][0] if option_details[second_option]["strengths"] else "certain advantages"
            
            trade_offs.append(f"Choosing {top_option} means accepting {top_weakness.lower()}, while {second_option} offers {second_strength.lower()}.")
            
            base_text += " " + " ".join(trade_offs)
        
        return base_text
    
    def _generate_key_insights(self, decision: DecisionInput, scores: List[Dict], recommended: str) -> List[str]:
        """Generate key strategic insights"""
        insights = []
        
        # Context-specific insights
        context_lower = decision.context.lower()
        
        if any(word in context_lower for word in ["career", "job", "professional"]):
            insights.extend([
                "Consider the long-term career capital each option builds, not just immediate benefits.",
                "Network effects and mentor access can be as valuable as formal responsibilities.",
                "The optimal choice often balances challenge (growth) with demonstrated competence (success probability)."
            ])
        elif any(word in context_lower for word in ["personal", "life", "relationship"]):
            insights.extend([
                "Personal fulfillment often comes from alignment with core values, not just logical optimization.",
                "Consider the impact on important relationships and support systems.",
                "Growth frequently happens outside comfort zones, but wellbeing requires sustainable challenge levels."
            ])
        else:
            insights.extend([
                "The best decisions often consider both quantitative factors (scores) and qualitative fit (values, intuition).",
                "Implementation planning is as important as the decision itself - consider next steps carefully.",
                "Periodic review of your decision allows for course correction as new information emerges."
            ])
        
        # Score-based insights
        score_gap = scores[0]["overall_score"] - (scores[1]["overall_score"] if len(scores) > 1 else 0)
        if score_gap < 10:
            insights.append("With closely-ranked options, secondary factors and personal intuition should guide your final choice.")
        
        return insights[:3]
    
    def _generate_next_steps(self, recommended: str, context: str) -> List[str]:
        """Generate actionable next steps"""
        steps = [
            f"Develop a concrete implementation plan for {recommended}",
            "Identify potential obstacles and mitigation strategies",
            "Set clear success metrics and timeline for review"
        ]
        
        # Context-specific steps
        if any(word in context.lower() for word in ["career", "job"]):
            steps.append("Schedule informational interviews with people who have taken similar paths")
        if any(word in context.lower() for word in ["learning", "education"]):
            steps.append("Research specific programs, costs, and time commitments")
        
        return steps[:3]
    
    def _calculate_confidence(self, scores: List[float]) -> float:
        """Calculate confidence based on score differentiation"""
        if len(scores) < 2:
            return 70.0
        
        max_score = max(scores)
        min_score = min(scores)
        score_range = max_score - min_score
        
        # More differentiation = higher confidence
        base_confidence = 55 + (score_range / 100) * 35
        
        # Add some random variation for realism
        confidence = base_confidence + random.uniform(-3, 7)
        return round(max(40, min(92, confidence)), 1)