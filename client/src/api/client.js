import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fincare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
  updateDemographics: (data) => apiClient.put('/auth/profile', data),
};

export const profileAPI = {
  getFinancialProfile: () => apiClient.get('/profile/financial'),
  updateFinancialProfile: (data) => apiClient.put('/profile/financial', data),
};

export const advisoryAPI = {
  getAdvisoryReport: () => apiClient.get('/advisory'),
  getPortfolioAllocation: (params) => apiClient.get('/advisory/portfolio', { params }),
  calculateInvestment: (data) => apiClient.post('/finance/calculator', data),
};

export const sentimentAPI = {
  getLatestSentiment: () => apiClient.get('/sentiment/latest'),
  overrideSentiment: (data) => apiClient.post('/sentiment', data),
};

export default apiClient;
