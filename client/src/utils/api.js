import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aptifyai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      if (!['/login', '/register'].includes(path)) {
        localStorage.removeItem('aptifyai_token');
        localStorage.removeItem('aptifyai_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
