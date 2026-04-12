import axios from 'axios';

/**
 * JWT Claims interface for decoded tokens
 */
export interface JwtClaims {
  sub?: string;
  userId?: string;
  id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  role?: string;
  roles?: string[];
  userType?: string;
  [key: string]: unknown;
}

/**
 * Parses a JWT token to extract its payload
 */
export function parseJwt(token: string): JwtClaims | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
}

/**
 * Main API client instance with base configuration
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    const decoded = parseJwt(token);
    if (decoded?.sub || decoded?.userId) {
      config.headers['X-Auth-User-Id'] = decoded.sub || decoded.userId;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        const axiosModule = await import('axios');
        const res = await axiosModule.default.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        localStorage.setItem('access_token', newAccessToken);
        localStorage.setItem('refresh_token', newRefreshToken);

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient as default };
