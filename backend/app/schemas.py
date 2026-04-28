from pydantic import BaseModel


class RegisterUser(BaseModel):
    username: str
    password: str


class LoginUser(BaseModel):
    username: str
    password: str


class UsernameUpdateRequest(BaseModel):
    current_username: str
    new_username: str


class PasswordUpdateRequest(BaseModel):
    username: str
    current_password: str
    new_password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
