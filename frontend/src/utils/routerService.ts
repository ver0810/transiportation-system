export const plainRoute = (
  _map: AMap.Map,
  startPoint: string,
  endPoint: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const driving = new (AMap as any).Driving({
      policy: 10, // 路径规划策略
      multipleRoutes: true,
      output: JSON,
    });

    const points = [
      { keyword: startPoint, city: "深圳" }, // 起点
      { keyword: endPoint, city: "深圳" }, // 终点
    ];

    driving.search(points, (status: string, result: any) => {
      if (status === "complete") {
        resolve(result);
      } else {
        console.error("高德路线规划失败", status);
        reject(result);
      }
    });
  });
};

// 绘制多条路径
export const drawRoutes = (map: AMap.Map, routes: any) => {
  // 更丰富的颜色方案
  const colors = ["#3366FF", "#33CC99", "#FF6666"];
  const glowColors = ["rgba(51, 102, 255, 0.3)", "rgba(51, 204, 153, 0.3)", "rgba(255, 102, 102, 0.3)"];
  
  map.clearMap();
  const routeGroup = new AMap.OverlayGroup();
  
  routes.forEach((route: any, index: number) => {
    const color = colors[index % colors.length];
    const glowColor = glowColors[index % glowColors.length];

    route.steps.forEach((step: any) => {
      // 创建发光效果的底层线
      const glowLine = new AMap.Polyline({
        path: step.path,
        strokeColor: glowColor,
        strokeWeight: 16,
        strokeStyle: "solid",
        lineJoin: "round",
        strokeOpacity: 0.6,
        zIndex: 10 + index,
      });
      
      // 创建主路线
      const polyline = new AMap.Polyline({
        path: step.path,
        strokeColor: color,
        strokeWeight: 8,
        strokeStyle: "solid",
        lineJoin: "round", // 线条连接处样式
        showDir: true, // 显示方向箭头
        isOutline: true, // 是否显示描边
        outlineColor: "#FFFFFF", // 描边颜色
        borderWeight: 2, // 描边宽度
        zIndex: 100 + index,
      });
      
      // 添加到路线组
      routeGroup.addOverlays([glowLine, polyline]);
    });
    
    // 添加起点和终点标记
    if (index === 0 && route.steps.length > 0) {
      const firstStep = route.steps[0];
      const lastStep = route.steps[route.steps.length - 1];
      
      // 起点标记
      addAnimatedMarker(map, firstStep.path[0], 'start', routeGroup);
      
      // 终点标记
      addAnimatedMarker(map, lastStep.path[lastStep.path.length - 1], 'end', routeGroup);
    }
  });
  
  // 将路线组添加到地图
  map.add(routeGroup);
  
  // 调整地图视野以包含所有路线
  map.setFitView(undefined, false, [80, 80, 80, 80]);
};

// 添加动画标记
function addAnimatedMarker(map: AMap.Map, position: any, type: 'start' | 'end', group: any) {
  // 创建标记容器
  const container = document.createElement('div');
  container.className = `custom-marker ${type}-marker`;
  
  // 添加脉冲动画
  const pulseCircle = document.createElement('div');
  pulseCircle.className = 'pulse-circle';
  container.appendChild(pulseCircle);
  
  // 添加图标
  const icon = document.createElement('div');
  icon.className = `marker-icon ${type}-icon`;
  container.appendChild(icon);
  
  // 创建标记
  const marker = new AMap.Marker({
    position: position,
    content: container,
    anchor: 'center',
    offset: new AMap.Pixel(0, 0),
    zIndex: 200
  });
  
  // 添加到组
  group.addOverlay(marker);
  
  // 添加信息窗体
  const title = type === 'start' ? '起点' : '终点';
  addInfoWindow(map, position, title, marker);
  
  return marker;
}

// 绘制单条路径
export const drawSingleRoute = (map: AMap.Map, route: any, index: number) => {
  // 更丰富的颜色方案
  const colors = ["#3366FF", "#33CC99", "#FF6666"];
  const glowColors = ["rgba(51, 102, 255, 0.3)", "rgba(51, 204, 153, 0.3)", "rgba(255, 102, 102, 0.3)"];
  
  const color = colors[index % colors.length];
  const glowColor = glowColors[index % glowColors.length];

  map.clearMap();
  
  // 创建路线图层组
  const routeGroup = new AMap.OverlayGroup();
  
  // 检查是否有 steps 属性（高德API返回的数据）或 path 属性（我们的模拟数据）
  if (route.steps) {
    route.steps.forEach((step: any) => {
      // 创建发光效果的底层线
      const glowLine = new AMap.Polyline({
        path: step.path,
        strokeColor: glowColor,
        strokeWeight: 16,
        strokeStyle: "solid",
        lineJoin: "round",
        strokeOpacity: 0.6,
        zIndex: 10,
      });
      
      // 创建主路线
      const polyline = new AMap.Polyline({
        path: step.path,
        strokeColor: color,
        strokeWeight: 8,
        strokeStyle: "solid",
        lineJoin: "round",
        showDir: true,
        isOutline: true,
        outlineColor: "#FFFFFF",
        borderWeight: 2,
        zIndex: 100,
      });
      
      // 添加到路线组
      routeGroup.addOverlays([glowLine, polyline]);
    });
    
    // 添加起点和终点标记
    if (route.steps.length > 0) {
      const firstStep = route.steps[0];
      const lastStep = route.steps[route.steps.length - 1];
      
      // 起点标记
      addAnimatedMarker(map, firstStep.path[0], 'start', routeGroup);
      
      // 终点标记
      addAnimatedMarker(map, lastStep.path[lastStep.path.length - 1], 'end', routeGroup);
    }
  } else if (route.path) {
    // 处理我们的模拟数据格式
    // 创建发光效果的底层线
    const glowLine = new AMap.Polyline({
      path: route.path,
      strokeColor: glowColor,
      strokeWeight: 16,
      strokeStyle: "solid",
      lineJoin: "round",
      strokeOpacity: 0.6,
      zIndex: 10,
    });
    
    // 创建主路线
    const polyline = new AMap.Polyline({
      path: route.path,
      strokeColor: color,
      strokeWeight: 8,
      strokeStyle: "solid",
      lineJoin: "round",
      showDir: true,
      isOutline: true,
      outlineColor: "#FFFFFF",
      borderWeight: 2,
      zIndex: 100,
    });
    
    // 添加到路线组
    routeGroup.addOverlays([glowLine, polyline]);
    
    // 添加起点和终点标记
    if (route.path.length > 0) {
      // 起点标记
      addAnimatedMarker(map, route.path[0], 'start', routeGroup);
      
      // 终点标记
      addAnimatedMarker(map, route.path[route.path.length - 1], 'end', routeGroup);
    }
  }
  
  // 将路线组添加到地图
  map.add(routeGroup);
  
  // 调整地图视野以包含所有路线
  map.setFitView(undefined, false, [80, 80, 80, 80]);
};

// 绘制所有模拟路线（新格式）- 增强版
export const drawAllMockRoutes = (map: AMap.Map, routes: any[]) => {
  if (!map || !routes || routes.length === 0) {
    console.error("无法绘制路线：地图或路线数据不存在");
    return;
  }
  
  const colors = ["#3366FF", "#33CC99", "#FF6666"];
  const glowColors = ["rgba(51, 102, 255, 0.3)", "rgba(51, 204, 153, 0.3)", "rgba(255, 102, 102, 0.3)"];
  
  // 清除地图上已有的路线
  map.clearMap();
  
  // 创建路线图层组
  const routeGroup = new AMap.OverlayGroup();
  
  // 为每条路线创建路径
  routes.forEach((route, index) => {
    if (!route.path && !route.steps) {
      console.error("路线数据格式错误", route);
      return;
    }
    
    // 获取路径数据
    const path = route.path || (route.steps && route.steps.length > 0 ? route.steps[0].path : null);
    
    if (!path || path.length < 2) {
      console.error("路径数据不完整", path);
      return;
    }
    
    // 获取路线状态对应的样式
    const { strokeColor, strokeStyle, strokeWeight, glowColor } = getRouteStyle(route.status, colors[index], glowColors[index]);
    
    // 创建发光效果的底层线
    const glowLine = new AMap.Polyline({
      path: path,
      strokeColor: glowColor,
      strokeWeight: strokeWeight + 10,
      strokeStyle: "solid",
      lineJoin: "round",
      strokeOpacity: 0.6,
      zIndex: 10 + index,
    });
    
    // 创建主路线
    const polyline = new AMap.Polyline({
      path: path,
      strokeColor: strokeColor,
      strokeWeight: strokeWeight,
      strokeStyle: strokeStyle as "solid" | "dashed",
      lineJoin: "round",
      strokeOpacity: 0.9,
      isOutline: true,
      outlineColor: '#ffffff',
      borderWeight: 1,
      showDir: true,
      dirColor: '#ffffff',
      zIndex: 100 + index,
    });
    
    // 添加到路线组
    routeGroup.addOverlays([glowLine, polyline]);
  });
  
  // 将路线组添加到地图
  map.add(routeGroup);
  
  // 添加起点和终点标记（使用第一条路线的起点和终点）
  if (routes.length > 0) {
    const firstRoute = routes[0];
    const path = firstRoute.path || (firstRoute.steps && firstRoute.steps.length > 0 ? firstRoute.steps[0].path : null);
    
    if (path && path.length > 0) {
      addStartEndMarkers(map, path);
    }
  }
  
  // 调整地图视野以包含所有路线
  map.setFitView(undefined, false, [80, 80, 80, 80]);
};

// 创建箭头标记
export function createArrowMarker(position: any) {
  const arrowIcon = document.createElement('div');
  arrowIcon.className = 'arrow-marker';
  arrowIcon.innerHTML = '→';
  
  return new AMap.Marker({
    position: position,
    content: arrowIcon,
    anchor: 'center',
    offset: new AMap.Pixel(0, 0),
    zIndex: 300
  });
}

// 添加车辆动画
export function addCarAnimation(map: AMap.Map, path: any[]) {
  // 创建车辆标记
  const carIcon = document.createElement('div');
  carIcon.className = 'car-marker';
  carIcon.innerHTML = '🚗';
  
  const carMarker = new AMap.Marker({
    position: path[0],
    content: carIcon,
    anchor: 'center',
    offset: new AMap.Pixel(0, 0),
    zIndex: 300
  });
  
  map.add(carMarker);
  
  // 沿路径移动车辆
  let currentIndex = 0;
  const moveCarAlongPath = () => {
    if (currentIndex < path.length - 1) {
      // 计算当前点和下一点之间的角度
      const currentPos = path[currentIndex];
      const nextPos = path[currentIndex + 1];
      const angle = Math.atan2(nextPos[1] - currentPos[1], nextPos[0] - currentPos[0]) * 180 / Math.PI;
      
      // 设置车辆位置和旋转角度
      carMarker.setPosition(currentPos);
      carIcon.style.transform = `rotate(${angle}deg)`;
      
      currentIndex++;
      setTimeout(moveCarAlongPath, 100);
    } else {
      // 动画结束后移除车辆
      setTimeout(() => {
        map.remove(carMarker);
      }, 1000);
    }
  };
  
  // 启动车辆动画
  moveCarAlongPath();
}

// 根据路线状态获取样式
function getRouteStyle(status: string | undefined, defaultColor: string, defaultGlowColor: string) {
  switch (status) {
    case "畅通":
      return {
        strokeColor: '#33CC99',
        strokeStyle: "solid",
        strokeWeight: 8,
        glowColor: 'rgba(51, 204, 153, 0.3)'
      };
    case "一般拥堵":
      return {
        strokeColor: '#FF9900',
        strokeStyle: "dashed",
        strokeWeight: 8,
        glowColor: 'rgba(255, 153, 0, 0.3)'
      };
    case "拥堵":
      return {
        strokeColor: '#FF3333',
        strokeStyle: "dashed",
        strokeWeight: 8,
        glowColor: 'rgba(255, 51, 51, 0.3)'
      };
    default:
      return {
        strokeColor: defaultColor,
        strokeStyle: "solid",
        strokeWeight: 8,
        glowColor: defaultGlowColor
      };
  }
}

// 添加起点和终点标记
function addStartEndMarkers(map: AMap.Map, path: any[]) {
  // 创建起点和终点的容器
  const startContainer = document.createElement('div');
  startContainer.className = 'custom-marker start-marker';
  startContainer.innerHTML = `
    <div class="pulse-circle"></div>
    <div class="marker-icon start-icon"></div>
  `;
  
  const endContainer = document.createElement('div');
  endContainer.className = 'custom-marker end-marker';
  endContainer.innerHTML = `
    <div class="pulse-circle"></div>
    <div class="marker-icon end-icon"></div>
  `;
  
  // 创建自定义起点标记
  const startMarker = new AMap.Marker({
    position: path[0],
    content: startContainer,
    anchor: 'center',
    offset: new AMap.Pixel(0, 0),
    zIndex: 200
  });
  
  // 创建自定义终点标记
  const endMarker = new AMap.Marker({
    position: path[path.length - 1],
    content: endContainer,
    anchor: 'center',
    offset: new AMap.Pixel(0, 0),
    zIndex: 200
  });
  
  // 添加标记到地图
  map.add([startMarker, endMarker]);
  
  // 添加信息窗体
  addInfoWindow(map, path[0], '起点', startMarker);
  addInfoWindow(map, path[path.length - 1], '终点', endMarker);
}

// 添加信息窗体
function addInfoWindow(map: AMap.Map, position: any, title: string, marker: any) {
  // 确保位置数据格式正确
  let positionText = '';
  if (Array.isArray(position)) {
    positionText = position.join(', ');
  } else if (position && typeof position === 'object') {
    // 处理可能是 LngLat 对象的情况
    if (position.getLng && position.getLat) {
      positionText = `${position.getLng()}, ${position.getLat()}`;
    } else if (position.lng !== undefined && position.lat !== undefined) {
      positionText = `${position.lng}, ${position.lat}`;
    } else {
      positionText = JSON.stringify(position);
    }
  } else {
    positionText = String(position);
  }

  const info = new AMap.InfoWindow({
    content: `<div class="info-window"><h3>${title}</h3><p>坐标: ${positionText}</p></div>`,
    offset: new AMap.Pixel(0, -30),
    closeWhenClickMap: true
  });
  
  marker.on('mouseover', () => {
    info.open(map, position);
  });
  
  marker.on('mouseout', () => {
    info.close();
  });
}

// 添加地图交互效果
export function addMapInteraction(map: AMap.Map) {
  map.on('click', function(e: any) {
    void e;
  });
}

// 处理模拟数据并绘制路线
export const drawMockRoutes = (map: AMap.Map, mockRoutes: any[]) => {
  if (!map || !mockRoutes || mockRoutes.length === 0) return;
  
  const colors = ["#1890ff", "#52c41a", "#f5222d"];
  
  // 清除地图上已有的路线
  map.clearMap();
  
  // 为每条路线创建路径点
  mockRoutes.forEach((route, index) => {
    if (!route.steps || route.steps.length < 2) return;
    
    // 创建起点和终点标记
    if (index === 0) {
      // 起点标记
      const startMarker = new AMap.Marker({
        position: [route.steps[0].lng, route.steps[0].lat],
        icon: new AMap.Icon({
          size: new AMap.Size(25, 34),
          image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
          imageSize: new AMap.Size(25, 34)
        }),
        offset: new AMap.Pixel(-13, -34)
      });
      
      // 终点标记
      const endMarker = new AMap.Marker({
        position: [route.steps[route.steps.length - 1].lng, route.steps[route.steps.length - 1].lat],
        icon: new AMap.Icon({
          size: new AMap.Size(25, 34),
          image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
          imageSize: new AMap.Size(25, 34)
        }),
        offset: new AMap.Pixel(-13, -34)
      });
      
      map.add([startMarker, endMarker]);
    }
    
    // 创建路径点数组
    const path = route.steps.map((step: any) => [step.lng, step.lat]);
    
    // 创建折线
    const polyline = new AMap.Polyline({
      path: path,
      strokeColor: colors[index % colors.length],
      strokeWeight: 8,
      strokeStyle: index === 0 ? "solid" : "dashed",
      lineJoin: "round",
      strokeOpacity: 0.8,
      isOutline: true,
      showDir: true,
    });
    
    map.add(polyline);
  });
  
  // 调整地图视野以包含所有路线
  map.setFitView(undefined, false, [60, 60, 60, 60]);
};

// 绘制单条模拟路线
export const drawSingleMockRoute = (map: AMap.Map, route: any, index: number) => {
  if (!map || !route || !route.steps || route.steps.length < 2) return;
  
  const colors = ["#1890ff", "#52c41a", "#f5222d"];
  
  // 清除地图上已有的路线
  map.clearMap();
  
  // 创建起点和终点标记
  const startMarker = new AMap.Marker({
    position: [route.steps[0].lng, route.steps[0].lat],
    icon: new AMap.Icon({
      size: new AMap.Size(25, 34),
      image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
      imageSize: new AMap.Size(25, 34)
    }),
    offset: new AMap.Pixel(-13, -34)
  });
  
  const endMarker = new AMap.Marker({
    position: [route.steps[route.steps.length - 1].lng, route.steps[route.steps.length - 1].lat],
    icon: new AMap.Icon({
      size: new AMap.Size(25, 34),
      image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
      imageSize: new AMap.Size(25, 34)
    }),
    offset: new AMap.Pixel(-13, -34)
  });
  
  map.add([startMarker, endMarker]);
  
  // 创建路径点数组
  const path = route.steps.map((step: any) => [step.lng, step.lat]);
  
  // 创建折线
  const polyline = new AMap.Polyline({
    path: path,
    strokeColor: colors[index % colors.length],
    strokeWeight: 8,
    strokeStyle: "solid",
    lineJoin: "round",
    strokeOpacity: 0.8,
    isOutline: true,
    showDir: true,
  });
  
  map.add(polyline);
  
  // 调整地图视野以包含所有路线
  map.setFitView(undefined, false, [60, 60, 60, 60]);
};
