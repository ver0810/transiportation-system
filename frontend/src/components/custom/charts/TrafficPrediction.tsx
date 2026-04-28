import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { predictionDataSocket } from "@/services/websocket";

// 生成未来24小时的预测数据
const generateDefaultPredictionData = () => {
  const currentHour = new Date().getHours();
  const data = [];
  
  for (let i = 0; i < 24; i++) {
    const hour = (currentHour + i) % 24;
    const hourLabel = `${hour}:00`;
    
    // 基础流量
    let baseFlow = 60;
    
    // 早高峰 (7-9点)
    if (hour >= 7 && hour <= 9) {
      baseFlow = 85 + Math.random() * 10;
    } 
    // 晚高峰 (17-19点)
    else if (hour >= 17 && hour <= 19) {
      baseFlow = 90 + Math.random() * 10;
    }
    // 中午时段 (12-14点)
    else if (hour >= 12 && hour <= 14) {
      baseFlow = 70 + Math.random() * 10;
    }
    // 深夜时段 (0-5点)
    else if (hour >= 0 && hour <= 5) {
      baseFlow = 30 + Math.random() * 10;
    }
    // 其他时段
    else {
      baseFlow = 50 + Math.random() * 15;
    }
    
    // 添加一些随机波动
    const randomFactor = Math.random() * 5;
    
    data.push({
      hour: hourLabel,
      "预测流量": Math.floor(baseFlow + randomFactor),
      "预测拥堵指数": parseFloat(((baseFlow + randomFactor) / 20 + 3).toFixed(1))
    });
  }
  
  return data;
};

const TrafficPrediction = () => {
  const [predictionData, setPredictionData] = useState(generateDefaultPredictionData());
  const [predictionHours, setPredictionHours] = useState(6);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date().toLocaleTimeString());
  
  // 连接WebSocket并接收数据
  useEffect(() => {
    const handlePredictionData = (data: any) => {
      if (data && data.data && data.data.predictionData) {
        setPredictionData(data.data.predictionData);
        setLastUpdateTime(new Date().toLocaleTimeString());
      }
    };

    // 连接WebSocket
    const connectWebSocket = async () => {
      try {
        await predictionDataSocket.connect();
        setWsConnected(true);
        predictionDataSocket.addCallback(handlePredictionData);
      } catch (error) {
        console.error("WebSocket连接失败:", error);
        setWsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      predictionDataSocket.removeCallback(handlePredictionData);
    };
  }, []);
  
  // 根据选择的预测时间范围过滤数据
  const filteredData = predictionData.slice(0, predictionHours);
  
  // 计算平均预测拥堵指数
  const averageCongestion = filteredData.reduce((sum, item) => sum + item["预测拥堵指数"], 0) / filteredData.length;
  
  // 确定预测的交通状况
  const getPredictionStatus = (avg: number) => {
    if (avg >= 8) return { text: "严重拥堵", color: "text-red-500" };
    if (avg >= 7) return { text: "中度拥堵", color: "text-orange-500" };
    if (avg >= 6) return { text: "轻度拥堵", color: "text-yellow-500" };
    return { text: "交通畅通", color: "text-green-500" };
  };
  
  const predictionStatus = getPredictionStatus(averageCongestion);
  
  return (
    <div className="mt-8">
      <div className="flex items-center space-x-2">
        <div className="w-1 h-5 bg-blue-500"></div>
        <span>交通预测</span>
        {wsConnected && (
          <div className="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        )}
      </div>
      
      <div className="backdrop-blur-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-white">
            未来<span className="font-bold text-blue-400">{predictionHours}</span>小时预测
          </div>
          
          <div className="flex space-x-1 text-xs">
            <button 
              className={`px-2 py-1 rounded ${predictionHours === 3 ? "bg-blue-500" : "bg-gray-700"}`}
              onClick={() => setPredictionHours(3)}
            >
              3小时
            </button>
            <button 
              className={`px-2 py-1 rounded ${predictionHours === 6 ? "bg-blue-500" : "bg-gray-700"}`}
              onClick={() => setPredictionHours(6)}
            >
              6小时
            </button>
            <button 
              className={`px-2 py-1 rounded ${predictionHours === 12 ? "bg-blue-500" : "bg-gray-700"}`}
              onClick={() => setPredictionHours(12)}
            >
              12小时
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-gray-400">
            平均拥堵指数: <span className="text-white">{averageCongestion.toFixed(1)}</span>
          </div>
          <div className={`text-sm font-medium ${predictionStatus.color}`}>
            {predictionStatus.text}
          </div>
        </div>
        
        <div className="text-xs text-gray-400 mb-2">
          {lastUpdateTime} 更新
        </div>
        
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 10, fill: 'white' }}
                tickMargin={5}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 10, fill: 'white' }}
                domain={[0, 100]}
                label={{ value: '流量', angle: -90, position: 'insideLeft', fill: 'white', fontSize: 10 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 10]}
                tick={{ fontSize: 10, fill: 'white' }}
                label={{ value: '拥堵指数', angle: 90, position: 'insideRight', fill: 'white', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #333' }}
                labelStyle={{ color: 'white' }}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="预测流量" 
                stroke="#3b82f6" 
                fill="rgba(59, 130, 246, 0.2)"
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="预测拥堵指数" 
                stroke="#f59e0b" 
                fill="rgba(245, 158, 11, 0.2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          * 预测基于历史数据和当前交通状况，仅供参考
        </div>
      </div>
    </div>
  );
};

export default TrafficPrediction; 