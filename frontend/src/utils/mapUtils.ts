import AMapLoader from "@amap/amap-jsapi-loader";

// 初始化地图
export const initMap = async (container: string, options: any) => {
  const securityJsCode = import.meta.env.VITE_AMAP_SECURITY_JS_CODE;
  const key = import.meta.env.VITE_AMAP_KEY;

  if (!securityJsCode || !key) {
    throw new Error("缺少高德地图配置，请设置 VITE_AMAP_KEY 和 VITE_AMAP_SECURITY_JS_CODE");
  }

  window._AMapSecurityConfig = {
    securityJsCode,
  };

  const AMap = await AMapLoader.load({
    key,
    version: "2.0",
    Loca: {
      version: "2.0.0"
    },
    plugins: ["AMap.Scale"], //需要使用的的插件列表
  });

  const map = new AMap.Map(container, options);
  return map;
};

// 插件加载模块
export const loadPlugin = (pluginName: string): Promise<void> => {
  return new Promise((resolve) => {
    AMap.plugin(pluginName, () => {
      resolve();
    });
  });
};
