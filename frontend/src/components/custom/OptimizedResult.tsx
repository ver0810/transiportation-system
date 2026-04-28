import { drawSingleRoute } from "@/utils/routerService";
import { useState, useEffect, useCallback, memo, useMemo } from "react";

const OptimizedResult = memo(({
  routesData,
  map,
}: {
  routesData: any;
  map: any;
}) => {
  // 添加选中状态
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);

  // 默认路线数据
  const optimizedResults = [
    {
      name: "线路一",
      state: "畅通",
      needTime: "14min",
      distance: "5.2km",
      trafficLights: 3,
    },
    {
      name: "线路二",
      state: "畅通",
      needTime: "23min",
      distance: "7.8km",
      trafficLights: 5,
    },
    {
      name: "线路三",
      state: "一般拥堵",
      needTime: "25min",
      distance: "6.5km",
      trafficLights: 7,
    },
    {
      name: "线路四",
      state: "拥堵",
      needTime: "42min",
      distance: "4.9km",
      trafficLights: 9,
    },
  ];

  // 当路线数据变化时，重置选中状态
  useEffect(() => {
    setSelectedRouteIndex(null);
  }, [routesData]);

  const getStateColor = useCallback((state: string) => {
    switch (state) {
      case "畅通":
        return "bg-green-500";
      case "一般拥堵":
        return "bg-orange-500";
      case "拥堵":
        return "bg-red-500";
      default:
        return "bg-green-500";
    }
  }, []);

  const handleRoadClick = useCallback((route: any, index: number) => {
    setSelectedRouteIndex(index);
    if (map) {
      try {
        drawSingleRoute(map, route, index);
      } catch (error) {
        console.error("绘制单条路线失败", error);
      }
    }
  }, [map]);

  // 获取路线状态
  const getRouteStatus = useCallback((route: any) => {
    if (!route) return "畅通";
    
    if (route.status) return route.status;
    
    // 根据时间和距离计算平均速度，推断拥堵状态
    const distance = route.distance / 1000; // 转换为公里
    const time = parseFloat(route.time) / 60; // 转换为分钟
    
    if (time <= 0) return "畅通";
    
    const speed = distance / (time / 60); // 计算平均速度 (km/h)
    
    if (speed >= 40) return "畅通";
    if (speed >= 20) return "一般拥堵";
    return "拥堵";
  }, []);

  // 对路线数据进行排序处理
  const sortedRoutesData = useMemo(() => {
    if (!routesData || routesData.length === 0) {
      // 对默认数据进行排序处理
      return [...optimizedResults].sort((a, b) => {
        const timeA = parseInt(a.needTime);
        const timeB = parseInt(b.needTime);
        return timeA - timeB;
      });
    }
    
    // 对真实路线数据进行排序
    return [...routesData].sort((a, b) => {
      const timeA = parseFloat(a.time) || 0;
      const timeB = parseFloat(b.time) || 0;
      return timeA - timeB;
    });
  }, [routesData]);

  return (
    <div className="mt-4 w-full">
      <div className="flex space-x-1 items-center font-bold backdrop-blur-sm">
        <div className="w-1 h-4 bg-blue-500 "></div>
        <span>优化线路排行</span>
      </div>

      <div className="mt-3 backdrop-blur-sm">
        <ul className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {!routesData || routesData.length === 0
            ? sortedRoutesData.map((road, index) => (
                <li 
                  key={index}
                  className={`p-2 rounded-md backdrop-blur-md cursor-pointer transition-all duration-300 ${
                    selectedRouteIndex === index ? "bg-blue-500/30 border border-blue-500" : "hover:bg-blue-500/20"
                  }`}
                  onClick={() => setSelectedRouteIndex(index)}
                >
                  <div className="flex items-center space-x-1 font-bold text-sm">
                    <div className={`w-2 h-2 rounded-full ${getStateColor(road.state)}`}></div>
                    <span>{road.name}</span>
                  </div>
                  <div className="flex justify-between items-center pr-2 text-[11px]">
                    <p>当前状况: {road.state}</p>
                    <p className="text-green-500">预计时间: {road.needTime}</p>
                  </div>
                  <div className="flex justify-between items-center pr-2 text-[11px] mt-1">
                    <p>距离: {road.distance}</p>
                    <p>红绿灯: {road.trafficLights}个</p>
                  </div>
                </li>
              ))
            : sortedRoutesData.map((route: any, index: number) => {
                const status = getRouteStatus(route);
                return (
                  <li
                    key={index}
                    onClick={() => handleRoadClick(route, index)}
                    className={`p-2 rounded-md backdrop-blur-md cursor-pointer transition-all duration-300 ${
                      selectedRouteIndex === index ? "bg-blue-500/30 border border-blue-500" : "hover:bg-blue-500/20"
                    }`}
                  >
                    <div className="flex items-center space-x-1 font-bold text-sm">
                      <div className={`w-2 h-2 rounded-full ${getStateColor(status)}`}></div>
                      <span>道路{index + 1}</span>
                    </div>
                    <div className="flex justify-between items-center pr-2 text-[11px]">
                      <p>当前状况: {status}</p>
                      <p className="text-green-500">
                        预计时间: {(parseFloat(route.time) / 60).toFixed(1)} Min
                      </p>
                    </div>
                    <div className="flex justify-between items-center pr-2 text-[11px] mt-1">
                      <p>距离: {(route.distance / 1000).toFixed(1)}km</p>
                      <p>红绿灯: {route.trafficLights || "未知"}</p>
                    </div>
                  </li>
                );
              })}
        </ul>
      </div>
    </div>
  );
});

OptimizedResult.displayName = "OptimizedResult";

export default OptimizedResult;
