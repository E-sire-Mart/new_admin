import axios, { type AxiosRequestHeaders } from 'axios';
import { getBESiteURL } from './get-site-url';

const apiClient = axios.create({
  baseURL: getBESiteURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // Only add token if we're in the browser
    if (typeof window !== 'undefined') {
      // Try multiple storage keys as a fallback to avoid Missing Authorization issues
      const possibleKeys = [
        'custom-auth-token',
        'access_token',
        'token',
      ];
      let token: string | null = null;
      for (const key of possibleKeys) {
        const value = localStorage.getItem(key);
        if (value && value.length > 0) {
          token = value;
          break;
        }
      }
      if (token) {
        const existingHeaders: AxiosRequestHeaders = (config.headers || {}) as AxiosRequestHeaders;
        config.headers = {
          ...existingHeaders,
          Authorization: `Bearer ${token}`,
        } as AxiosRequestHeaders;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If we get a 401 error, clear the token and redirect to login
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('custom-auth-token');
      // Optionally redirect to login page
      // window.location.href = '/auth/sign-in';
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

export default apiClient;
