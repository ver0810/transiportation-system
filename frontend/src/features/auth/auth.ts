import apiClient from "@/services/apiClient";

interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
}
interface LoginData {
  username: string;
  password: string;
}

// 注册
export const register = async (data: RegisterData) => {
  try {
    const respone = await apiClient.post("/user/register", {
      username: data.username,
      password: data.password,
    });
    return respone.data;
  } catch (error) {
    console.error("请求失败");
    throw error;
  }
};

// 登录
export const login = async (data: LoginData) => {
  try {
    const respone = await apiClient.post("/user/login", {
      username: data.username,
      password: data.password,
    });
    return respone.data;
  } catch (error) {
    console.error("登录失败");
    throw error;
  }
};
