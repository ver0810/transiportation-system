import { useEffect, useRef, useCallback, useState } from "react";
import { initMap } from "@/utils/mapUtils";
import { roadFlowSocket } from "@/services/websocket";
import geoJson from "@/assets/ShenzhenDistriction.json";

// 添加类型定义
type TrafficLevel = {
  head: string;
  trail: string;
  maxFlow: number;
  name: string;
};

type TrafficLevels = {
  smooth: TrafficLevel;
  stable: TrafficLevel;
  slightlyCongested: TrafficLevel;
  congested: TrafficLevel;
};

const TrafficFlowMap = () => {
  const mapRef = useRef<AMap.Map | null>(null);
  const locaRef = useRef<Loca.Container | null>(null);
  const layerRef = useRef<Loca.LineLayer | null>(null);

  // WebSocket连接状态
  const [wsStatus, setWsStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  
  // 定义交通流量级别颜色
  const trafficLevels: TrafficLevels = {
    smooth: {
      head: "#00FF00", // 绿色
      trail: "#33FF33",
      maxFlow: 800,
      name: "畅通"
    },
    stable: {
      head: "#FFFF00", // 黄色
      trail: "#FFFF33",
      maxFlow: 1200,
      name: "一般"
    },
    slightlyCongested: {
      head: "#FFA500", // 橙色
      trail: "#FFB533",
      maxFlow: 1600,
      name: "较拥堵"
    },
    congested: {
      head: "#FF0000", // 红色
      trail: "#FF3333",
      maxFlow: 9999,
      name: "拥堵"
    }
  };

  // 处理WebSocket数据的回调函数
  const handleWebSocketData = useCallback((data: any) => {
    updateLayerData(data);
  }, []);

  // 处理断开连接的回调函数
  const handleDisconnect = useCallback(() => {
    setWsStatus("disconnected");
  }, []);

  useEffect(() => {
    initMap("flow-map-container", {
      zoom: 13,
      center: [114.057939, 22.543527],
      mapStyle: "amap://styles/grey",
      viewMode: "3D",
      features: ["road", "bg"],
      pitch: 40,
    }).then(async (map) => {
      mapRef.current = map;
      map.clearMap();

      addPolygonLayer(map);
      
      // 初始化Loca容器
      const loca = new Loca.Container({
        map,
      });
      locaRef.current = loca;
      
      // 创建基本线图层
      initLineLayer(loca);
      
      // 连接WebSocket
      connectWebSocket();
    });

    return () => {
      // 清理WebSocket相关资源
      disconnectWebSocket();
      
      // 清理图层和地图
      if (layerRef.current) {
        layerRef.current.destroy();
      }
      
      if (locaRef.current) {
        locaRef.current.destroy();
      }

      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, []);

  // 添加Polygon图层
  const addPolygonLayer = (map: AMap.Map | null) => {
    // 遍历 GeoJSON 数据并绘制 Polygon
    geoJson.features.forEach((feature: any) => {
      if (feature.geometry.type === "MultiPolygon") {
        // 处理 MultiPolygon 的每个部分
        feature.geometry.coordinates.forEach((polygonCoords: any) => {
          const polygon = new AMap.Polygon({
            path: polygonCoords[0].map((coord: number[]) => {
              return new AMap.LngLat(coord[0], coord[1]); // 使用LngLat对象
            }),
            strokeColor: "#ffffff",
            strokeWeight: 2,
            fillColor: "#000",
            fillOpacity: 0.15,
            zIndex: 1,
          });
          //鼠标移入更改样式
          polygon.on("mouseover", () => {
            polygon.setOptions({
              fillOpacity: 0.3, //多边形填充透明度
              fillColor: "#000",
            });
          });
          //鼠标移出恢复样式
          polygon.on("mouseout", () => {
            polygon.setOptions({
              fillOpacity: 0.15,
              fillColor: "#000",
            });
          });
          if (map) map.add(polygon);
        });
      }
    });
  };
  
  // 初始化基本线图层
  const initLineLayer = (loca: Loca.Container) => {
    const layer = new Loca.LineLayer({
      zIndex: 10,
      opacity: 1,
      visible: true,
      zooms: [2, 20],
    });
    
    // 为LineLayer设置样式
    layer.setSource(new Loca.GeoJSONSource({}));
    layer.setStyle({
      altitude: 0,
      lineWidth: function() {
        return 3;
      },
      color: function(_value: unknown, feature: any) {
        if (!feature || !feature.properties) {
          return "#CCCCCC";
        }
        
        const flow = feature.properties.FLOW || 0;
        if (flow <= trafficLevels.smooth.maxFlow) {
          return trafficLevels.smooth.head;
        } else if (flow <= trafficLevels.stable.maxFlow) {
          return trafficLevels.stable.head;
        } else if (flow <= trafficLevels.slightlyCongested.maxFlow) {
          return trafficLevels.slightlyCongested.head;
        } else {
          return trafficLevels.congested.head;
        }
      }
    });
    
    loca.add(layer);
    layerRef.current = layer;
  };
  
  // 更新图层数据
  const updateLayerData = (geoJsonData: any) => {
    if (!layerRef.current || !locaRef.current) return;
    let processedData = geoJsonData.data;
    const dataSet = new Loca.GeoJSONSource({
      data: processedData
    });
    
    layerRef.current.setSource(dataSet);
    layerRef.current.render();
  };
  
  // 连接WebSocket
  const connectWebSocket = () => {
    setWsStatus("connecting");
    
    roadFlowSocket.addCallback(handleWebSocketData);
    roadFlowSocket.addDisconnectHandler(handleDisconnect);
    
    roadFlowSocket.connect()
      .then(() => {
        setWsStatus("connected");
      })
      .catch((error) => {
        setWsStatus("error");
        console.error("道路流量WebSocket连接失败:", error);
      });
  };
  
  // 断开WebSocket
  const disconnectWebSocket = () => {
    // 移除回调以避免内存泄漏
    roadFlowSocket.removeCallback(handleWebSocketData);
    roadFlowSocket.removeDisconnectHandler(handleDisconnect);
    roadFlowSocket.disconnect();
  };

  return (
    <div className="w-full h-full">
      <div id="flow-map-container" className="w-full h-full"></div>

      {/* WebSocket状态指示器 */}
      <div
        className="absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-md text-xs text-white pointer-events-auto"
        style={{
          background:
            wsStatus === "connected"
              ? "rgba(0, 128, 0, 0.7)"
              : wsStatus === "connecting"
              ? "rgba(255, 165, 0, 0.7)"
              : "rgba(255, 0, 0, 0.7)",
          zIndex: 20,
        }}
      >
        {wsStatus === "connected"
          ? "实时数据已连接"
          : wsStatus === "connecting"
          ? "正在连接..."
          : wsStatus === "error"
          ? "连接错误"
          : "未连接"}
      </div>

      {/* 添加连接状态检查与重连按钮 */}
      {wsStatus !== "connected" && (
        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-20">
          <button 
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
            onClick={connectWebSocket}
          >
            重新连接
          </button>
        </div>
      )}
    </div>
  );
};

export default TrafficFlowMap;
