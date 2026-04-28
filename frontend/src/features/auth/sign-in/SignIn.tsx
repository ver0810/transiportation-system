import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Undo2Icon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  const particlesRef = useRef<HTMLCanvasElement>(null);
  
  // 将 useAuth 移到组件顶层
  const { login, error: authError, clearError } = useAuth();

  // 处理输入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // 提交登录表单
  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(formData.username, formData.password);

      if (localStorage.getItem('token')) {
        setTimeout(() => {
          navigate('/loading');
        }, 100);
      } else {
        console.error("登录成功但未找到令牌");
        setError('登录成功但未能保存认证信息，请重试');
      }
    } catch (error) {
      console.error("登录组件捕获到错误:", error);
      
      // 添加适当的错误处理和JWT相关提示
      let errorMessage = '登录失败，请检查用户名和密码';
      
      if (error instanceof Error) {
        if (error.message.includes('JWT') || error.message.includes('令牌')) {
          errorMessage = '登录请求成功，但未能正确解析JWT令牌。请联系系统管理员。';
        } else {
          errorMessage = error.message;
        }
      }
      
      if (authError) {
        errorMessage = authError;
      }
      
      setError(errorMessage);
      clearError();
    } finally {
      setIsLoading(false);
    }
  }

  // 粒子背景动画
  useEffect(() => {
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
    
    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();
    
    // 粒子系统
    const particleCount = 100;
    const particles: Particle[] = [];
    
    class Particle {
      x: number;
      y: number;
      speedX: number;
      speedY: number;
      size: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * canvasEl.width;
        this.y = Math.random() * canvasEl.height;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 1.5;
        
        // 蓝色系粒子
        const alpha = Math.random() * 0.3;
        this.color = `rgba(59, 130, 246, ${alpha})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // 边界处理
        if (this.x < 0) this.x = canvasEl.width;
        if (this.x > canvasEl.width) this.x = 0;
        if (this.y < 0) this.y = canvasEl.height;
        if (this.y > canvasEl.height) this.y = 0;
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
    
    // 连接临近粒子
    const connectParticles = () => {
      const maxDistance = 100;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            const opacity = 1 - (distance / maxDistance);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.15})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }
    
    // 动画循环
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      
      // 更新并绘制粒子
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      connectParticles();
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-950 relative overflow-hidden">
      {/* 粒子背景层 */}
      <canvas ref={particlesRef} className="absolute inset-0" />
      
      {/* 装饰圆环 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
        <div className="w-[500px] h-[500px] border-[10px] border-blue-500/20 rounded-full"></div>
        <div className="w-[300px] h-[300px] border-[5px] border-blue-400/20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      {/* 返回按钮 */}
      <div className="absolute top-4 right-4 z-10">
        <Link to={"/"}>
          <button className="group p-2 rounded-lg overflow-hidden relative transition-all duration-300">
            <span className="absolute inset-0 bg-gray-800/50 backdrop-blur-md border border-gray-700/50 group-hover:bg-gray-700/50"></span>
            <span className="relative z-10 flex items-center justify-center">
              <Undo2Icon className="text-blue-400" size={20} />
            </span>
          </button>
        </Link>
      </div>
      
      {/* 卡片内容 */}
      <div className={`relative z-10 transition-all duration-1000 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="relative w-[400px] rounded-xl overflow-hidden p-0.5 bg-gradient-to-b from-blue-500/30 via-transparent to-transparent">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white">登录系统</h1>
              <p className="text-gray-400 mt-2">输入您的账号信息以登录</p>
            </div>
            
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">用户名</Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="请输入用户名"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border border-gray-700/50 text-white focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border border-gray-700/50 text-white focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm text-center py-1 px-3 rounded-md bg-red-500/10 border border-red-800/20">
                  {error}
                </div>
              )}
              
              <button
                type="submit" 
                disabled={isLoading}
                className="group w-full h-12 text-white font-medium rounded-lg overflow-hidden transition-all duration-300 relative"
              >
                {/* 毛玻璃效果背景 */}
                <span className="absolute inset-0 bg-blue-500/60 backdrop-blur-sm border border-blue-400/30 group-hover:bg-blue-600/80 transition-all duration-300"></span>
                
                {/* 按钮光晕效果 */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/30 to-blue-600/0 animate-shine"></span>
                </span>
                
                {/* 按钮内容 */}
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? "登录中..." : "登录"}
                </span>
              </button>
              
              <div className="text-center text-sm text-gray-400 pt-2">
                还没有账号？{" "}
                <Link to="/sign-up" className="text-blue-400 hover:text-blue-300 transition-colors">
                  立即注册
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
