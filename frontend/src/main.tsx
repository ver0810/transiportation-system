import './styles/index.css';
import ReactDOM from "react-dom/client";
import HomePage from './pages/HomePage';
import LoadingPage from './pages/LoadingPage';
import Dashboard from './pages/DashboardPage';
// 使用包装了错误处理的SignInPage而不是直接使用SignIn
import SignInPage from './features/auth/sign-in/SignInPage';
import SignUp from './features/auth/sign-up/SignUp';
import DashboardPage2 from './pages/DashboardPage2';
import { BrowserRouter, Route, Routes } from "react-router";
import SettingPage from './pages/SettingPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const root = document.getElementById('root');

if (!root) {
  throw new Error("根元素 'root' 未找到");
}

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path='sign-in' element={<SignInPage />} />
        <Route path='sign-up' element={<SignUp />} />
        <Route path='loading' element={<ProtectedRoute><LoadingPage /></ProtectedRoute>} />
        <Route path='dashboard2' element={<ProtectedRoute><DashboardPage2 /></ProtectedRoute>} />
        <Route path='settings' element={<ProtectedRoute><SettingPage /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
