import axios from 'axios';
import useAuthStore from '../stores/authStore';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV
      ? 'http://localhost:5000/api'
      : 'https://seapedia-backend-production.up.railway.app/api'),
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  const activeRole = useAuthStore.getState().activeRole;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (activeRole) {
    config.headers['X-Active-Role'] = activeRole;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      useAuthStore.getState().logout();
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
