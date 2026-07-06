import axios from "axios";
import { useAuthStore } from "./stores/authStore";

const getBaseUrl = () => {
  // If running on server (SSR), we need an absolute URL
  if (typeof window === "undefined") {
    return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
  }
  // In browser, use NEXT_PUBLIC_API_URL or default to relative path "/api/v1" so Next.js rewrites proxy it
  return process.env.NEXT_PUBLIC_API_URL || "/api/v1";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().tokens?.access;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().tokens?.refresh;
        if (refreshToken) {
          // Attempt to refresh
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/token/refresh/`,
            { refresh: refreshToken }
          );
          
          const responseData = response.data.data || response.data;
          const newAccess = responseData.access;
          const newRefresh = responseData.refresh || refreshToken;

          if (!newAccess) {
            throw new Error("No access token returned from refresh endpoint");
          }

          useAuthStore.getState().setTokens({
            access: newAccess,
            refresh: newRefresh,
          });

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
