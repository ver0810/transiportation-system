import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/sign-in' 
}) => {
  try {
    const { isAuthenticated, loading } = useAuth();

    // 当认证状态正在加载时，可以显示加载指示器
    if (loading) {
      return <div className="flex items-center justify-center h-screen">加载中...</div>;
    }

    // 如果用户未认证，重定向到登录页面
    if (!isAuthenticated) {
      return <Navigate to={redirectTo} replace />;
    }

    // 如果用户已认证，渲染子组件
    return <>{children}</>;
  } catch (error) {
    console.error("AuthContext 错误:", error);
    return <Navigate to={redirectTo} replace />;
  }
};

export default ProtectedRoute;
