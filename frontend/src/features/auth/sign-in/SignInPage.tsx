import React, { Suspense } from 'react';
import SignIn from './SignIn';
import { Link } from 'react-router';

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean, error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: any) {
    console.error("错误边界捕获到错误:", error);
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 你可以在这里记录错误
    console.error("组件错误详情:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 你可以渲染任何自定义后备UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-950 text-white p-4">
          <div className="w-full max-w-md p-6 bg-gray-800/50 backdrop-blur-md rounded-lg border border-red-500/30">
            <h2 className="text-xl font-bold text-red-400 mb-4">登录组件出错</h2>
            <p className="text-gray-300 mb-4">
              {this.state.error === "useAuth 必须在 AuthProvider 内部使用" 
                ? "认证系统初始化失败。这通常是由于认证提供者未正确加载。" 
                : this.state.error}
            </p>
            <Link to="/">
              <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                返回首页
              </button>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 包装组件
const SignInPage = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <SignIn />
      </Suspense>
    </ErrorBoundary>
  );
};

export default SignInPage;
