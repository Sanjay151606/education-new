import uuid
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app import models

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not credentials or not credentials.credentials:
        raise credentials_exception

    token = credentials.credentials
    jwt_secret = settings.effective_jwt_secret

    try:
        # If a secret is provided, verify signature.
        if jwt_secret:
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=[settings.jwt_algorithm],
                options={"verify_aud": False},
            )
        else:
            # Fallback for unconfigured dev environment (claims parsing without signature check)
            payload = jwt.get_unverified_claims(token)

        user_id_str: Optional[str] = payload.get("sub")
        if not user_id_str:
            raise credentials_exception
        user_uuid = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    # Find or upsert user row keyed by Supabase Auth user UUID
    user = db.query(models.User).filter(models.User.id == user_uuid).first()
    if user is None:
        email = payload.get("email") or f"{user_id_str}@auth.supabase.local"
        user_metadata = payload.get("user_metadata") or payload.get("raw_user_meta_data") or {}
        full_name = (
            user_metadata.get("full_name")
            or user_metadata.get("name")
            or (email.split("@")[0] if email else "Learner")
        )

        user = models.User(
            id=user_uuid,
            email=email,
            full_name=full_name,
            focus_span_minutes=20,
            preferred_content_style="visual",
            difficulty_level="adaptive",
            reminders_enabled=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
