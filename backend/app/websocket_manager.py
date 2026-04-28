from typing import Any, Dict
import logging

from fastapi import WebSocket


logger = logging.getLogger(__name__)


class ChannelConnectionManager:
    def __init__(self) -> None:
        self.active_connections: Dict[str, list[WebSocket]] = {
            "road_flow": [],
            "traffic_events": [],
            "district_data": [],
            "statistics": [],
            "trend_data": [],
            "prediction_data": [],
            "hotspots_data": [],
            "all_data": [],
        }

    async def connect(self, websocket: WebSocket, client_type: str) -> None:
        await websocket.accept()
        if client_type in self.active_connections:
            self.active_connections[client_type].append(websocket)
            logger.info(
                "%s 客户端连接成功，当前连接数: %s",
                client_type,
                len(self.active_connections[client_type]),
            )
        else:
            logger.warning("未知的客户端类型: %s", client_type)

    def disconnect(self, websocket: WebSocket, client_type: str) -> None:
        if (
            client_type in self.active_connections
            and websocket in self.active_connections[client_type]
        ):
            self.active_connections[client_type].remove(websocket)
            logger.info(
                "%s 客户端断开连接，当前连接数: %s",
                client_type,
                len(self.active_connections[client_type]),
            )

    async def broadcast(self, client_type: str, message: Dict[str, Any]) -> None:
        if client_type not in self.active_connections:
            logger.warning("未知的客户端类型: %s", client_type)
            return

        disconnected: list[WebSocket] = []
        for connection in self.active_connections[client_type]:
            try:
                await connection.send_json(message)
            except Exception as exc:
                logger.error("发送消息失败: %s", exc)
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(connection, client_type)
