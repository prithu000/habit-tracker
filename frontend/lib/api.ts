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

    if (!error.response || error.code === "ERR_NETWORK" || error.message === "Network Error") {
      error.userMessage = "Unable to connect. Check your internet connection.";
    } else if (error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {
      error.userMessage = "Your session has expired. Please log in again.";
    } else if (error.response?.status >= 500) {
      error.userMessage = "Something went wrong. Please try again later.";
    } else {
      const errData = error.response?.data?.error;
      let rawMsg = errData?.message || error.response?.data?.detail;

      // Extract field-level errors if present
      if (!rawMsg && errData?.errors && typeof errData.errors === "object") {
        const firstKey = Object.keys(errData.errors)[0];
        if (firstKey && Array.isArray(errData.errors[firstKey])) {
          rawMsg = errData.errors[firstKey][0];
        } else if (firstKey && typeof errData.errors[firstKey] === "string") {
          rawMsg = errData.errors[firstKey];
        }
      }

      if (typeof rawMsg !== "string") {
        rawMsg = String(rawMsg || "");
      }

      // Map technical backend/DRF messages to user-friendly UI messages
      if (rawMsg.includes("No active account found") || rawMsg.toLowerCase().includes("invalid credentials") || rawMsg.toLowerCase().includes("incorrect password")) {
        error.userMessage = "Incorrect password.";
      } else if (rawMsg.toLowerCase().includes("no account found") || rawMsg.toLowerCase().includes("does not exist")) {
        error.userMessage = "No account found with this email.";
      } else if (rawMsg.toLowerCase().includes("already exists") || (rawMsg.toLowerCase().includes("email") && rawMsg.toLowerCase().includes("exists"))) {
        error.userMessage = "An account with this email already exists.";
      } else if (rawMsg.toLowerCase().includes("linked with google") || rawMsg.toLowerCase().includes("social provider")) {
        error.userMessage = "This email is already linked with Google Sign-In.";
      } else if (rawMsg.includes("object Object") || rawMsg.includes("AxiosError") || rawMsg.includes("ValidationError") || rawMsg.includes("Unexpected token") || rawMsg.includes("Internal Server Error") || !rawMsg.trim()) {
        error.userMessage = "Something went wrong. Please try again later.";
      } else {
        // Strip any technical prefixes or suffixes
        error.userMessage = rawMsg.replace(/^(ValidationError:|Error:|AxiosError:)\s*/i, "").trim();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
