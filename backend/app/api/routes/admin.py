from fastapi import APIRouter

from app.services.traffic_runtime import traffic_runtime


router = APIRouter(prefix="/admin")


@router.post("/flow_updates/start")
async def start_updates(interval_seconds: int = 10):
    return await traffic_runtime.start_updates(interval_seconds)


@router.post("/flow_updates/stop")
async def stop_updates():
    return await traffic_runtime.stop_updates()
