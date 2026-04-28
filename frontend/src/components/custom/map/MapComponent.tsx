import { useEffect, useState, useRef, useCallback } from "react";
import { initMap, loadPlugin } from "@/utils/mapUtils";
import { plainRoute, drawAllMockRoutes, drawRoutes } from "@/utils/routerService";


const MapComponent = ({
  startPoint,
  endPoint,
  getRoutePlainData,
  setMap,
  map
}: {
  startPoint: string;
  endPoint: string;
  getRoutePlainData: any;
  map: AMap.Map | null;
  setMap: any
}) => {
  const mapRef = useRef<AMap.Map | null>(null);
  // 是否已加载插件
  const [pluginsLoaded, setPluginsLoaded] = useState(false);
  // 用于跟踪路线请求状态
  const [isRouteRequested, setIsRouteRequested] = useState(false);
  // 用于存储路线数据的引用
  const routeDataRef = useRef<any>(null);
  // 用于跟踪事件监听器是否已添加
  const eventListenerAddedRef = useRef(false);
  // 用于存储上一次的起点和终点
  const prevPointsRef = useRef({ start: "", end: "" });

  // 加载地图
  useEffect(() => {
    initMap("container", {
      zoom: 13,
      center: [114.057939, 22.543527],
      mapStyle: 'amap://styles/grey',
      features: ["road", 'bg', 'building', 'point'],
      viewMode: '3D',
      pitch: 40
    }).then(async (map) => {
      mapRef.current = map;
      setMap(map);
      map.clearMap();

      await loadRequiredPlugins();
      setPluginsLoaded(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, []);

  // 加载所需的高德地图插件
  const loadRequiredPlugins = async () => {
    try {
      await Promise.all([
        loadPlugin('AMap.Driving'),
        loadPlugin('AMap.MouseTool')
      ]);
      return true;
    } catch (error) {
      console.error('插件加载失败:', error);
      return false;
    }
  };

  // 处理路线数据更新事件 - 使用 useCallback 避免重复创建函数
  const handleRouteDataUpdate = useCallback((routeData: any) => {
    if (!map || !routeData || !routeData.routes) {
      console.error("无法绘制路线：地图或路线数据不存在", map, routeData);
      return;
    }

    try {
      map.clearMap();
      if (routeData.routes && routeData.routes.length > 0) {
        if (routeData.routes[0].steps) {
          drawRoutes(map, routeData.routes);
        } else if (routeData.routes[0].path) {
          drawAllMockRoutes(map, routeData.routes);
        } else {
          console.error("未知的路线数据格式", routeData);
        }
      }
    } catch (error) {
      console.error("绘制路线失败", error);
    }
  }, [map]);

  // 当路线数据更新时，在地图上绘制路线
  useEffect(() => {
    if (map && pluginsLoaded && !eventListenerAddedRef.current) {
      const handleRouteDataChange = (event: CustomEvent) => {
        const routeData = event.detail;
        routeDataRef.current = routeData;
        handleRouteDataUpdate(routeData);
      };

      window.addEventListener('routeDataUpdated', handleRouteDataChange as EventListener);
      eventListenerAddedRef.current = true;

      if (routeDataRef.current) {
        handleRouteDataUpdate(routeDataRef.current);
      }

      return () => {
        window.removeEventListener('routeDataUpdated', handleRouteDataChange as EventListener);
        eventListenerAddedRef.current = false;
      };
    }
  }, [map, pluginsLoaded, handleRouteDataUpdate]);

  // 当起点和终点变化时，请求路线规划
  useEffect(() => {
    const isValidPoints = startPoint && endPoint &&
      (startPoint !== prevPointsRef.current.start ||
        endPoint !== prevPointsRef.current.end);

    if (map && pluginsLoaded && isValidPoints && !isRouteRequested) {
      prevPointsRef.current = { start: startPoint, end: endPoint };
      setIsRouteRequested(true);
      map.clearMap();
      plainRoute(map, startPoint, endPoint)
        .then((result) => {
          routeDataRef.current = result;
          getRoutePlainData(result);
          handleRouteDataUpdate(result);
        })
        .catch((error) => {
          console.error("路线规划失败", error);
        })
        .finally(() => {
          setTimeout(() => {
            setIsRouteRequested(false);
          }, 1000);
        });
    }
  }, [map, startPoint, endPoint, pluginsLoaded, isRouteRequested, handleRouteDataUpdate, getRoutePlainData]);

  return (
    <div
      id="container"
      className="w-full h-full"
    ></div>
  );
};

export default MapComponent;
