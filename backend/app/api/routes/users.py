from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.config import ACCESS_TOKEN_EXPIRE_MINUTES
from app.crud import createAccessToken, createUser, updatePassword, updateUsername
from app.database import getSession
from app.dependencies.auth import get_current_user
from app.schemas import LoginUser, PasswordUpdateRequest, RegisterUser, TokenResponse, UsernameUpdateRequest
from app.auth.login import authenticateUser


router = APIRouter(prefix="/user")


@router.post("/register")
def create_new_user(user: RegisterUser, db: Session = Depends(getSession)):
    result = createUser(db, user)
    return {
        "message": "User registered successfully",
        "username": result.username,
        "id": result.id,
    }


@router.post("/login", response_model=TokenResponse)
def login(login_user: LoginUser, db: Session = Depends(getSession)):
    user = authenticateUser(db, login_user.username, login_user.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = createAccessToken(
        data={"sub": user.username},
        expiresDelta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/update-username")
def update_username(
    request: UsernameUpdateRequest,
    db: Session = Depends(getSession),
    current_user=Depends(get_current_user),
):
    if request.current_username != current_user.username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify another user",
        )
    result = updateUsername(db, current_user.username, request.new_username)
    return {
        "message": "Username updated successfully",
        "username": result.username,
        "id": result.id,
    }


@router.post("/update-password")
def update_password_route(
    request: PasswordUpdateRequest,
    db: Session = Depends(getSession),
    current_user=Depends(get_current_user),
):
    if request.username != current_user.username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify another user",
        )
    result = updatePassword(
        db,
        current_user.username,
        request.current_password,
        request.new_password,
    )
    return {
        "message": "Password updated successfully",
        "username": result.username,
        "id": result.id,
    }


@router.get("/me")
def get_current_user_info(current_user=Depends(get_current_user)):
    return {
        "username": current_user.username,
        "id": current_user.id,
    }
