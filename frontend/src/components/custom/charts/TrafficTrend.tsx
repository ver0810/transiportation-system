import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { trendDataSocket } from "@/services/websocket";

// 默认数据 - 24小时交通流量趋势
const generateDefaultData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  return hours.map(hour => {
    // 模拟交通流量模式：早晚高峰
    let baseFlow = 1000;
    
    // 早高峰 (7-9点)
    if (hour >= 7 && hour <= 9) {
      baseFlow = 2500 + Math.random() * 500;
    } 
    // 晚高峰 (17-19点)
    else if (hour >= 17 && hour <= 19) {
      baseFlow = 2800 + Math.random() * 500;
    }
    // 中午时段 (12-14点)
    else if (hour >= 12 && hour <= 14) {
      baseFlow = 1800 + Math.random() * 300;
    }
    // 深夜时段 (0-5点)
    else if (hour >= 0 && hour <= 5) {
      baseFlow = 500 + Math.random() * 200;
    }
    // 其他时段
    else {
      baseFlow = 1200 + Math.random() * 300;
    }
    
    return {
      hour: `${hour}:00`,
      "主干道流量": Math.floor(baseFlow),
      "次干道流量": Math.floor(baseFlow * 0.6),
      "支路流量": Math.floor(baseFlow * 0.3)
    };
  });
};

const TrafficTrend = () => {
  const [data, setData] = useState(generateDefaultData());
  const [timeRange, setTimeRange] = useState("24h");
  const [wsConnected, setWsConnected] = useState(false);
  
  // 连接WebSocket并接收数据
  useEffect(() => {
    const handleTrendData = (data: any) => {
      if (data && data.data && data.data.trendData) {
        setData(data.data.trendData);
      }
    };

    // 连接WebSocket
    const connectWebSocket = async () => {
      try {
        await trendDataSocket.connect();
        setWsConnected(true);
        trendDataSocket.addCallback(handleTrendData);
      } catch (error) {
        console.error("WebSocket连接失败:", error);
        setWsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      trendDataSocket.removeCallback(handleTrendData);
    };
  }, []);
  
  // 根据选择的时间范围过滤数据
  const getFilteredData = () => {
    const currentHour = new Date().getHours();
    
    if (timeRange === "6h") {
      // 显示最近6小时的数据
      return data.filter(item => {
        const itemHour = parseInt(item.hour);
        return (itemHour >= currentHour - 6 && itemHour <= currentHour) || 
               (currentHour < 6 && itemHour > 18 + currentHour);
      });
    } else if (timeRange === "12h") {
      // 显示最近12小时的数据
      return data.filter(item => {
        const itemHour = parseInt(item.hour);
        return (itemHour >= currentHour - 12 && itemHour <= currentHour) || 
               (currentHour < 12 && itemHour > 12 + currentHour);
      });
    }
    
    // 默认显示24小时
    return data;
  };
  
  return (
    <div className="mt-8">
      <div className="flex items-center space-x-2">
        <div className="w-1 h-5 bg-blue-500"></div>
        <span>交通流量趋势</span>
        {wsConnected && (
          <div className="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        )}
      </div>
      
      <div className="backdrop-blur-sm p-4">
        <div className="flex justify-end space-x-1 text-xs mb-4">
          <button 
            className={`px-2 py-1 rounded ${timeRange === "6h" ? "bg-blue-500" : "bg-gray-700"}`}
            onClick={() => setTimeRange("6h")}
          >
            6小时
          </button>
          <button 
            className={`px-2 py-1 rounded ${timeRange === "12h" ? "bg-blue-500" : "bg-gray-700"}`}
            onClick={() => setTimeRange("12h")}
          >
            12小时
          </button>
          <button 
            className={`px-2 py-1 rounded ${timeRange === "24h" ? "bg-blue-500" : "bg-gray-700"}`}
            onClick={() => setTimeRange("24h")}
          >
            24小时
          </button>
        </div>
        
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={getFilteredData()}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 10, fill: 'white' }}
                tickMargin={5}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'white' }}
                tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #333' }}
                labelStyle={{ color: 'white' }}
                formatter={(value) => [`${value} 辆/小时`, null]}
              />
              <Legend wrapperStyle={{ fontSize: '10px', color: 'white' }} />
              <Line 
                type="monotone" 
                dataKey="主干道流量" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="次干道流量" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="支路流量" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TrafficTrend; 