import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { statisticsSocket } from "@/services/websocket";

// 默认数据
const defaultData = [
  { name: "畅通", value: 30, color: "#4CAF50" },
  { name: "轻度拥堵", value: 40, color: "#FFC107" },
  { name: "中度拥堵", value: 20, color: "#FF9800" },
  { name: "严重拥堵", value: 10, color: "#F44336" }
];

const CongestionIndex = () => {
  const [congestionIndex, setCongestionIndex] = useState(6.8);
  const [congestionLevel, setCongestionLevel] = useState("轻度拥堵");
  const [congestionData, setCongestionData] = useState(defaultData);
  const [wsConnected, setWsConnected] = useState(false);

  // 连接WebSocket并接收数据
  useEffect(() => {
    const handleStatisticsData = (data: any) => {
      if (data && data.data && data.data.congestionIndex) {
        const newIndex = data.data.congestionIndex;
        setCongestionIndex(newIndex);

        // 根据指数确定拥堵等级
        let level = "轻度拥堵";
        if (newIndex < 6.5) level = "畅通";
        else if (newIndex < 7.0) level = "轻度拥堵";
        else if (newIndex < 7.5) level = "中度拥堵";
        else level = "严重拥堵";
        
        setCongestionLevel(level);

        // 更新图表数据
        const newData = [...defaultData];
        if (level === "畅通") {
          newData[0].value = 40 + Math.floor(Math.random() * 20);
          newData[1].value = 30 + Math.floor(Math.random() * 10);
          newData[2].value = 10 + Math.floor(Math.random() * 10);
          newData[3].value = 5 + Math.floor(Math.random() * 5);
        } else if (level === "轻度拥堵") {
          newData[0].value = 20 + Math.floor(Math.random() * 15);
          newData[1].value = 40 + Math.floor(Math.random() * 15);
          newData[2].value = 20 + Math.floor(Math.random() * 10);
          newData[3].value = 10 + Math.floor(Math.random() * 5);
        } else if (level === "中度拥堵") {
          newData[0].value = 10 + Math.floor(Math.random() * 10);
          newData[1].value = 30 + Math.floor(Math.random() * 10);
          newData[2].value = 40 + Math.floor(Math.random() * 10);
          newData[3].value = 15 + Math.floor(Math.random() * 5);
        } else {
          newData[0].value = 5 + Math.floor(Math.random() * 5);
          newData[1].value = 15 + Math.floor(Math.random() * 10);
          newData[2].value = 30 + Math.floor(Math.random() * 10);
          newData[3].value = 40 + Math.floor(Math.random() * 10);
        }
        setCongestionData(newData);
      }
    };

    // 连接WebSocket
    const connectWebSocket = async () => {
      try {
        await statisticsSocket.connect();
        setWsConnected(true);
        statisticsSocket.addCallback(handleStatisticsData);
      } catch (error) {
        console.error("WebSocket连接失败:", error);
        setWsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      statisticsSocket.removeCallback(handleStatisticsData);
    };
  }, []);

  return (
    <div className="mt-8">
      <div className="flex items-center space-x-2">
        <div className="w-1 h-5 bg-blue-500"></div>
        <span>城市交通拥堵指数</span>
        {wsConnected && (
          <div className="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        )}
      </div>

      <div className="backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-3xl font-bold text-white">{congestionIndex}</div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            congestionLevel === "畅通" ? "bg-green-500/70" :
            congestionLevel === "轻度拥堵" ? "bg-yellow-500/70" :
            congestionLevel === "中度拥堵" ? "bg-orange-500/70" :
            "bg-red-500/70"
          }`}>
            {congestionLevel}
          </div>
        </div>

        <div className="text-xs text-gray-400 mb-3">
          较昨日 {Math.random() > 0.5 ? "↑" : "↓"}{(Math.random() * 0.5).toFixed(1)}
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={congestionData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {congestionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ fontSize: '10px', color: 'white' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CongestionIndex; 