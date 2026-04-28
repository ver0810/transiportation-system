from __future__ import annotations

import asyncio
import logging
import time
from typing import Any, Callable

from app.config import DISTRICT_FILE, ROAD_NETWORK_FILE
from app.websocket_manager import ChannelConnectionManager
from app.services.traffic_data import TrafficDataGenerator


logger = logging.getLogger(__name__)


class TrafficRuntimeService:
    def __init__(self) -> None:
        self.generator = TrafficDataGenerator(
            road_network_file=str(ROAD_NETWORK_FILE),
            district_file=str(DISTRICT_FILE),
        )
        self.manager = ChannelConnectionManager()
        self.update_interval = 60
        self.background_task: asyncio.Task[Any] | None = None
        self.is_updating = False
        self.channel_factories: dict[str, Callable[[], Any]] = {
            "road_flow": self.generator.generate_flow_geojson,
            "traffic_events": self.generator.generate_events_geojson,
            "district_data": self.generator.generate_district_geojson,
            "statistics": self.generator.generate_traffic_statistics,
            "trend_data": self.generator.generate_traffic_trend_data,
            "prediction_data": self.generator.generate_prediction_data,
            "hotspots_data": self.generator.generate_hotspots_data,
            "all_data": self.generator.update_all_data,
        }

    async def start_updates(self, interval_seconds: int) -> dict[str, str]:
        self.update_interval = interval_seconds
        if not self.is_updating:
            self.is_updating = True
            self.background_task = asyncio.create_task(self._periodic_data_update())
            logger.info("流量更新任务已启动，更新间隔为 %s 秒", interval_seconds)
        else:
            logger.info("更新间隔已修改为 %s 秒", interval_seconds)
        return {"message": f"流量更新任务已启动，更新间隔为 {interval_seconds} 秒"}

    async def stop_updates(self) -> dict[str, str]:
        self.is_updating = False
        logger.info("流量更新任务已停止")
        return {"message": "流量更新任务已停止"}

    async def _periodic_data_update(self) -> None:
        logger.info("开始定期更新数据，间隔：%s秒", self.update_interval)

        while self.is_updating:
            try:
                start_time = time.time()
                logger.info("正在更新交通数据...")

                all_data = self.generator.update_all_data()
                timestamp = int(time.time())

                for channel, factory in self.channel_factories.items():
                    if channel == "all_data":
                        if self.manager.active_connections[channel]:
                            await self.manager.broadcast(channel, all_data)
                        continue

                    if self.manager.active_connections[channel]:
                        await self.manager.broadcast(
                            channel,
                            {"timestamp": timestamp, "data": factory()},
                        )

                processing_time = time.time() - start_time
                sleep_time = max(0.1, self.update_interval - processing_time)
                logger.info(
                    "数据更新完成，处理时间：%.2f秒，将在%.2f秒后再次更新",
                    processing_time,
                    sleep_time,
                )
                await asyncio.sleep(sleep_time)
            except Exception as exc:
                logger.error("更新数据时出错: %s", exc)
                await asyncio.sleep(5)

    def get_channel_payload(self, channel: str) -> Any:
        factory = self.channel_factories[channel]
        if channel == "all_data":
            return factory()
        return {"timestamp": int(time.time()), "data": factory()}


traffic_runtime = TrafficRuntimeService()
