import datetime
import json
import random
import time
from typing import Dict


class TrafficDataGenerator:
    def __init__(self, road_network_file: str, district_file: str):
        with open(road_network_file, "r", encoding="utf-8-sig") as f:
            self.road_network = json.load(f)

        with open(district_file, "r", encoding="utf-8-sig") as f:
            self.districts = json.load(f)

        self.traffic_events = []
        self.event_id_counter = 1
        self.event_types = ["accident", "construction", "congestion", "weather"]
        self.location_templates = {
            "福田区": ["福田中心区", "华强北", "车公庙", "福田口岸", "莲花山"],
            "南山区": ["南山中心区", "科技园", "蛇口", "前海", "大学城"],
            "罗湖区": ["罗湖口岸", "东门", "笋岗", "清水河", "黄贝岭"],
            "宝安区": ["宝安中心区", "西乡", "福永", "沙井", "松岗"],
            "龙岗区": ["龙岗中心城", "坂田", "布吉", "平湖", "横岗"],
        }
        self.road_name_templates = [
            "深南大道",
            "北环大道",
            "南坪快速",
            "滨海大道",
            "龙岗大道",
            "梅观高速",
            "广深高速",
            "机荷高速",
            "南光高速",
            "水官高速",
        ]

        self.road_flow_data = self._initialize_road_flow()
        self.district_data = self._initialize_district_data()
        self._initialize_traffic_events()

    def _initialize_road_flow(self) -> Dict[str, Dict]:
        road_flow = {}

        for feature in self.road_network["features"]:
            road_id = feature["properties"].get("id", str(random.randint(10000, 99999)))
            name = feature["properties"].get(
                "name",
                random.choice(self.road_name_templates)
                if self.road_name_templates
                else "默认道路名称",
            )
            road_level = feature["properties"].get("level", random.randint(1, 5))
            base_flow = (6 - road_level) * 400 + random.randint(-200, 200)
            base_speed = (6 - road_level) * 12 + random.randint(8, 18)
            congestion_level = self._calculate_congestion_level(base_flow, base_speed)

            road_flow[road_id] = {
                "id": road_id,
                "name": name,
                "flow": base_flow,
                "speed": base_speed,
                "congestion_level": congestion_level,
                "geometry": feature["geometry"],
            }

        return road_flow

    def _initialize_district_data(self) -> Dict[str, Dict]:
        district_data = {}

        for feature in self.districts["features"]:
            district_id = feature["properties"].get("id", str(random.randint(1000, 9999)))
            name = feature["properties"].get("name", "未知区域")
            congestion_index = round(5.0 + random.random() * 4.0, 1)
            flow_value = random.randint(60, 95)
            trend = "up" if random.random() > 0.5 else "down"

            district_data[district_id] = {
                "id": district_id,
                "name": name,
                "congestion_index": congestion_index,
                "flow_value": flow_value,
                "trend": trend,
                "geometry": feature["geometry"],
            }

        return district_data

    def _initialize_traffic_events(self):
        num_events = random.randint(5, 10)
        for _ in range(num_events):
            self._generate_random_event()

    def _calculate_congestion_level(self, flow: int, speed: float) -> int:
        if speed > 60:
            return 1
        if speed > 40:
            return 2
        if speed > 25:
            return 3
        return 4

    def _generate_random_event(self) -> Dict:
        event_type = random.choice(self.event_types)
        district = random.choice(list(self.location_templates.keys()))
        location_prefix = random.choice(self.location_templates[district])
        road = random.choice(self.road_name_templates)
        location = f"{district}{location_prefix}{road}"
        lng = 113.8 + random.random() * 0.5
        lat = 22.5 + random.random() * 0.3
        coordinates = [lng, lat]
        minutes_ago = random.randint(0, 120)
        event_time = (
            datetime.datetime.now() - datetime.timedelta(minutes=minutes_ago)
        ).strftime("%H:%M")

        if event_type == "accident":
            status = random.choice(["处理中", "已清理"]) if random.random() > 0.7 else "处理中"
            severity = random.choice(["严重", "中度", "轻微"])
            description = random.choice(
                [
                    "多车相撞，交通严重拥堵，请绕行",
                    "车辆碰撞，部分车道关闭",
                    "轻微剐蹭，通行缓慢",
                    "车辆故障，占用应急车道",
                ]
            )
        elif event_type == "construction":
            status = "进行中"
            severity = random.choice(["中度", "轻微"])
            description = random.choice(
                [
                    "道路施工，部分车道关闭，通行缓慢",
                    "路面维修，请减速慢行",
                    "架设天桥，临时封闭部分车道",
                    "管道施工，车辆绕行",
                ]
            )
        elif event_type == "congestion":
            status = random.choice(["持续中", "已缓解"]) if random.random() > 0.7 else "持续中"
            severity = random.choice(["严重", "中度", "轻微"])
            description = random.choice(
                [
                    "交通拥堵，车辆行驶缓慢",
                    "高峰期拥堵，请耐心等待",
                    "车流量大，通行缓慢",
                    "临近路口拥堵，请提前规划路线",
                ]
            )
        else:
            status = "持续中"
            severity = random.choice(["严重", "中度", "轻微"])
            description = random.choice(
                [
                    "降雨天气，道路湿滑，请谨慎驾驶",
                    "大雾天气，能见度低，请减速慢行",
                    "强风天气，高架桥限速通行",
                    "雷雨天气，部分路段积水",
                ]
            )

        event = {
            "id": self.event_id_counter,
            "type": event_type,
            "location": location,
            "coordinates": coordinates,
            "time": event_time,
            "status": status,
            "severity": severity,
            "description": description,
        }
        self.traffic_events.append(event)
        self.event_id_counter += 1
        return event

    def update_road_flow_data(self):
        current_hour = datetime.datetime.now().hour

        time_factor = 1.0
        if 7 <= current_hour <= 9:
            time_factor = 1.3
        elif 17 <= current_hour <= 19:
            time_factor = 1.5
        elif 23 <= current_hour or current_hour <= 5:
            time_factor = 0.3
        elif 10 <= current_hour <= 15:
            time_factor = 0.7

        for road_id, road_data in self.road_flow_data.items():
            flow_change = random.uniform(-0.15, 0.15)
            speed_change = random.uniform(-0.1, 0.1)
            road_level = road_data["level"] if "level" in road_data else 3
            base_flow = (6 - road_level) * 400 + random.randint(-200, 200)
            new_flow = int(base_flow * (1 + flow_change) * time_factor)
            new_flow = max(200, new_flow)
            speed_factor = 1.0 - (new_flow / 6000) * 0.4
            speed_factor = max(0.4, min(1.2, speed_factor))
            new_speed = road_data["speed"] * (1 + speed_change) * speed_factor
            new_speed = max(10, min(120, new_speed))
            new_congestion_level = self._calculate_congestion_level(new_flow, new_speed)

            self.road_flow_data[road_id]["flow"] = new_flow
            self.road_flow_data[road_id]["speed"] = round(new_speed, 1)
            self.road_flow_data[road_id]["congestion_level"] = new_congestion_level

    def update_district_data(self):
        for district_id, district in self.district_data.items():
            congestion_change = random.uniform(-0.3, 0.3)
            flow_change = random.randint(-5, 5)
            new_congestion = district["congestion_index"] + congestion_change
            new_congestion = max(5.0, min(9.0, new_congestion))
            new_flow = district["flow_value"] + flow_change
            new_flow = max(50, min(100, new_flow))
            trend = "up" if district["congestion_index"] < new_congestion else "down"

            self.district_data[district_id]["congestion_index"] = round(new_congestion, 1)
            self.district_data[district_id]["flow_value"] = new_flow
            self.district_data[district_id]["trend"] = trend

    def update_traffic_events(self):
        for event in self.traffic_events[:]:
            if random.random() > 0.8:
                if event["type"] == "accident":
                    if event["status"] == "处理中" and random.random() > 0.7:
                        event["status"] = "已清理"
                elif event["type"] == "congestion":
                    if event["status"] == "持续中" and random.random() > 0.6:
                        event["status"] = "已缓解"
                elif event["type"] == "weather" and random.random() > 0.9:
                    event["status"] = "已缓解"

            if event["status"] in {"已清理", "已缓解"} and random.random() > 0.7:
                self.traffic_events.remove(event)

        if random.random() > 0.8 and len(self.traffic_events) < 15:
            self._generate_random_event()

    def generate_flow_geojson(self) -> Dict:
        features = []
        for road_id, road_data in self.road_flow_data.items():
            features.append(
                {
                    "type": "Feature",
                    "properties": {
                        "id": road_id,
                        "name": road_data["name"],
                        "FLOW": road_data["flow"],
                        "SPEED": road_data["speed"],
                        "CONGESTION": road_data["congestion_level"],
                    },
                    "geometry": road_data["geometry"],
                }
            )
        return {"type": "FeatureCollection", "features": features}

    def generate_events_geojson(self) -> Dict:
        features = []
        for event in self.traffic_events:
            features.append(
                {
                    "type": "Feature",
                    "properties": {
                        "id": event["id"],
                        "type": event["type"],
                        "location": event["location"],
                        "time": event["time"],
                        "status": event["status"],
                        "severity": event["severity"],
                        "description": event["description"],
                    },
                    "geometry": {"type": "Point", "coordinates": event["coordinates"]},
                }
            )
        return {"type": "FeatureCollection", "features": features}

    def generate_district_geojson(self) -> Dict:
        features = []
        for district_id, district in self.district_data.items():
            features.append(
                {
                    "type": "Feature",
                    "properties": {
                        "id": district_id,
                        "name": district["name"],
                        "congestion_index": district["congestion_index"],
                        "flow_value": district["flow_value"],
                        "trend": district["trend"],
                    },
                    "geometry": district["geometry"],
                }
            )
        return {"type": "FeatureCollection", "features": features}

    def generate_traffic_statistics(self) -> Dict:
        total_vehicles = sum(road["flow"] for road in self.road_flow_data.values())
        speeds = [road["speed"] for road in self.road_flow_data.values()]
        avg_speed = sum(speeds) / len(speeds) if speeds else 0
        peak_hour_flow = max((road["flow"] for road in self.road_flow_data.values()), default=0)
        congestion_indices = [district["congestion_index"] for district in self.district_data.values()]
        avg_congestion = (
            sum(congestion_indices) / len(congestion_indices) if congestion_indices else 0
        )

        district_data = []
        for district in self.district_data.values():
            district_data.append(
                {
                    "name": district["name"],
                    "value": district["flow_value"],
                    "fill": self._get_color_for_congestion(district["congestion_index"]),
                }
            )

        comparison_yesterday = round(random.uniform(-8.0, 8.0), 1)
        comparison_last_week = round(random.uniform(-8.0, 8.0), 1)

        return {
            "totalVehicles": total_vehicles,
            "peakHourFlow": peak_hour_flow,
            "averageSpeed": round(avg_speed, 1),
            "congestionIndex": round(avg_congestion, 1),
            "trafficEvents": len(self.traffic_events),
            "comparisonYesterday": comparison_yesterday,
            "comparisonLastWeek": comparison_last_week,
            "districtData": district_data,
        }

    def generate_traffic_trend_data(self) -> Dict:
        current_hour = datetime.datetime.now().hour
        hours_data = []
        for i in range(24):
            hour = (current_hour - 23 + i) % 24
            base_flow = 1000
            if 7 <= hour <= 9:
                base_flow = 2500 + random.random() * 500
            elif 17 <= hour <= 19:
                base_flow = 2800 + random.random() * 500
            elif 12 <= hour <= 14:
                base_flow = 1800 + random.random() * 300
            elif 0 <= hour <= 5:
                base_flow = 500 + random.random() * 200
            else:
                base_flow = 1200 + random.random() * 300

            hours_data.append(
                {
                    "hour": f"{hour}:00",
                    "主干道流量": int(base_flow),
                    "次干道流量": int(base_flow * 0.6),
                    "支路流量": int(base_flow * 0.3),
                }
            )
        return {"trendData": hours_data}

    def generate_prediction_data(self) -> Dict:
        current_hour = datetime.datetime.now().hour
        prediction_data = []
        for i in range(24):
            hour = (current_hour + i) % 24
            base_flow = 60
            if 7 <= hour <= 9:
                base_flow = 85 + random.random() * 10
            elif 17 <= hour <= 19:
                base_flow = 90 + random.random() * 10
            elif 12 <= hour <= 14:
                base_flow = 70 + random.random() * 10
            elif 0 <= hour <= 5:
                base_flow = 30 + random.random() * 10
            else:
                base_flow = 50 + random.random() * 15

            random_factor = random.random() * 5
            prediction_data.append(
                {
                    "hour": f"{hour}:00",
                    "预测流量": int(base_flow + random_factor),
                    "预测拥堵指数": round((base_flow + random_factor) / 20 + 3, 1),
                }
            )

        return {"predictionData": prediction_data}

    def generate_hotspots_data(self) -> Dict:
        hotspots = []
        for district in self.district_data.values():
            num_hotspots = random.randint(1, 2)
            for _ in range(num_hotspots):
                if district["name"] in self.location_templates:
                    location_prefix = random.choice(self.location_templates[district["name"]])
                else:
                    location_prefix = "中心区"

                congestion_level = district["congestion_index"] + random.uniform(-0.5, 0.5)
                congestion_level = max(5.0, min(9.0, congestion_level))

                status = "轻度拥堵"
                if congestion_level >= 8.0:
                    status = "严重拥堵"
                elif congestion_level >= 7.0:
                    status = "中度拥堵"

                trend = "up" if random.random() > 0.5 else "down"
                hotspots.append(
                    {
                        "id": len(hotspots) + 1,
                        "name": f"{district['name']}{location_prefix}",
                        "congestionLevel": round(congestion_level, 1),
                        "trend": trend,
                        "status": status,
                    }
                )
        return {"hotspots": hotspots}

    def _get_color_for_congestion(self, congestion_index: float) -> str:
        if congestion_index >= 8.0:
            return "#F44336"
        if congestion_index >= 7.0:
            return "#FF9800"
        if congestion_index >= 6.0:
            return "#FFC107"
        return "#4CAF50"

    def update_all_data(self) -> Dict:
        self.update_road_flow_data()
        self.update_district_data()
        self.update_traffic_events()
        return {
            "timestamp": int(time.time()),
            "flowData": self.generate_flow_geojson(),
            "eventsData": self.generate_events_geojson(),
            "districtData": self.generate_district_geojson(),
            "statistics": self.generate_traffic_statistics(),
            "trendData": self.generate_traffic_trend_data(),
            "predictionData": self.generate_prediction_data(),
            "hotspotsData": self.generate_hotspots_data(),
        }
