from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class Priority(BaseModel):
    name: str = Field(..., description="Name of the priority")
    weight: int = Field(..., ge=1, le=10, description="Weight from 1-10")
    description: str = Field(..., description="Description of the priority")

class DecisionInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    context: str = Field(..., min_length=10, max_length=2000)
    options: List[str] = Field(..., min_items=2, max_items=5)
    priorities: List[Priority]

class OptionScore(BaseModel):
    option: str
    overall_score: float
    priority_scores: Dict[str, float]
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
    opportunities: List[str] = Field(default_factory=list)

class AnalysisResult(BaseModel):
    decision_id: Optional[str] = None
    scores: List[OptionScore]
    summary: str
    reasoning: str
    confidence: float
    recommended_option: str
    key_insights: List[str] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)
    comparative_analysis: str = ""

class SavedDecision(BaseModel):
    id: str
    user_id: str
    title: str
    context: str
    options: List[str]
    priorities: List[Priority]
    analysis_result: AnalysisResult
    created_at: datetime
    updated_at: datetime