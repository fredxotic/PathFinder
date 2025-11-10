import os
from fastapi import Header, HTTPException
from typing import Optional
import logging
from jose import jwt 
from jose.exceptions import JWTError as PyJWTError, ExpiredSignatureError, InvalidSignatureError

logger = logging.getLogger(__name__)

# Fetch the secret key from environment variables
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

# Fallback to SUPABASE_SERVICE_ROLE_KEY if the JWT secret isn't explicitly set (Development/Testing only)
if not SUPABASE_JWT_SECRET:
    SUPABASE_JWT_SECRET = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_JWT_SECRET:
    logger.error("FATAL: SUPABASE_JWT_SECRET environment variable is missing!")


async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Dependency to extract and validate JWT from Authorization header and return user_id.
    Fixes Invalid Audience error by explicitly skipping audience verification.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required (Missing Authorization header)")

    scheme, token = authorization.split() if ' ' in authorization else ('', authorization)

    if scheme.lower() != 'bearer':
        raise HTTPException(status_code=401, detail="Invalid authentication scheme. Must be 'Bearer'")
        
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(status_code=500, detail="Server misconfiguration: Auth secret missing.")

    try:
        # Note: jwt.decode here comes from the 'jose' package
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        
        # Supabase uses 'sub' (subject) for the user ID (UUID)
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload (Missing user ID)")

        return user_id
        
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except InvalidSignatureError:
        # Catch InvalidSignatureError which is necessary for HS256 validation failure
        raise HTTPException(status_code=401, detail="Invalid token signature")
    except PyJWTError as e:
        # PyJWTError (aliased from JWTError) catches general structure errors
        logger.error(f"JWT validation failed: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
    except Exception:
        raise HTTPException(status_code=401, detail="Token processing error")