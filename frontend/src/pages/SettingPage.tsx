import { useState, useEffect, useRef } from "react";
import userService from "../services/userService";
import { getErrorMessage } from "../utils/errorHandler";
import { useAuth } from "@/context/AuthContext";

const SettingPage = () => {
  const { updateUserInfo } = useAuth();
  // 表单状态管理
  const [currentUsername, setCurrentUsername] = useState(''); // 存储当前用户名
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  // 动画状态
  const [loaded, setLoaded] = useState(false);
  const particlesRef = useRef<HTMLCanvasElement>(null);
  
  // 处理表单提交
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setStatusMessage('用户名不能为空');
      setUsernameStatus('error');
      return;
    }
    
    try {
      setUsernameStatus('loading');
      // 调用API更新用户名，参数名修改为与后端一致
      await userService.updateUsername(username.trim());
      
      // 更新本地存储的用户名
      localStorage.setItem('username', username.trim());
      setCurrentUsername(username.trim());
      updateUserInfo({ username: username.trim() });
      
      // 处理成功响应
      setUsernameStatus('success');
      setStatusMessage('用户名更新成功');
      setUsername(''); // 清空输入框
      
      // 重置状态
      setTimeout(() => {
        setUsernameStatus('idle');
        setStatusMessage('');
      }, 3000);
    } catch (error) {
      // 处理错误
      setUsernameStatus('error');
      setStatusMessage(getErrorMessage(error));
      
      // 3秒后重置错误状态
      setTimeout(() => {
        setUsernameStatus('idle');
        setStatusMessage('');
      }, 5000);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!currentPassword || !newPassword || !confirmPassword) {
      setStatusMessage('所有密码字段都需要填写');
      setPasswordStatus('error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setStatusMessage('新密码和确认密码不匹配');
      setPasswordStatus('error');
      return;
    }
    
    if (newPassword.length < 6) {
      setStatusMessage('新密码长度至少为6位');
      setPasswordStatus('error');
      return;
    }
    
    try {
      setPasswordStatus('loading');

      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        // 调用API更新密码，添加用户名参数
        await userService.updatePassword(storedUsername, currentPassword, newPassword);
      } else {
        throw new Error('未找到用户名信息，请重新登录');
      }
      
      // 处理成功响应
      setPasswordStatus('success');
      setStatusMessage('密码修改成功');
      
      // 清空表单
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // 重置状态
      setTimeout(() => {
        setPasswordStatus('idle');
        setStatusMessage('');
      }, 3000);
    } catch (error) {
      // 处理错误
      setPasswordStatus('error');
      setStatusMessage(getErrorMessage(error));
      
      // 5秒后重置错误状态
      setTimeout(() => {
        setPasswordStatus('idle');
        setStatusMessage('');
      }, 5000);
    }
  };
  
  // 初始化和控制粒子动效
  useEffect(() => {
    setCurrentUsername(localStorage.getItem('username') || '');

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
    const particleCount = 150;
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
      
      constructor() {
        this.x = Math.random() * canvasEl.width;
        this.y = Math.random() * canvasEl.height;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = 'rgba(59, 130, 246, 0.3)';
        this.size = Math.random() * 2 + 0.5;
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
      {/* 背景粒子 */}
      <canvas
        ref={particlesRef}
        className="absolute inset-0 z-0"
      />
      
      {/* 暗色遮罩 */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      
      {/* 主内容 */}
      <div className={`flex flex-col items-center justify-center min-h-screen relative z-10 transition-all duration-1000 ${loaded ? 'opacity-100' : 'opacity-0 translate-y-10'} px-4`}>
        {/* 标志性圆环 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 z-0">
          <div className="w-[500px] h-[500px] border-[10px] border-blue-500/20 rounded-full animate-pulse"></div>
          <div className="w-[350px] h-[350px] border-[8px] border-blue-400/15 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="text-center mb-12 relative">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-300 font-bold text-5xl mb-6 tracking-tight">
            账户设置
          </h1>
          
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60"></div>
        </div>
        
        {/* 设置卡片容器 */}
        <div className="max-w-2xl w-full mx-auto grid grid-cols-1 gap-8">
          {/* 修改用户名 */}
          <div className="relative">
            <div className="p-8 rounded-xl bg-gray-800/30 backdrop-blur-md border border-gray-700/50 transition-all duration-300 hover:bg-gray-800/40 hover:border-blue-900/50">
              {/* 装饰元素 */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl opacity-20">
                <div className="w-40 h-40 bg-blue-500/20 rounded-full absolute -top-20 -left-20 blur-xl"></div>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-6 relative z-10 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 mr-3"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2H5z"/></svg>
                修改用户名
              </h3>
              
              {currentUsername && (
                <p className="text-gray-400 mb-4 relative z-10">
                  当前用户名: <span className="text-blue-300">{currentUsername}</span>
                </p>
              )}
              
              <form onSubmit={handleUsernameSubmit} className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm text-gray-400">
                    新用户名
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                    placeholder="输入新的用户名"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={usernameStatus === 'loading'}
                    className={`relative w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 overflow-hidden ${usernameStatus === 'loading' ? 'opacity-80' : ''}`}
                  >
                    <span className={`flex items-center justify-center transition-all duration-300 ${usernameStatus === 'loading' ? 'opacity-0' : 'opacity-100'}`}>
                      保存修改
                    </span>
                    
                    {/* 加载动画 */}
                    {usernameStatus === 'loading' && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* 修改密码 */}
          <div className="relative">
            <div className="p-8 rounded-xl bg-gray-800/30 backdrop-blur-md border border-gray-700/50 transition-all duration-300 hover:bg-gray-800/40 hover:border-blue-900/50">
              {/* 装饰元素 */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl opacity-20">
                <div className="w-40 h-40 bg-blue-500/20 rounded-full absolute -bottom-20 -right-20 blur-xl"></div>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-6 relative z-10 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 mr-3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                修改密码
              </h3>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="block text-sm text-gray-400">
                    当前密码
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                    placeholder="输入当前密码"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm text-gray-400">
                    新密码
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                    placeholder="设置新密码"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm text-gray-400">
                    确认新密码
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                    placeholder="再次输入新密码"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordStatus === 'loading'}
                    className={`relative w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 overflow-hidden ${passwordStatus === 'loading' ? 'opacity-80' : ''}`}
                  >
                    <span className={`flex items-center justify-center transition-all duration-300 ${passwordStatus === 'loading' ? 'opacity-0' : 'opacity-100'}`}>
                      更新密码
                    </span>
                    
                    {/* 加载动画 */}
                    {passwordStatus === 'loading' && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* 状态消息显示 */}
          {statusMessage && (
            <div className={`flex items-center justify-center p-3 rounded-lg backdrop-blur-sm transition-all duration-300 ${
              usernameStatus === 'error' || passwordStatus === 'error' 
                ? 'bg-red-500/20 border border-red-500/30 text-red-200'
                : 'bg-green-500/20 border border-green-500/30 text-green-200'
            }`}>
              {usernameStatus === 'error' || passwordStatus === 'error' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              )}
              <span>{statusMessage}</span>
            </div>
          )}
          
          {/* 返回按钮 */}
          <div className="flex justify-center mt-4">
            <a href="/" className="inline-flex items-center text-gray-400 hover:text-blue-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              返回主页
            </a>
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

export default SettingPage;
