"""
Backend authentication/authorization dependencies.

Existing endpoints issue a JWT via `token(u)` in main.py containing
{"sub": <user id>, "role": <role>, "exp": ...}. Nothing previously
verified this token on the way back in. This module adds that missing
piece as FastAPI dependencies, without touching how tokens are issued.

Usage in main.py:
    from .auth import get_current_user, get_current_user_optional, require_admin

    @app.get("/api/users/me")
    def me(user: User = Depends(get_current_user)):
        ...

    @app.get("/api/admin/dashboard")
    def admin_dashboard(admin: User = Depends(require_admin)):
        ...
"""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .config import settings
from .db import get_db
from .models import User

# auto_error=False so we can return a clean 401 with our own message,
# and so get_current_user_optional can fall back to "not logged in"
# instead of raising when no Authorization header is sent at all.
bearer_scheme = HTTPBearer(auto_error=False)


def _decode(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except JWTError:
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Require a valid Bearer token. Raises 401 if missing/invalid/expired,
    or if the user no longer exists / has been deactivated."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = _decode(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        user = db.get(User, int(user_id))
    except (TypeError, ValueError):
        user = None

    if user is None or not user.status:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    return user


def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    """Like get_current_user, but returns None instead of raising when
    there's no/invalid token. Use for endpoints that behave differently
    for logged-in vs anonymous callers (e.g. admin-only extra fields on
    an otherwise-public endpoint) without splitting the endpoint in two."""
    if credentials is None:
        return None
    payload = _decode(credentials.credentials)
    if payload is None:
        return None
    user_id = payload.get("sub")
    if user_id is None:
        return None
    try:
        user = db.get(User, int(user_id))
    except (TypeError, ValueError):
        return None
    if user is None or not user.status:
        return None
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    """Require a valid token AND role == 'admin'. Raises 403 otherwise.
    This is the server-side check that was previously missing everywhere;
    the Angular adminGuard only ever checked localStorage, which a user
    could edit in devtools."""
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
