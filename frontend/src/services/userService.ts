import apiClient from "./apiClient";


const userService = {
  updateUsername: async (newUsername: string) => {
    const currentUsername = localStorage.getItem("username");
    const response = await apiClient.post("/user/update-username", {
      current_username: currentUsername,
      new_username: newUsername,
    });
    return response.data;
  },

  updatePassword: async (
    username: string,
    currentPassword: string,
    newPassword: string
  ) => {
    const response = await apiClient.post("/user/update-password", {
      username,
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get("/user/me");
    return response.data;
  },
};


export default userService;
