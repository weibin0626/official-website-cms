import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach CSRF token if present
    const csrfToken = getCookie('csrf-token');
    if (csrfToken && config.headers) {
      config.headers['x-csrf-token'] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor: unified error handling
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data.code !== 0) {
      const error = new Error(data.message || '请求失败') as any;
      error.code = data.code;
      return Promise.reject(error);
    }
    return response;
  },
  (error: AxiosError<any>) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        // Token invalid or expired - redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      const message = data?.message || '请求失败';
      const err: any = new Error(message);
      err.code = data?.code || status;
      err.status = status;
      return Promise.reject(err);
    }
    return Promise.reject(new Error('网络错误，请检查网络连接'));
  },
);

/** Helper to get cookie value by name */
function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : undefined;
}

export default apiClient;
