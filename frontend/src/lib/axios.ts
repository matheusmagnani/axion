import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;

function getTokenExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ?? null;
  } catch {
    return null;
  }
}

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      const exp = getTokenExp(token);
      const oneDayInSeconds = 86400;

      if (exp && exp - Date.now() / 1000 < oneDayInSeconds && !isRefreshing && !config.url?.includes('/auth/refresh')) {
        isRefreshing = true;
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, null, {
            headers: { Authorization: `Bearer ${token}` },
          });
          localStorage.setItem('token', data.token);
          config.headers.Authorization = `Bearer ${data.token}`;
        } catch {
          // refresh failed — keep current token, 401 interceptor will handle expiry
        } finally {
          isRefreshing = false;
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const data = error.response?.data;
    let message = data?.message || error.message || 'Erro inesperado';
    if (data?.issues?.length) {
      message = data.issues.map((i: { field: string; message: string }) => i.message).join(', ');
    }
    return Promise.reject(new Error(message));
  }
);
