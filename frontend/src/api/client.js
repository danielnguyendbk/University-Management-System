import axios from 'axios';
import { API_BASE_URL, getStoredToken } from '../services/app';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the bearer token to all requests
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle 401/403 errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url === "/auth/login";
    if (status === 401 && !isLoginRequest) {
      sessionStorage.clear();
      window.location.href = "/login";
    } else if (status === 403) {
      console.warn("Truy cập bị từ chối (403 Forbidden): Bạn không có quyền truy cập endpoint này.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
