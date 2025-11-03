import os
from supabase import create_client, Client
from typing import List, Optional
from app.models.decision import SavedDecision, DecisionInput, AnalysisResult
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        try:
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_KEY")
            
            if not supabase_url or not supabase_key:
                raise ValueError("Supabase URL and Key must be set in environment variables")
            
            # Initialize with the older client syntax
            self.supabase: Client = create_client(supabase_url, supabase_key)
            
            # Test connection
            result = self.supabase.table("decisions").select("id").limit(1).execute()
            logger.info("✅ Supabase client initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase client: {e}")
            raise
    
    async def save_decision(self, user_id: str, decision_input: DecisionInput, analysis_result: AnalysisResult) -> str:
        """Save decision analysis to database"""
        try:
            decision_data = {
                "user_id": user_id,
                "title": decision_input.title,
                "context": decision_input.context,
                "options": decision_input.options,
                "priorities": [p.dict() for p in decision_input.priorities],
                "analysis_result": analysis_result.dict(),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            logger.info(f"📝 Saving decision for user {user_id}: {decision_input.title}")
            
            # Use the older execute() method
            response = self.supabase.table("decisions").insert(decision_data).execute()
            
            if hasattr(response, 'data') and response.data:
                decision_id = response.data[0]["id"]
                logger.info(f"✅ Decision saved successfully with ID: {decision_id}")
                return decision_id
            else:
                raise Exception("No data returned from insert operation")
            
        except Exception as e:
            logger.error(f"❌ Error saving decision: {e}")
            raise Exception(f"Failed to save decision: {str(e)}")
    
    async def get_user_decisions(self, user_id: str) -> List[SavedDecision]:
        """Get all decisions for a user"""
        try:
            logger.info(f"📋 Fetching decisions for user: {user_id}")
            
            response = self.supabase.table("decisions")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .execute()
            
            decisions = []
            if hasattr(response, 'data'):
                for item in response.data:
                    try:
                        # Convert string dates back to datetime objects
                        item["created_at"] = datetime.fromisoformat(item["created_at"].replace('Z', '+00:00'))
                        item["updated_at"] = datetime.fromisoformat(item["updated_at"].replace('Z', '+00:00'))
                        
                        # Convert JSON fields to proper objects
                        decision = SavedDecision(**item)
                        decisions.append(decision)
                        
                    except Exception as e:
                        logger.warning(f"⚠️ Error parsing decision item: {e}")
                        continue
            
            logger.info(f"✅ Retrieved {len(decisions)} decisions for user {user_id}")
            return decisions
            
        except Exception as e:
            logger.error(f"❌ Error getting user decisions: {e}")
            raise Exception(f"Failed to fetch decisions: {str(e)}")
    
    async def get_decision(self, decision_id: str, user_id: str) -> Optional[SavedDecision]:
        """Get specific decision by ID"""
        try:
            logger.info(f"🔍 Fetching decision {decision_id} for user {user_id}")
            
            response = self.supabase.table("decisions")\
                .select("*")\
                .eq("id", decision_id)\
                .eq("user_id", user_id)\
                .execute()
            
            if hasattr(response, 'data') and response.data:
                item = response.data[0]
                item["created_at"] = datetime.fromisoformat(item["created_at"].replace('Z', '+00:00'))
                item["updated_at"] = datetime.fromisoformat(item["updated_at"].replace('Z', '+00:00'))
                
                decision = SavedDecision(**item)
                logger.info(f"✅ Successfully retrieved decision {decision_id}")
                return decision
            else:
                logger.warning(f"⚠️ Decision {decision_id} not found for user {user_id}")
                return None
            
        except Exception as e:
            logger.error(f"❌ Error getting decision {decision_id}: {e}")
            raise Exception(f"Failed to fetch decision: {str(e)}")
    
    async def delete_decision(self, decision_id: str, user_id: str) -> bool:
        """Delete a decision"""
        try:
            logger.info(f"🗑️ Deleting decision {decision_id} for user {user_id}")
            
            response = self.supabase.table("decisions")\
                .delete()\
                .eq("id", decision_id)\
                .eq("user_id", user_id)\
                .execute()
            
            success = hasattr(response, 'data') and len(response.data) > 0
            
            if success:
                logger.info(f"✅ Successfully deleted decision {decision_id}")
            else:
                logger.warning(f"⚠️ No decision found to delete: {decision_id}")
                
            return success
            
        except Exception as e:
            logger.error(f"❌ Error deleting decision {decision_id}: {e}")
            raise Exception(f"Failed to delete decision: {str(e)}")