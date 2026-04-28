import "../styles/index.css";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button.tsx";
import SearchComponent from "../components/custom/search.tsx";
import HistoryComponent from "@/components/custom/History.tsx";
import UserAvatar from "../components/custom/layout/UserAvatar.tsx";
import MapComponent from "../components/custom/map/MapComponent.tsx";
import OptimizedResult from "../components/custom/OptimizedResult.tsx";

export interface RouteSearchInfo {
  start: string;
  end: string;
}

// 定义路线数据接口
interface RouteData {
  distance: number;
  time: string;
  status?: string;
  trafficLights?: number;
  [key: string]: any;
}

// 模拟路线数据
const mockRouteData = {
  routes: [
    {
      distance: 12500,
      time: "1800",
      status: "畅通",
      trafficLights: 5,
      path: [
        [114.057939, 22.543527],
        [114.059784, 22.542315],
        [114.062702, 22.540982],
        [114.065449, 22.538761]
      ]
    },
    {
      distance: 15800,
      time: "2100",
      status: "一般拥堵",
      trafficLights: 8,
      path: [
        [114.057939, 22.543527],
        [114.056566, 22.540982],
        [114.059784, 22.538761],
        [114.065449, 22.538761]
      ]
    },
    {
      distance: 18200,
      time: "2700",
      status: "拥堵",
      trafficLights: 12,
      path: [
        [114.057939, 22.543527],
        [114.053648, 22.542315],
        [114.051502, 22.538761],
        [114.059784, 22.536540],
        [114.065449, 22.538761]
      ]
    }
  ]
};

const Dashboard = () => {
  const location = useLocation();
  const [map, setMap] = useState<AMap.Map | null>(null);
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [routeInfo, setRouteInfo] = useState<RouteSearchInfo>({
    start: "深圳站",
    end: "南方科技大学",
  });
  const [searchHistory, setSearchHistory] = useState<Array<RouteSearchInfo>>([
    { start: "深圳市中心医院", end: "华强北" },
    { start: "福田中心区", end: "深圳湾" },
    { start: "南山科技园", end: "深圳北站" },
  ]);

  // 接收规划的道路数据
  const [routesData, setRoutesData] = useState<RouteData[] | null>(null);

  // 接收请求返回的规划数据     
  // 是否显示路线优化面板
  const [showOptimizePanel, setShowOptimizePanel] = useState(false);
  
  // 当前活动页面
  const [activePage, setActivePage] = useState("route");
  
  // 用于跟踪是否已加载模拟数据
  const mockDataLoadedRef = useRef(false);
  // 用于跟踪是否已触发事件
  const eventTriggeredRef = useRef(false);

  // 组件加载时设置当前活动页面
  useEffect(() => {
    if (location.pathname.includes("dashboard2")) {
      setActivePage("traffic");
    } else {
      setActivePage("route");
    }
  }, [location]);
  
  // 组件加载时加载模拟数据 - 只在地图首次加载时执行一次
  useEffect(() => {
    if (map && !mockDataLoadedRef.current && !routesData) {
      mockDataLoadedRef.current = true;
      
      // 设置模拟数据
      setRoutesData(mockRouteData.routes);
      
      // 延迟触发事件，确保地图组件已准备好
      setTimeout(() => {
        if (!eventTriggeredRef.current) {
          eventTriggeredRef.current = true;
          const event = new CustomEvent('routeDataUpdated', { detail: mockRouteData });
          window.dispatchEvent(event);
        }
      }, 1000);
    }
  }, []);

  // 添加历史搜索
  const addHistory = useCallback((start: string, end: string) => {
    const isDuplicate = searchHistory.some(
      (record) => record.start === start && record.end === end
    );

    if (!isDuplicate) {
      setSearchHistory((preHistory) => {
        const newHistory = [{ start, end }, ...preHistory];
        return newHistory.slice(0, 5);
      });
    }
  }, [searchHistory]);

  // 处理搜索
  const handleOnSearch = useCallback((start: string, end: string) => {
    setStartPoint(start);
    setEndPoint(end);
    setRouteInfo({ start, end });
    addHistory(start, end);
  }, [addHistory]);

  const handleGetRouterData = useCallback((routeData: any) => {
    if (!routeData || !routeData.routes) {
      console.error("路线数据格式错误", routeData);
      return;
    }
    setRoutesData(routeData.routes);
  }, []);

  // 切换路线优化面板
  const toggleOptimizePanel = useCallback(() => {
    setShowOptimizePanel((prev) => !prev);
  }, []);
  
  // 处理路线优化按钮点击
  const handleRouteOptimizeClick = useCallback(() => {
    setActivePage('route');
    toggleOptimizePanel();
  }, [toggleOptimizePanel]);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* 地图作为背景 */}
      <div className="absolute inset-0 z-0">
        <MapComponent
          startPoint={startPoint}
          endPoint={endPoint}
          getRoutePlainData={handleGetRouterData}
          map={map}
          setMap={setMap}
        />
      </div>

      {/* UI层，浮在地图上方 */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="flex w-full h-full">
          {/* 左侧栏 */}
          <div className="w-[350px] max-w-[90vw] bg-gradient-to-r from-black/80 to-transparent p-4 flex flex-col pointer-events-auto backdrop-blur-sm">
            <div className="flex w-full mb-4">
              <Button 
                className={`rounded-none w-32 ${activePage === 'route' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-transparent hover:bg-blue-600/20'}`}
                onClick={handleRouteOptimizeClick}
              >
                路线优化
              </Button>

              <Link to={"/dashboard2"}>
                <Button className={`rounded-none w-32 ${activePage === 'traffic' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-transparent hover:bg-blue-600/20'}`}>
                  交通流量分析
                </Button>
              </Link>
            </div>

            <div className="mb-4">
              <h1 className="font-bold text-2xl text-white">路线优化推荐</h1>
              <p className="text-xs text-white">
                Analysis of Shenzhen transiportation
              </p>
            </div>

            {/* 搜索推荐路径 */}
            <SearchComponent onSearch={handleOnSearch} />

            {/* 当前站点信息 - 简化版 */}
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-5 bg-blue-500"></div>
                <span className="text-lg font-medium">当前道路信息</span>
              </div>

              <div className="flex items-center space-x-2 backdrop-blur-sm p-3 bg-white/5 rounded-md mt-2 flex-wrap">
                <div className="rounded bg-blue-500 w-4 h-4 flex-shrink-0"></div>
                <p className="font-medium truncate max-w-[40%]">{routeInfo.start}</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
                <p className="font-medium truncate max-w-[40%]">{routeInfo.end}</p>
              </div>

              <div className="mt-4 bg-white/5 p-3 rounded-md">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h2 className="text-[15px] font-bold">总计路程</h2>
                    <p className="text-xl font-bold text-blue-500">
                      {routesData && routesData.length > 0 ? (routesData[0].distance / 1000).toFixed(2) : "0"} KM
                    </p>
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold">预计时间</h2>
                    <p className="text-xl font-bold text-green-500">
                      {routesData && routesData.length > 0 ? (parseFloat(routesData[0].time) / 60).toFixed(1) : "0"} 分钟
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 搜索历史 */}
            <div className="mt-auto w-full">
              <HistoryComponent historyData={searchHistory} />
            </div>
          </div>

          {/* 中间区域 - 只作为空间 */}
          <div className="flex-grow"></div>

          {/* 右侧栏 */}
          <div className="w-[300px] max-w-[90vw] bg-gradient-to-l from-black/80 to-transparent flex flex-col items-end p-4 pointer-events-auto backdrop-blur-sm">
            {/* 用户头像与菜单 */}
            <div className="mb-6 self-end">
              <UserAvatar />
            </div>

            {/* 优化结果 */}
            <div className="w-full mt-4">
              <OptimizedResult routesData={routesData} map={map} />
            </div>

            {/* 道路状况说明 */}
            <div className="mt-auto w-full bg-white/5 p-3 rounded-md mb-4">
              <h2 className="text-[15px] font-bold mb-2">道路状况说明</h2>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>拥堵</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>畅通</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>一般拥堵</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 路线优化面板 - 条件渲染 */}
      {showOptimizePanel && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-black/80 backdrop-blur-md p-6 rounded-lg w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto pointer-events-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-black/50 p-2 backdrop-blur-md z-10">
            <h2 className="text-xl font-bold text-white">路线优化详情</h2>
            <Button variant="ghost" onClick={toggleOptimizePanel} className="text-white">
              关闭
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/10 p-3 rounded">
              <h3 className="font-medium mb-1">起点</h3>
              <p>{routeInfo.start}</p>
            </div>
            <div className="bg-white/10 p-3 rounded">
              <h3 className="font-medium mb-1">终点</h3>
              <p>{routeInfo.end}</p>
            </div>
          </div>
          
          <div className="bg-white/10 p-4 rounded mb-4">
            <h3 className="font-medium mb-2">优化建议</h3>
            <p className="text-sm mb-2">根据当前交通状况，我们建议您选择以下路线：</p>
            <ul className="space-y-2">
              {routesData && routesData.length > 0 ? (
                routesData.slice(0, 2).map((route: RouteData, index: number) => (
                  <li key={index} className="flex justify-between bg-white/5 p-2 rounded">
                    <span>推荐路线 {index + 1}</span>
                    <div className="flex space-x-4">
                      <span>{(route.distance / 1000).toFixed(2)} KM</span>
                      <span>{(parseFloat(route.time) / 60).toFixed(1)} 分钟</span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">暂无路线数据</li>
              )}
            </ul>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-3 rounded">
              <h3 className="font-medium mb-1">交通状况</h3>
              <p className="text-green-500">整体畅通</p>
            </div>
            <div className="bg-white/10 p-3 rounded">
              <h3 className="font-medium mb-1">最佳出行时间</h3>
              <p>当前</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
