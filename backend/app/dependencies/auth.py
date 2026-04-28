from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.crud import decodeAccessToken, getUserByUsername
from app.database import getSession


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/user/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(getSession),
):
    payload = decodeAccessToken(token)
    username = payload["sub"]
    user = getUserByUsername(db, username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
