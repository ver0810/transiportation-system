import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const LoadingPage = () => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let currentProgress = 0;
    const timer = window.setInterval(() => {
      currentProgress += 20;
      setProgress(Math.min(currentProgress, 100));

      if (currentProgress >= 100) {
        window.clearInterval(timer);
        window.setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      }
    }, 120);

    return () => {
      window.clearInterval(timer);
    };
  }, [navigate]);

  // 计算进度条的颜色渐变
  const progressBarGradient = `linear-gradient(90deg, #1d4ed8 0%, #3b82f6 ${progress/2}%, #60a5fa ${progress}%)`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* 背景网格 */}
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-20">
        {Array(144).fill(0).map((_, i) => (
          <div 
            key={i} 
            className="border border-blue-500/10"
          />
        ))}
      </div>
      
      {/* 动态线条背景 */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
            style={{
              top: `${20 + i * 15}%`,
              left: 0,
              right: 0,
              transform: `translateX(${progress - 100}%)`,
              transition: 'transform 0.5s ease-out'
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-lg">
        <div className="mb-8 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 mr-3">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
            <polyline points="17 2 12 7 7 2"></polyline>
          </svg>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">
            交通可视化系统
          </h1>
        </div>

        {/* 进度条容器 */}
        <div className="w-full h-1.5 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm mb-6">
          <div
            className="h-full rounded-full"
            style={{ 
              width: `${progress}%`,
              backgroundImage: progressBarGradient,
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
              transition: 'width 0.3s ease-out'
            }}
          />
        </div>

        {/* 加载状态文本 */}
        <div className="flex justify-between items-center text-sm text-blue-300/80 mb-10">
          <span>正在准备系统资源</span>
          <span className="font-mono">{progress}%</span>
        </div>
        
        {/* 加载详情 */}
        <div className="text-left text-xs text-gray-500 space-y-1.5 max-w-md mx-auto">
          <div className="flex justify-between">
            <span>加载地图资源</span>
            <span className={progress > 30 ? "text-green-500" : "text-gray-600"}>
              {progress > 30 ? "完成" : "进行中..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span>初始化交通数据</span>
            <span className={progress > 60 ? "text-green-500" : "text-gray-600"}>
              {progress > 60 ? "完成" : (progress > 30 ? "进行中..." : "等待中")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>配置系统参数</span>
            <span className={progress > 85 ? "text-green-500" : "text-gray-600"}>
              {progress > 85 ? "完成" : (progress > 60 ? "进行中..." : "等待中")}
            </span>
          </div>
        </div>
      </div>

      {/* 底部动态点 */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: '#3b82f6',
              opacity: 0.7,
              animation: `pulse 1.5s infinite ease-in-out ${i * 0.15}s`,
              boxShadow: '0 0 5px rgba(59, 130, 246, 0.7)'
            }}
          />
        ))}
      </div>
      
      {/* 页脚信息 */}
      <div className="absolute bottom-4 text-xs text-gray-600">
        © 2025 深圳交通可视化系统
      </div>
    </div>
  );
};

export default LoadingPage;
