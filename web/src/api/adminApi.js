import axios from 'axios';

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

adminApi.interceptors.request.use((config) => {
  const key = localStorage.getItem('adminKey');
  if (key) config.headers['x-admin-key'] = key;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 403) {
      localStorage.removeItem('adminKey');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default adminApi;
