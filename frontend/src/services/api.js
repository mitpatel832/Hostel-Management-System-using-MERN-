import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request Interceptor: Automatically attaches Bearer JWT token if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('hostelhive_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handles global error codes (e.g. 401 token expiry auto-logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('hostelhive_token');
        localStorage.removeItem('hostelhive_user');
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('hostelhive_token', response.data.data.token);
      localStorage.setItem('hostelhive_user', JSON.stringify(response.data.data));
    }
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('hostelhive_token', response.data.data.token);
      localStorage.setItem('hostelhive_user', JSON.stringify(response.data.data));
    }
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.success && response.data.data) {
      localStorage.setItem('hostelhive_user', JSON.stringify(response.data.data));
    }
    return response.data;
  },
  changePassword: async (passwords) => {
    const response = await api.put('/auth/change-password', passwords);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('hostelhive_token', response.data.data.token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hostelhive_token');
    localStorage.removeItem('hostelhive_user');
  },
  getStoredUser: () => {
    const userStr = localStorage.getItem('hostelhive_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
  getStoredToken: () => {
    return localStorage.getItem('token') || localStorage.getItem('hostelhive_token');
  }
};

export const API = api;
export default api;

