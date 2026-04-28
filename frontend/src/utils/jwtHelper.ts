/**
 * JWT相关工具函数
 */

/**
 * 检查字符串是否看起来像JWT
 */
export const isJWT = (str: string): boolean => {
  // JWT通常是三段由点分隔的Base64编码字符串
  return typeof str === 'string' && 
         str.split('.').length === 3 && 
         str.length > 30;
};

/**
 * 解析JWT payload而不验证签名
 * 注意：这只用于读取，不应用于验证JWT的有效性
 */
export const parseJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('解析JWT失败:', e);
    return null;
  }
};

/**
 * 检查JWT是否过期
 */
export const isJWTExpired = (token: string): boolean => {
  try {
    const payload = parseJWT(token);
    if (payload && payload.exp) {
      // JWT的过期时间是以秒为单位的
      const expiryTime = payload.exp * 1000; // 转为毫秒
      const currentTime = Date.now();
      return currentTime > expiryTime;
    }
    return false; // 如果没有过期时间，假设不过期
  } catch (e) {
    console.error('检查JWT过期失败:', e);
    return true; // 出错时假设已过期，以安全为主
  }
};

/**
 * 从JWT中提取用户信息
 */
export const getUserInfoFromJWT = (token: string): any => {
  try {
    const payload = parseJWT(token);
    if (!payload) return null;
    
    // 常见的用户信息字段
    const userInfo: Record<string, any> = {};
    const userFields = ['sub', 'username', 'name', 'email', 'userId', 'id', 'roles', 'permissions'];
    
    userFields.forEach(field => {
      if (payload[field] !== undefined) {
        userInfo[field] = payload[field];
      }
    });
    
    return Object.keys(userInfo).length > 0 ? userInfo : null;
  } catch (e) {
    console.error('从JWT中提取用户信息失败:', e);
    return null;
  }
};

export default {
  isJWT,
  parseJWT,
  isJWTExpired,
  getUserInfoFromJWT,
};
