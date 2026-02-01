import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// API Base URL
const API_BASE_URL = 'http://37.148.214.162';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Token ekleme
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API] Request with token:', config.url);
    } else {
      console.log('[API] Request without token:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Hata yonetimi
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('[API] Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      // Logout event dispatch edilebilir
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (phone: string, password: string) =>
    api.post('/api/auth/login', { phone, password }),

  register: (data: { phone: string; name: string; password: string }) =>
    api.post('/api/auth/register', data),

  verify: () => api.get('/api/auth/verify'),

  sendOTP: (phone: string) =>
    api.post('/api/auth/send-otp', { phone }),

  verifyOTP: (phone: string, code: string) =>
    api.post('/api/auth/verify-otp', { phone, code }),
};

// Prices API
export const pricesAPI = {
  getAll: () => api.get('/api/prices/cached'),
  getByCode: (code: string) => api.get(`/api/prices/${code}`),
  getDetail: (code: string) => api.get(`/api/prices/detail/${code}`),
};

// Customer API
export const customerAPI = {
  getProfile: () => api.get('/api/customers/me'),
  updateProfile: (data: { name?: string; email?: string }) =>
    api.put('/api/customers/me', data),
  getTransactions: (page = 1, limit = 20) =>
    api.get(`/api/transactions/my?page=${page}&limit=${limit}`),
};

// QR Code API
export const qrCodeAPI = {
  useCode: (code: string) =>
    api.post('/api/qrcodes/use', { code }),
  getHistory: () => api.get('/api/qrcodes/my'),
};

// Branches API
export const branchesAPI = {
  getAll: () => api.get('/api/branches'),
  getById: (id: number) => api.get(`/api/branches/${id}`),
};

// Campaigns API
export const campaignsAPI = {
  getActive: () => api.get('/api/campaigns/active'),
  getById: (id: number) => api.get(`/api/campaigns/${id}`),
};

// Notifications API
export const notificationsAPI = {
  registerToken: (token: string, platform: 'ios' | 'android') =>
    api.post('/api/notifications/register', { token, platform }),
  unregisterToken: (token: string) =>
    api.delete(`/api/notifications/unregister/${token}`),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/api/settings'),
};

// Alerts API
export const alertsAPI = {
  getAll: () => api.get('/api/alerts'),
  create: (data: {
    priceCode: string;
    priceName: string;
    alertType: 'above' | 'below';
    targetPrice: number;
    priceField?: 'alis' | 'satis';
  }) => api.post('/api/alerts', data),
  delete: (id: number) => api.delete(`/api/alerts/${id}`),
  toggle: (id: number) => api.patch(`/api/alerts/${id}/toggle`),
  registerPushToken: (pushToken: string) =>
    api.post('/api/alerts/push-token', { pushToken }),
  removePushToken: () => api.delete('/api/alerts/push-token'),
};

export default api;
