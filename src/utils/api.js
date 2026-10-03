import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically add the Authorization header if token exists.
// Pass `{ skipAuth: true }` for public catalogue requests: the CDN never caches
// requests that carry an Authorization header, so omitting it lets logged-in
// customers get the edge-cached response too.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
