from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from app.models.decision import DecisionInput, AnalysisResult, SavedDecision
from app.services.database import DatabaseService

# Import both real and mock AI services
try:
    from app.services.ai_service import AIService
    AI_SERVICE_AVAILABLE = True
    print("✅ Using real OpenAI AI service")
except ImportError:
    AI_SERVICE_AVAILABLE = False
    print("❌ Real AI service not available")

from app.services.mock_ai_service import MockAIService

# Load environment variables
load_dotenv()

app = FastAPI(
    title="PathFinder API",
    description="AI-powered decision analysis engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://pathfinder.vercel.app", 
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
db_service = DatabaseService()

# Use mock AI service by default, or real service if available and configured
if AI_SERVICE_AVAILABLE and os.getenv("OPENAI_API_KEY") and os.getenv("OPENAI_API_KEY") != "your_openai_api_key_here":
    ai_service = AIService()
    print("🔑 Using real OpenAI API")
else:
    ai_service = MockAIService()
    print("🤖 Using mock AI service (no API key required)")

class HealthResponse(BaseModel):
    status: str
    version: str
    ai_service: str

class SaveDecisionRequest(BaseModel):
    decision_input: DecisionInput
    analysis_result: AnalysisResult
    user_id: str

@app.get("/", response_model=HealthResponse)
async def health_check():
    ai_type = "openai" if isinstance(ai_service, AIService) else "mock"
    return HealthResponse(status="healthy", version="1.0.0", ai_service=ai_type)

@app.post("/analyze-decision", response_model=AnalysisResult)
async def analyze_decision(decision: DecisionInput):
    """Analyze a decision using AI or mock service"""
    try:
        # Validate input
        if len(decision.options) < 2:
            raise HTTPException(status_code=400, detail="At least 2 options required")
        
        if len(decision.options) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 options allowed")
        
        # Perform AI analysis
        analysis_data = await ai_service.analyze_decision(decision)
        
        # Convert to response model
        result = AnalysisResult(**analysis_data)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_decision: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/save-decision")
async def save_decision(request: SaveDecisionRequest):
    """Save decision analysis to database"""
    try:
        decision_id = await db_service.save_decision(
            request.user_id, 
            request.decision_input, 
            request.analysis_result
        )
        
        return {"decision_id": decision_id, "status": "saved"}
        
    except Exception as e:
        print(f"Error in save_decision: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save decision: {str(e)}")

@app.get("/decisions", response_model=List[SavedDecision])
async def get_decisions(user_id: str):
    """Get user's saved decisions"""
    try:
        decisions = await db_service.get_user_decisions(user_id)
        return decisions
    except Exception as e:
        print(f"Error in get_decisions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch decisions: {str(e)}")

@app.get("/decisions/{decision_id}", response_model=SavedDecision)
async def get_decision(decision_id: str, user_id: str):
    """Get specific decision by ID"""
    try:
        decision = await db_service.get_decision(decision_id, user_id)
        if not decision:
            raise HTTPException(status_code=404, detail="Decision not found")
        return decision
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_decision: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch decision: {str(e)}")

@app.delete("/decisions/{decision_id}")
async def delete_decision(decision_id: str, user_id: str):
    """Delete a decision"""
    try:
        success = await db_service.delete_decision(decision_id, user_id)
        if success:
            return {"status": "deleted", "decision_id": decision_id}
        else:
            raise HTTPException(status_code=404, detail="Decision not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in delete_decision: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete decision: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)