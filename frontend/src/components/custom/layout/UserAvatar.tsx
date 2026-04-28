import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";

const UserAvatar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout, user } = useAuth();

  // 点击头像切换菜单状态
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 处理点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 处理退出登录
  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.error("退出失败:", error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* 头像按钮 */}
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={toggleMenu}
      >
        <div className="relative">
          {/* 炫酷的头像容器 */}
          <div className="relative rounded-full p-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 group-hover:from-blue-400 group-hover:to-cyan-300">
            <div className="absolute inset-0 rounded-full animate-spin-slow opacity-60 bg-gradient-to-r from-blue-600 to-cyan-500 blur-sm"></div>
            <Avatar className="h-10 w-10 bg-gray-900 border-2 border-gray-800 relative">
              <AvatarImage src="/avatar.png" alt="用户头像" />
              <AvatarFallback className="bg-gray-800 text-blue-400">
                SZ
              </AvatarFallback>
            </Avatar>
          </div>

          {/* 在线状态指示器 */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
        </div>

        {/* 用户名 */}
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-gray-200">{user?.username || "未登录"}</span>
          <span className="text-xs text-gray-400">在线</span>
        </div>
        
        {/* 下拉箭头 - 根据菜单状态旋转 */}
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {/* 下拉菜单 - 使用动画和毛玻璃效果 */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-3 w-60 z-50 origin-top-right transition-all duration-200 ease-out scale-100">
          {/* 菜单外层 - 带发光蓝色边框 */}
          <div className="p-[1px] rounded-xl bg-gradient-to-b from-blue-400 via-blue-500/30 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            {/* 菜单内层 - 毛玻璃效果 */}
            <div className="rounded-xl bg-gray-900/70 backdrop-blur-xl overflow-hidden">
              {/* 菜单标题 */}
              <div className="px-5 py-4 border-b border-blue-500/20">
                <p className="text-sm font-medium text-white">用户信息</p>
                <p className="text-xs text-blue-200/60 mt-1">{user?.username || "anonymous"}</p>
              </div>
              
              {/* 菜单项列表 */}
              <div className="py-2">    
                <Link to="/settings">
                  <div className="group flex items-center px-5 py-3 text-sm text-gray-300 hover:bg-blue-600/20 transition-all duration-200 cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3">
                      <Settings size={16} className="text-blue-400 group-hover:text-blue-300" />
                    </div>
                    系统设置
                  </div>
                </Link>
              </div>
              
              {/* 分隔线 - 渐变效果 */}
              <div className="h-px mx-3 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
              
              {/* 退出按钮 */}
              <div 
                className="group flex items-center px-5 py-3.5 text-sm text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
                onClick={handleLogout}
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mr-3">
                  <LogOut size={16} className="text-red-400 group-hover:text-red-300" />
                </div>
                退出登录
              </div>
            </div>
          </div>
          
          {/* 装饰性光点 */}
          <div className="absolute -top-1 right-6 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
          <div className="absolute -top-2 right-4 w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
        </div>
      )}
    </div>
  );
};

// 添加新的动画
const styleSheet = document.styleSheets[0];
if (styleSheet && !Array.from(styleSheet.cssRules).some(rule => rule.cssText.includes('@keyframes spin-slow'))) {
  styleSheet.insertRule(`
    @keyframes spin-slow {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `, styleSheet.cssRules.length);
  styleSheet.insertRule(`
    .animate-spin-slow {
      animation: spin-slow 6s linear infinite;
    }
  `, styleSheet.cssRules.length);
}

export default UserAvatar;
