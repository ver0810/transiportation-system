import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router";
import apiClient from "@/services/apiClient";
import { getErrorMessage } from "@/utils/errorHandler";

interface User {
  id?: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUserInfo: (user: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("token"));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get("/user/me");
        setUser(response.data);
        localStorage.setItem("username", response.data.username);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post("/user/login", { username, password });
      const accessToken = response.data?.access_token;
      if (!accessToken) {
        throw new Error("登录失败：未收到访问令牌");
      }

      localStorage.setItem("token", accessToken);
      setToken(accessToken);

      const userInfoResponse = await apiClient.get("/user/me");
      setUser(userInfoResponse.data);
      localStorage.setItem("username", userInfoResponse.data.username);
      setIsAuthenticated(true);
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post("/user/register", { username, password });
      return response.data;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate("/");
  };

  const clearError = () => {
    setError(null);
  };

  const updateUserInfo = (updatedUser: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }
      const nextUser = { ...currentUser, ...updatedUser };
      if (nextUser.username) {
        localStorage.setItem("username", nextUser.username);
      }
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        updateUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必须在 AuthProvider 内部使用");
  }
  return context;
};
