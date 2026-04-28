from fastapi import APIRouter

from app.api.routes import admin, traffic, users, websocket


api_router = APIRouter()
api_router.include_router(users.router, tags=["users"])
api_router.include_router(admin.router, tags=["admin"])
api_router.include_router(traffic.router, tags=["traffic"])
api_router.include_router(websocket.router, tags=["websocket"])
