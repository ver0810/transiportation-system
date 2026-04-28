from fastapi import APIRouter, HTTPException

from app.services.traffic_runtime import traffic_runtime


router = APIRouter()


def _safe_channel_response(channel: str):
    try:
        payload = traffic_runtime.get_channel_payload(channel)
        if channel == "all_data":
            return payload
        return payload["data"]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"获取{channel}数据失败") from exc


@router.get("/get_road_flow")
async def get_road_flow():
    return _safe_channel_response("road_flow")


@router.get("/get_traffic_events")
async def get_traffic_events():
    return _safe_channel_response("traffic_events")


@router.get("/get_district_data")
async def get_district_data():
    return _safe_channel_response("district_data")


@router.get("/get_statistics")
async def get_statistics():
    return _safe_channel_response("statistics")


@router.get("/get_trend_data")
async def get_trend_data():
    return _safe_channel_response("trend_data")


@router.get("/get_prediction_data")
async def get_prediction_data():
    return _safe_channel_response("prediction_data")


@router.get("/get_hotspots_data")
async def get_hotspots_data():
    return _safe_channel_response("hotspots_data")


@router.get("/get_all_data")
async def get_all_data():
    return _safe_channel_response("all_data")
