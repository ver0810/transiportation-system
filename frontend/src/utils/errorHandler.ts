import axios, { AxiosError } from 'axios';

/**
 * 从 API 错误中提取可读的错误消息
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // 处理后端返回的错误消息
    if (axiosError.response?.data) {
      const data = axiosError.response.data as any;
      if (data.detail && typeof data.detail === 'string') {
        return data.detail;
      }
      if (data.message) {
        return data.message;
      }
      if (data.error) {
        return data.error;
      }
    }
    
    // 处理 HTTP 状态码错误
    if (axiosError.response?.status) {
      switch (axiosError.response.status) {
        case 400:
          return '请求参数错误';
        case 401:
          return '登录已过期，请重新登录';
        case 403:
          return '您没有权限执行此操作';
        case 404:
          return '请求的资源不存在';
        case 500:
          return '服务器内部错误，请稍后重试';
        default:
          return `请求失败 (${axiosError.response.status})`;
      }
    }
    
    // 网络错误
    if (axiosError.code === 'ECONNABORTED') {
      return '请求超时，请检查您的网络';
    }
    if (axiosError.message.includes('Network Error')) {
      return '网络连接错误，请检查您的网络';
    }
  }
  
  // 其他错误
  return error instanceof Error ? error.message : '发生未知错误';
};
