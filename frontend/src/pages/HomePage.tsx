import { Link } from "react-router";
import { useEffect, useState, useRef } from "react";

const HomePage = () => {
  const [loaded, setLoaded] = useState(false);
  const particlesRef = useRef<HTMLCanvasElement>(null);
  
  // 初始化和控制粒子动效
  useEffect(() => {
    // 添加加载动画效果
    setLoaded(true);
    
    const canvas = particlesRef.current;
    if (!canvas) return;
    const canvasEl = canvas;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置画布尺寸为窗口大小
    const setCanvasSize = () => {
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
    };
    
    // 监听窗口大小变化
    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();
    
    // 粒子系统
    const particleCount = 200;
    const particles: Particle[] = [];
    
    // 定义粒子类
    class Particle {
      x: number;
      y: number;
      speedX: number;
      speedY: number;
      size: number;
      color: string;
      life: number;
      maxLife: number;
      onRoad: boolean;
      
      constructor() {
        // 在道路上随机生成粒子
        this.onRoad = Math.random() > 0.3;
        
        if (this.onRoad) {
          // 道路方向随机
          const isHorizontal = Math.random() > 0.5;
          // 生成道路位置 (不规则网格模拟城市道路)
          const roadPositions = [0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9];
          
          if (isHorizontal) {
            // 水平道路
            this.x = Math.random() * canvasEl.width;
            this.y = canvasEl.height * roadPositions[Math.floor(Math.random() * roadPositions.length)];
            this.speedX = (Math.random() - 0.5) * 2;
            this.speedY = 0;
          } else {
            // 垂直道路
            this.x = canvasEl.width * roadPositions[Math.floor(Math.random() * roadPositions.length)];
            this.y = Math.random() * canvasEl.height;
            this.speedX = 0;
            this.speedY = (Math.random() - 0.5) * 2;
          }
          
          // 道路上粒子的颜色和大小
          const colors = ['rgba(59, 130, 246, 0.7)', 'rgba(96, 165, 250, 0.6)', 'rgba(147, 197, 253, 0.5)'];
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.size = Math.random() * 2 + 1;
        } else {
          // 非道路区域的散点
          this.x = Math.random() * canvasEl.width;
          this.y = Math.random() * canvasEl.height;
          this.speedX = 0;
          this.speedY = 0;
          this.color = 'rgba(59, 130, 246, 0.2)';
          this.size = Math.random() * 1 + 0.5;
        }
        
        // 粒子寿命
        this.life = 0;
        this.maxLife = Math.random() * 200 + 50;
      }
      
      update() {
        // 更新位置
        this.x += this.speedX;
        this.y += this.speedY;
        
        // 边界处理
        if (this.x < 0) this.x = canvasEl.width;
        if (this.x > canvasEl.width) this.x = 0;
        if (this.y < 0) this.y = canvasEl.height;
        if (this.y > canvasEl.height) this.y = 0;
        
        // 更新生命周期
        this.life++;
        if (this.life >= this.maxLife) {
          // 重置粒子
          particles[particles.indexOf(this)] = new Particle();
        }
      }
      
      draw() {
        if (!ctx) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
    
    // 初始化粒子
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    // 动画循环
    let animationId: number;
    const animate = () => {
      // 清除画布
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      
      // 绘制城市道路网格
      ctx.globalAlpha = 0.1;
      
      // 横向道路
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvasEl.height * (0.1 + i * 0.15));
        ctx.lineTo(canvasEl.width, canvasEl.height * (0.1 + i * 0.15));
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 1 + Math.sin(Date.now() * 0.001 + i) * 0.5;
        ctx.stroke();
      }
      
      // 纵向道路
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(canvasEl.width * (0.1 + i * 0.15), 0);
        ctx.lineTo(canvasEl.width * (0.1 + i * 0.15), canvasEl.height);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 1 + Math.sin(Date.now() * 0.001 + i + 10) * 0.5;
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1;
      
      // 更新并绘制每个粒子
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);
  
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black min-h-screen overflow-hidden relative">
      {/* 城市地图背景 */}
      <div className="absolute inset-0 z-0 opacity-20">
        <img 
          src="/city-map-bg.jpg" 
          alt="City Map Background" 
          className="w-full h-full object-cover"
          onError={(e) => {
            // 如果图片加载失败，使用备用背景
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      
      {/* 粒子动效层 */}
      <canvas
        ref={particlesRef}
        className="absolute inset-0 z-0"
      />
      
      {/* 暗色遮罩，增强文本可读性 */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      
      {/* 主内容 */}
      <div className={`flex flex-col items-center justify-center min-h-screen relative z-10 transition-all duration-1000 ${loaded ? 'opacity-100' : 'opacity-0 translate-y-10'} px-4`}>
        {/* 标志性圆环 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 z-0">
          <div className="w-[600px] h-[600px] border-[15px] border-blue-500/30 rounded-full animate-pulse"></div>
          <div className="w-[450px] h-[450px] border-[10px] border-blue-400/20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="w-[300px] h-[300px] border-[5px] border-blue-300/10 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        </div>
        
        <div className="text-center mb-12 relative">
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80"></div>
          
          <h1 className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-300 font-bold text-7xl mb-6 tracking-tight">
            深圳交通可视化系统
          </h1>
          
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-60 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60"></div>
          
          <p className="text-gray-300 max-w-xl mx-auto text-xl mt-8">
            实时监控、分析与优化城市交通流量，提供智能决策支持
          </p>
        </div>
        
        <div className="mt-12 inline-flex flex-wrap gap-6 justify-center">
          <Link to={"/sign-in"}>
            <button className="group w-44 h-16 text-lg font-medium rounded-xl overflow-hidden transition-all duration-300 relative">
              {/* 毛玻璃效果背景 */}
              <span className="absolute inset-0 bg-blue-500/30 backdrop-blur-md border border-blue-400/30 group-hover:bg-blue-600/50 transition-all duration-300"></span>
              
              {/* 按钮光晕效果 */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/30 to-blue-600/0 animate-shine"></span>
              </span>
              
              {/* 按钮内容 */}
              <span className="relative z-10 flex items-center justify-center text-white">
                <span className="mr-2">登录系统</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              </span>
            </button>
          </Link>

          <Link to={"/sign-up"}>
            <button className="group w-44 h-16 text-lg font-medium rounded-xl overflow-hidden transition-all duration-300 relative">
              {/* 毛玻璃效果背景 */}
              <span className="absolute inset-0 bg-gray-700/30 backdrop-blur-md border border-gray-500/30 group-hover:bg-gray-600/50 transition-all duration-300"></span>
              
              {/* 按钮光晕效果 */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 animate-shine"></span>
              </span>
              
              {/* 按钮内容 */}
              <span className="relative z-10 flex items-center justify-center text-white">
                <span className="mr-2">注册账号</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
              </span>
            </button>
          </Link>

          <Link to={"/loading"}>
            <button className="group w-44 h-16 text-lg font-medium rounded-xl overflow-hidden transition-all duration-300 relative">
              {/* 毛玻璃效果背景 */}
              <span className="absolute inset-0 bg-gray-800/40 backdrop-blur-md border border-gray-700/30 group-hover:bg-gray-700/50 transition-all duration-300"></span>
              
              {/* 按钮光晕效果 */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="absolute inset-0 bg-gradient-to-r from-gray-600/0 via-gray-600/20 to-gray-600/0 animate-shine"></span>
              </span>
              
              {/* 按钮内容 */}
              <span className="relative z-10 flex items-center justify-center text-gray-300">
                <span className="mr-2">访客模式</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </span>
            </button>
          </Link>
        </div>
        
        {/* 功能特点展示 */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          <div className="group relative">
            {/* 毛玻璃卡片 */}
            <div className="p-8 rounded-xl bg-gray-800/30 backdrop-blur-md border border-gray-700/50 transition-all duration-300 group-hover:bg-gray-800/40 group-hover:border-blue-900/50 h-full">
              {/* 装饰元素 */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl opacity-20">
                <div className="w-40 h-40 bg-blue-500/20 rounded-full absolute -top-20 -left-20 blur-xl"></div>
              </div>
              
              {/* 图标 */}
              <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 relative z-10 backdrop-blur-sm border border-blue-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              
              {/* 内容 */}
              <h3 className="text-xl font-semibold text-white mb-3 relative z-10">实时交通监控</h3>
              <p className="text-gray-400 text-base relative z-10">动态掌握城市交通流量变化，识别拥堵路段，实时响应交通事件</p>
            </div>
          </div>
          
          <div className="group relative">
            {/* 毛玻璃卡片 */}
            <div className="p-8 rounded-xl bg-gray-800/30 backdrop-blur-md border border-gray-700/50 transition-all duration-300 group-hover:bg-gray-800/40 group-hover:border-blue-900/50 h-full">
              {/* 装饰元素 */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl opacity-20">
                <div className="w-40 h-40 bg-blue-500/20 rounded-full absolute -top-20 -right-20 blur-xl"></div>
              </div>
              
              {/* 图标 */}
              <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 relative z-10 backdrop-blur-sm border border-blue-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              
              {/* 内容 */}
              <h3 className="text-xl font-semibold text-white mb-3 relative z-10">数据分析预测</h3>
              <p className="text-gray-400 text-base relative z-10">基于多源数据分析交通模式，预测未来拥堵情况，辅助交通调度决策</p>
            </div>
          </div>
          
          <div className="group relative">
            {/* 毛玻璃卡片 */}
            <div className="p-8 rounded-xl bg-gray-800/30 backdrop-blur-md border border-gray-700/50 transition-all duration-300 group-hover:bg-gray-800/40 group-hover:border-blue-900/50 h-full">
              {/* 装饰元素 */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl opacity-20">
                <div className="w-40 h-40 bg-blue-500/20 rounded-full absolute -bottom-20 -right-20 blur-xl"></div>
              </div>
              
              {/* 图标 */}
              <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 relative z-10 backdrop-blur-sm border border-blue-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>
              </div>
              
              {/* 内容 */}
              <h3 className="text-xl font-semibold text-white mb-3 relative z-10">智能路线规划</h3>
              <p className="text-gray-400 text-base relative z-10">根据实时交通状况，提供多种路线选择，优化出行方案，减少拥堵时间</p>
            </div>
          </div>
        </div>
        
        {/* 页脚 */}
        <footer className="mt-24 mb-6 text-gray-500 text-sm">
          <div className="flex items-center justify-center mb-2">
            <div className="w-10 h-[1px] bg-gray-700"></div>
            <div className="mx-3">© 2025 深圳交通可视化系统</div>
            <div className="w-10 h-[1px] bg-gray-700"></div>
          </div>
          <div>技术支持：城市智能交通实验室</div>
        </footer>
      </div>
    </div>
  );
};

// 添加动画关键帧
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes shine {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(100%);
    }
  }
`, styleSheet.cssRules.length);
styleSheet.insertRule(`
  .animate-shine {
    animation: shine 2s infinite;
  }
`, styleSheet.cssRules.length);

export default HomePage;
