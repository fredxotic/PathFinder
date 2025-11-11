# backend/app/services/database.py
import os
import uuid
from supabase import create_client, Client
from typing import List, Optional
from app.models.decision import SavedDecision, DecisionInput, AnalysisResult
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        try:
            supabase_url = os.getenv("SUPABASE_URL")
            # Use SERVICE_ROLE_KEY for secure backend operations
            supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            
            if not supabase_url or not supabase_key:
                # CRITICAL FIX: Ensure the correct key is required
                raise ValueError("Supabase URL and Service Role Key must be set in environment variables")
            
            self.supabase: Client = create_client(supabase_url, supabase_key)
            logger.info("✅ Supabase client initialized successfully with service role")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase client: {e}")
            raise
    
    def _get_pydantic_dict(self, obj) -> dict:
        """Handle both Pydantic v1 and v2 serialization"""
        try:
            # Try Pydantic v2 first
            return obj.model_dump()
        except AttributeError:
            # Fall back to Pydantic v1
            return obj.dict()
    
    def _parse_datetime(self, dt_str: str) -> datetime:
        """Safely parse datetime string to UTC datetime object"""
        if not dt_str:
            return datetime.now(timezone.utc)
        
        # Remove timezone indicator for consistent parsing
        dt_str_clean = dt_str.replace('Z', '+00:00').replace(' ', '+')
        
        try:
            parsed_dt = datetime.fromisoformat(dt_str_clean)
            # Ensure UTC timezone
            if parsed_dt.tzinfo is None:
                parsed_dt = parsed_dt.replace(tzinfo=timezone.utc)
            return parsed_dt
        except (ValueError, AttributeError) as e:
            logger.warning(f"⚠️ Failed to parse datetime '{dt_str}', using current time: {e}")
            return datetime.now(timezone.utc)
    
    # CRITICAL COMPATIBILITY FIX: Reverting to async def
    async def ensure_user_exists(self, user_id: str) -> bool:
        """
        Ensure user exists in the profiles table using UPSERT.
        This handles race conditions and is safer than relying only on triggers.
        """
        try:
            profile_data = {
                "id": user_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            # Use upsert to handle concurrent requests safely
            response = self.supabase.table("profiles").upsert(
                profile_data, 
                on_conflict="id"
            ).execute()
            
            if hasattr(response, 'data') and response.data:
                logger.debug(f"✅ User {user_id} ensured in profiles table")
                return True
            else:
                error_msg = getattr(response, 'error', 'Unknown error during upsert')
                logger.error(f"❌ Failed to ensure user {user_id} exists: {error_msg}")
                return False
                    
        except Exception as e:
            logger.error(f"❌ Error ensuring user exists: {e}")
            return False
    
    # CRITICAL COMPATIBILITY FIX: Reverting to async def
    async def validate_user_access(self, user_id: str) -> bool:
        """Lightweight validation that user can access the database"""
        try:
            # Simple query to verify user access and connection
            self.supabase.table("profiles")\
                .select("id", count="exact")\
                .eq("id", user_id)\
                .limit(1)\
                .execute()
            
            # If we get any response, the connection works
            return True
        except Exception as e:
            logger.error(f"❌ User validation failed for {user_id}: {e}")
            return False
    
    # CRITICAL COMPATIBILITY FIX: Reverting to async def
    async def save_decision(self, user_id: str, decision_input: DecisionInput, analysis_result: AnalysisResult) -> str:
        """Save decision analysis to database with proper user validation"""
        try:
            # Validate user access first
            if not await self.validate_user_access(user_id):
                raise Exception(f"User {user_id} cannot access the database")
            
            # Ensure the user exists in profiles table
            logger.info(f"🔍 Ensuring user {user_id} exists in profiles...")
            user_exists = await self.ensure_user_exists(user_id) # Await call is now valid
            
            if not user_exists:
                raise Exception(f"User {user_id} does not exist and could not be created in profiles table")
            
            # Generate a unique decision ID
            decision_id = str(uuid.uuid4())
            current_time = datetime.now(timezone.utc).isoformat()
            
            # Use compatible Pydantic serialization
            decision_data = {
                "id": decision_id,
                "user_id": user_id,
                "title": decision_input.title,
                "context": decision_input.context,
                "options": decision_input.options,
                "priorities": [self._get_pydantic_dict(p) for p in decision_input.priorities],
                "analysis_result": self._get_pydantic_dict(analysis_result),
                "created_at": current_time,
                "updated_at": current_time
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
    
    def _parse_decision_item(self, item: dict) -> Optional[SavedDecision]:
        """Parse a raw database item into a SavedDecision object"""
        try:
            # Parse datetime fields
            item["created_at"] = self._parse_datetime(item.get("created_at"))
            item["updated_at"] = self._parse_datetime(item.get("updated_at"))
            
            # Convert to SavedDecision object
            try:
                # Try Pydantic v2 first
                return SavedDecision.model_validate(item)
            except AttributeError:
                # Fall back to Pydantic v1
                return SavedDecision(**item)
                
        except Exception as e:
            logger.warning(f"⚠️ Error parsing decision item {item.get('id', 'unknown')}: {e}")
            return None
    
    # CRITICAL COMPATIBILITY FIX: Reverting to async def
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
            if hasattr(response, 'data') and response.data:
                for item in response.data:
                    parsed_decision = self._parse_decision_item(item)
                    if parsed_decision:
                        decisions.append(parsed_decision)
            
            logger.info(f"✅ Retrieved {len(decisions)} decisions for user {user_id}")
            return decisions
            
        except Exception as e:
            logger.error(f"❌ Error getting user decisions: {e}")
            raise Exception(f"Failed to fetch decisions: {str(e)}")
    
    # CRITICAL COMPATIBILITY FIX: Reverting to async def
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
                decision = self._parse_decision_item(item)
                
                if decision:
                    logger.info(f"✅ Successfully retrieved decision {decision_id}")
                    return decision
                else:
                    logger.warning(f"⚠️ Failed to parse decision {decision_id}")
                    return None
            else:
                logger.warning(f"⚠️ Decision {decision_id} not found for user {user_id}")
                return None
            
        except Exception as e:
            logger.error(f"❌ Error getting decision {decision_id}: {e}")
            raise Exception(f"Failed to fetch decision: {str(e)}")
    
    # CRITICAL COMPATIBILITY FIX: Reverting to async def
    async def delete_decision(self, decision_id: str, user_id: str) -> bool:
        """
        Delete a decision.
        Optimized: Performs a single delete operation and checks the response for success.
        """
        try:
            logger.info(f"🗑️ Deleting decision {decision_id} for user {user_id}")
            
            # The query ensures only the owner can delete the document
            response = self.supabase.table("decisions")\
                .delete()\
                .eq("id", decision_id)\
                .eq("user_id", user_id)\
                .execute()
            
            # Check if any rows were affected (data is a list of the deleted rows)
            success = hasattr(response, 'data') and len(response.data) > 0
            
            if success:
                logger.info(f"✅ Successfully deleted decision {decision_id}")
            else:
                # If no data is returned, it means the decision wasn't found or didn't belong to the user
                logger.warning(f"⚠️ No decision found or permission denied for delete: {decision_id}")
                
            return success
            
        except Exception as e:
            logger.error(f"❌ Error deleting decision {decision_id}: {e}")
            raise Exception(f"Failed to delete decision: {str(e)}")
    
    # CRITICAL COMPATIBILITY FIX: Reverting to async def
    async def update_decision(self, decision_id: str, user_id: str, **updates) -> bool:
        """Update specific fields of a decision"""
        try:
            if not updates:
                logger.warning("No updates provided")
                return False
            
            # Add updated timestamp
            updates["updated_at"] = datetime.now(timezone.utc).isoformat()
            
            response = self.supabase.table("decisions")\
                .update(updates)\
                .eq("id", decision_id)\
                .eq("user_id", user_id)\
                .execute()
            
            success = hasattr(response, 'data') and len(response.data) > 0
            
            if success:
                logger.info(f"✅ Successfully updated decision {decision_id}")
            else:
                logger.warning(f"⚠️ Update operation failed for decision: {decision_id}")
                
            return success
            
        except Exception as e:
            logger.error(f"❌ Error updating decision {decision_id}: {e}")
            raise Exception(f"Failed to update decision: {str(e)}")