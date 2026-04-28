import { useState, useEffect } from "react";
import { hotspotsDataSocket } from "@/services/websocket";

// 默认热点区域数据
const defaultHotspots = [
  { id: 1, name: "福田中心区", congestionLevel: 8.5, trend: "up", status: "严重拥堵" },
  { id: 2, name: "南山科技园", congestionLevel: 7.8, trend: "up", status: "中度拥堵" },
  { id: 3, name: "宝安中心区", congestionLevel: 7.2, trend: "down", status: "中度拥堵" },
  { id: 4, name: "龙岗大运中心", congestionLevel: 6.9, trend: "up", status: "轻度拥堵" },
  { id: 5, name: "罗湖火车站", congestionLevel: 7.5, trend: "down", status: "中度拥堵" },
  { id: 6, name: "前海自贸区", congestionLevel: 6.5, trend: "up", status: "轻度拥堵" },
  { id: 7, name: "深圳北站", congestionLevel: 7.0, trend: "up", status: "中度拥堵" },
  { id: 8, name: "华强北", congestionLevel: 7.3, trend: "down", status: "中度拥堵" }
];

const HotspotsList = () => {
  const [hotspots, setHotspots] = useState(defaultHotspots);
  const [sortBy, setSortBy] = useState("congestion"); // 'congestion' 或 'name'
  const [wsConnected, setWsConnected] = useState(false);
  
  // 连接WebSocket并接收数据
  useEffect(() => {
    const handleHotspotsData = (data: any) => {
      if (data && data.data && data.data.hotspots) {
        setHotspots(data.data.hotspots);
      }
    };

    // 连接WebSocket
    const connectWebSocket = async () => {
      try {
        await hotspotsDataSocket.connect();
        setWsConnected(true);
        hotspotsDataSocket.addCallback(handleHotspotsData);
      } catch (error) {
        console.error("WebSocket连接失败:", error);
        setWsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      hotspotsDataSocket.removeCallback(handleHotspotsData);
    };
  }, []);
  
  // 排序热点区域
  const sortedHotspots = [...hotspots].sort((a, b) => {
    if (sortBy === "congestion") {
      return b.congestionLevel - a.congestionLevel;
    } else {
      return a.name.localeCompare(b.name, "zh-CN");
    }
  });
  
  return (
    <div className="mt-8">
      <div className="flex items-center space-x-2">
        <div className="w-1 h-5 bg-blue-500"></div>
        <span>交通拥堵热点区域</span>
        {wsConnected && (
          <div className="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        )}
      </div>
      
      <div className="backdrop-blur-sm p-4">
        <div className="flex justify-end space-x-1 text-xs mb-3">
          <button 
            className={`px-2 py-1 rounded ${sortBy === "congestion" ? "bg-blue-500" : "bg-gray-700"}`}
            onClick={() => setSortBy("congestion")}
          >
            按拥堵度
          </button>
          <button 
            className={`px-2 py-1 rounded ${sortBy === "name" ? "bg-blue-500" : "bg-gray-700"}`}
            onClick={() => setSortBy("name")}
          >
            按名称
          </button>
        </div>
        
        <div className="max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {sortedHotspots.map(spot => (
            <div 
              key={spot.id} 
              className="flex items-center justify-between p-2 mb-2 rounded bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className={`w-1.5 h-6 rounded-sm ${
                  spot.status === "严重拥堵" ? "bg-red-500" :
                  spot.status === "中度拥堵" ? "bg-orange-500" :
                  "bg-yellow-500"
                }`}></div>
                <div>
                  <div className="text-white text-sm font-medium">{spot.name}</div>
                  <div className="text-gray-400 text-xs">{spot.status}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="text-white font-medium mr-1">{spot.congestionLevel}</span>
                <span className={spot.trend === "up" ? "text-red-400" : "text-green-400"}>
                  {spot.trend === "up" ? "↑" : "↓"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotspotsList; 