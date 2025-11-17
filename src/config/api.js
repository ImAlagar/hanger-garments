// config/api.js - UPDATED to use localStorage
import axios from 'axios';
import { config } from '../config/env';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token'); // Changed to localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.error('No token found for request'); // Debug
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      console.warn('API 401 - Token might be invalid or expired');
      
      // Clear tokens on 401
      localStorage.removeItem('auth_token'); // Changed to localStorage
      localStorage.removeItem('refresh_token'); // Changed to localStorage
      
      // Only redirect if we're on a protected page
      if (window.location.pathname.startsWith('/admin')) {
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 100);
      }
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  patch: (url, data, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

export default apiClient;