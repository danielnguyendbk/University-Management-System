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
  const token = getStoredToken();
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
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Handle unauthorized/forbidden access (e.g., redirect to login or clear token)
      console.error('Unauthorized/Forbidden access:', error.response.status);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
