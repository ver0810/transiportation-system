from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.traffic_runtime import traffic_runtime


router = APIRouter()


async def _handle_websocket_channel(websocket: WebSocket, channel: str) -> None:
    await traffic_runtime.manager.connect(websocket, channel)
    try:
        initial_payload = traffic_runtime.get_channel_payload(channel)
        await websocket.send_json(initial_payload)
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        traffic_runtime.manager.disconnect(websocket, channel)


@router.websocket("/ws/road_flow")
async def websocket_road_flow(websocket: WebSocket):
    await _handle_websocket_channel(websocket, "road_flow")


@router.websocket("/ws/traffic_events")
async def websocket_traffic_events(websocket: WebSocket):
    await _handle_websocket_channel(websocket, "traffic_events")


@router.websocket("/ws/district_data")
async def websocket_district_data(websocket: WebSocket):
    await _handle_websocket_channel(websocket, "district_data")


@router.websocket("/ws/statistics")
async def websocket_statistics(websocket: WebSocket):
    await _handle_websocket_channel(websocket, "statistics")


@router.websocket("/ws/trend_data")
async def websocket_trend_data(websocket: WebSocket):
    await _handle_websocket_channel(websocket, "trend_data")


@router.websocket("/ws/prediction_data")
async def websocket_prediction_data(websocket: WebSocket):
    await _handle_websocket_channel(websocket, "prediction_data")


@router.websocket("/ws/hotspots_data")
async def websocket_hotspots_data(websocket: WebSocket):
    await _handle_websocket_channel(websocket, "hotspots_data")


@router.websocket("/ws/all_data")
async def websocket_all_data(websocket: WebSocket):
    await _handle_websocket_channel(websocket, "all_data")
