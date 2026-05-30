from fastapi import APIRouter, HTTPException, status, Depends, Response, Request
from datetime import datetime, timezone
import uuid

from app.auth.models import UserCreate, UserLogin, UserPublic, TokenResponse
from app.auth.utils import hash_password, verify_password, create_access_token, get_current_user
from app.database import get_db
from app.security import (
    auth_rate_limit,
    check_account_lockout,
    record_failed_login,
    reset_failed_login,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserCreate,
    response: Response,
    request: Request,
    _: None = Depends(auth_rate_limit),
) -> TokenResponse:
    db = get_db()
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        # Don't reveal whether email exists — use generic message
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    await db.users.insert_one({
        "_id": user_id,
        "email": payload.email,
        "name": payload.name,
        "hashed_password": hash_password(payload.password),
        "created_at": now,
    })

    token = create_access_token(user_id)
    response.set_cookie(
        key="access_token", value=token,
        httponly=True, samesite="none", secure=True,
        max_age=60 * 60 * 24 * 7,
    )
    return TokenResponse(
        access_token=token,
        user=UserPublic(id=user_id, email=payload.email, name=payload.name, created_at=now),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: UserLogin,
    response: Response,
    request: Request,
    _: None = Depends(auth_rate_limit),
) -> TokenResponse:
    db = get_db()

    # 1. Check per-account lockout BEFORE hitting the DB for the password
    await check_account_lockout(payload.email)

    # 2. Look up user
    user = await db.users.find_one({"email": payload.email})

    # 3. Verify password — record failure if wrong
    if not user or not verify_password(payload.password, user["hashed_password"]):
        if user:
            await record_failed_login(payload.email)
        # Same error for "user not found" and "wrong password" — prevents user enumeration
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # 4. Successful login — clear any lockout record
    await reset_failed_login(payload.email)

    token = create_access_token(user["_id"])
    response.set_cookie(
        key="access_token", value=token,
        httponly=True, samesite="none", secure=True,
        max_age=60 * 60 * 24 * 7,
    )
    return TokenResponse(
        access_token=token,
        user=UserPublic(
            id=user["_id"],
            email=user["email"],
            name=user["name"],
            created_at=user["created_at"],
        ),
    )


@router.post("/logout")
async def logout(response: Response) -> dict:
    response.delete_cookie("access_token")
    return {"message": "Logged out"}


@router.get("/me", response_model=UserPublic)
async def me(current_user: dict = Depends(get_current_user)) -> UserPublic:
    return UserPublic(
        id=current_user["_id"],
        email=current_user["email"],
        name=current_user["name"],
        created_at=current_user["created_at"],
    )
