import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { statisticsSocket } from "@/services/websocket";

// 默认统计数据
const defaultStats = {
  totalVehicles: 1245678,
  peakHourFlow: 78560,
  averageSpeed: 32.5,
  congestionIndex: 6.8,
  trafficEvents: 24,
  comparisonYesterday: 5.2,
  comparisonLastWeek: -3.8,
  districtData: [
    { name: "福田", value: 85, fill: "#3b82f6" },
    { name: "南山", value: 92, fill: "#10b981" },
    { name: "罗湖", value: 78, fill: "#f59e0b" },
    { name: "宝安", value: 65, fill: "#8b5cf6" },
    { name: "龙岗", value: 70, fill: "#ec4899" }
  ]
};

const TrafficSummary = () => {
  const [stats, setStats] = useState(defaultStats);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date().toLocaleTimeString());
  
  // 连接WebSocket并接收数据
  useEffect(() => {
    const handleStatisticsData = (data: any) => {
      if (data && data.data) {
        setStats(data.data);
        setLastUpdateTime(new Date().toLocaleTimeString());
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
  
  // 格式化大数字
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };
  
  return (
    <div className="mt-8">
      <div className="flex items-center space-x-2">
        <div className="w-1 h-5 bg-blue-500"></div>
        <span>交通流量统计</span>
        {wsConnected && (
          <div className="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        )}
      </div>
      
      <div className="backdrop-blur-sm p-4">
        <div className="flex justify-end mb-2">
          <div className="text-xs text-gray-400">
            {lastUpdateTime} 更新
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/5 p-2 rounded">
            <div className="text-xs text-gray-400">车辆总数</div>
            <div className="text-white font-medium">{formatNumber(stats.totalVehicles)}</div>
          </div>
          
          <div className="bg-white/5 p-2 rounded">
            <div className="text-xs text-gray-400">高峰流量</div>
            <div className="text-white font-medium">{formatNumber(stats.peakHourFlow)}/小时</div>
          </div>
          
          <div className="bg-white/5 p-2 rounded">
            <div className="text-xs text-gray-400">平均车速</div>
            <div className="text-white font-medium">{stats.averageSpeed} km/h</div>
          </div>
          
          <div className="bg-white/5 p-2 rounded">
            <div className="text-xs text-gray-400">拥堵指数</div>
            <div className="text-white font-medium">{stats.congestionIndex}</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">交通事件数量: {stats.trafficEvents}</div>
          <div className="flex items-center space-x-2 text-xs">
            <span>较昨日:</span>
            <span className={stats.comparisonYesterday >= 0 ? "text-red-400" : "text-green-400"}>
              {stats.comparisonYesterday >= 0 ? "+" : ""}{stats.comparisonYesterday}%
            </span>
            <span>较上周:</span>
            <span className={stats.comparisonLastWeek >= 0 ? "text-red-400" : "text-green-400"}>
              {stats.comparisonLastWeek >= 0 ? "+" : ""}{stats.comparisonLastWeek}%
            </span>
          </div>
        </div>
        
        <div>
          <div className="text-xs text-gray-400 mb-2">各区域交通流量指数</div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.districtData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                barSize={12}
              >
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: 'white' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  hide={true}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(value) => [`${value}`, '流量指数']}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #333' }}
                  labelStyle={{ color: 'white' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  background={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficSummary; 