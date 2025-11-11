# backend/app/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
from dotenv import load_dotenv
import logging
from concurrent.futures import ThreadPoolExecutor

from app.models.decision import DecisionInput, AnalysisResult, SavedDecision
from app.services.database import DatabaseService
from app.auth.dependencies import get_current_user_id 

# Import AI services
try:
    from app.services.grok_service import GrokService
    GROK_SERVICE_AVAILABLE = True
except ImportError:
    GROK_SERVICE_AVAILABLE = False

from app.services.mock_ai_service import MockAIService

# Set up logging for main
logger = logging.getLogger(__name__)

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
ai_service = None
# Initialize AI service
if GROK_SERVICE_AVAILABLE and os.getenv("GROQ_API_KEY"):
    try:
        # Use an up-to-date model list
        GrokService.available_models = [
            "llama-3.1-70b-versatile",
            "llama-3.1-8b-instant", 
            "mixtral-8x7b-32768",
        ]
        ai_service = GrokService()
        logger.info("🔑 Using Grok AI API")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Grok service: {e}")
        ai_service = MockAIService()
        logger.info("🤖 Falling back to Mock AI Service")
else:
    ai_service = MockAIService()
    logger.info("🤖 Using Mock AI Service (no API key required)")


class HealthResponse(BaseModel):
    status: str
    version: str
    ai_service: str

class SaveDecisionRequest(BaseModel):
    decision_input: DecisionInput
    analysis_result: AnalysisResult
    user_id: Optional[str] = None # Keep for frontend compatibility

@app.get("/", response_model=HealthResponse)
async def health_check():
    ai_type = ai_service.__class__.__name__.replace('Service', '').lower()
    return HealthResponse(status="healthy", version="1.0.0", ai_service=ai_type)

@app.post("/analyze-decision", response_model=AnalysisResult)
async def analyze_decision(decision: DecisionInput):
    """Analyze a decision using AI service (Unauthenticated, for demo/public use)"""
    try:
        # Validate input
        if len(decision.options) < 2:
            raise HTTPException(status_code=400, detail="At least 2 options required")
        if len(decision.options) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 options allowed")

        # Perform AI analysis - this is CORRECTLY ASYNC
        analysis_result = await ai_service.analyze_decision(decision)
        return analysis_result        

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error in analyze_decision: {str(e)}")
        raise HTTPException(status_code=500, detail="Analysis failed due to an internal server error.") 

@app.post("/save-decision")
async def save_decision(
    request: SaveDecisionRequest,
    user_id: str = Depends(get_current_user_id) # SECURE: Get user ID from JWT
):
    """Save decision analysis to database (AUTHENTICATED)"""
    try:
        # CRITICAL PERFORMANCE FIX: db_service.save_decision is synchronous, 
        # but calling await on a synchronous function inside an async function 
        # tells FastAPI to run it in a worker thread. This is the correct pattern.
        decision_id = await db_service.save_decision(
            user_id, 
            request.decision_input, 
            request.analysis_result
        )
        return {"decision_id": decision_id, "status": "saved"}
    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error in save_decision: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save decision due to an internal server error.")

@app.get("/decisions", response_model=List[SavedDecision])
async def get_decisions(
    user_id: str = Depends(get_current_user_id) # SECURE: Get user ID from JWT
):
    """Get user's saved decisions (AUTHENTICATED)"""
    try:
        # CRITICAL PERFORMANCE FIX: Use await on synchronous db method
        decisions = await db_service.get_user_decisions(user_id)
        return decisions
    
    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error in get_decisions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch decisions due to an internal server error.")

@app.get("/decisions/{decision_id}", response_model=SavedDecision)
async def get_decision(
    decision_id: str, 
    user_id: str = Depends(get_current_user_id) # SECURE: Get user ID from JWT
):
  
    """Get specific decision by ID (AUTHENTICATED)"""
    try:
        # Validate decision_id is a valid UUID
        try:
            uuid.UUID(decision_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid decision_id format.")

        # CRITICAL PERFORMANCE FIX: Use await on synchronous db method
        decision = await db_service.get_decision(decision_id, user_id)
        if not decision:
            raise HTTPException(status_code=404, detail="Decision not found or access denied.")

        return decision
    
    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error in get_decision: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch decision due to an internal server error.")

@app.delete("/decisions/{decision_id}")
async def delete_decision(
    decision_id: str, 
    user_id: str = Depends(get_current_user_id) # SECURE: Get user ID from JWT
):

    """Delete a decision (AUTHENTICATED)"""
    try:
        # Validate decision_id is a valid UUID
        try:
            uuid.UUID(decision_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid decision_id format.")
        
        # CRITICAL PERFORMANCE FIX: Use await on synchronous db method
        success = await db_service.delete_decision(decision_id, user_id)

        if success:
            return {"status": "deleted", "decision_id": decision_id}

        else:
            raise HTTPException(status_code=404, detail="Decision not found or access denied.")

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error in delete_decision: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete decision due to an internal server error.")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    if ai_service and hasattr(ai_service, 'close'):
        await ai_service.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)