# backend/app/services/database.py
import os
import uuid
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
            supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
            
            if not supabase_url or not supabase_key:
                raise ValueError("Supabase URL and Service Role Key must be set in environment variables")
            
            self.supabase: Client = create_client(supabase_url, supabase_key)
            logger.info("✅ Supabase client initialized successfully with service role")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase client: {e}")
            raise
    
    async def ensure_user_exists(self, user_id: str) -> bool:
        """Ensure user exists in the profiles table, create if not"""
        try:
            # Check if user exists in profiles
            response = self.supabase.table("profiles").select("id").eq("id", user_id).execute()
            
            if hasattr(response, 'data') and response.data:
                logger.info(f"✅ User {user_id} already exists in profiles")
                return True
            else:
                # Create user profile
                profile_data = {
                    "id": user_id,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                }
                
                create_response = self.supabase.table("profiles").insert(profile_data).execute()
                
                if hasattr(create_response, 'data') and create_response.data:
                    logger.info(f"✅ Created profile for user {user_id}")
                    return True
                else:
                    error_msg = getattr(create_response, 'error', 'Unknown error')
                    logger.error(f"❌ Failed to create profile for user {user_id}: {error_msg}")
                    return False
                    
        except Exception as e:
            logger.error(f"❌ Error ensuring user exists: {e}")
            return False
    
    async def save_decision(self, user_id: str, decision_input: DecisionInput, analysis_result: AnalysisResult) -> str:
        """Save decision analysis to database"""
        try:
            # First ensure the user exists
            logger.info(f"🔍 Ensuring user {user_id} exists in profiles...")
            user_exists = await self.ensure_user_exists(user_id)
            
            if not user_exists:
                # Try one more time with detailed logging
                logger.warning(f"🔄 Retrying user creation for {user_id}")
                user_exists = await self.ensure_user_exists(user_id)
                
            if not user_exists:
                raise Exception(f"User {user_id} does not exist and could not be created in profiles table")
            
            # Generate a unique decision ID
            decision_id = str(uuid.uuid4())
            
            decision_data = {
                "id": decision_id,
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
            
            response = self.supabase.table("decisions").insert(decision_data).execute()
            
            if hasattr(response, 'data') and response.data:
                returned_id = response.data[0]["id"]
                logger.info(f"✅ Decision saved successfully with ID: {returned_id}")
                return returned_id
            else:
                error_msg = f"No data returned from insert: {getattr(response, 'error', 'Unknown error')}"
                logger.error(f"❌ {error_msg}")
                raise Exception(error_msg)
            
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