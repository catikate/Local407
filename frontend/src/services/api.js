import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Agregar token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Manejar errores globalmente
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el error es 401 Unauthorized, el token es inválido
    if (error.response && error.response.status === 401) {
      // Limpiar localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('local407_user');

      // Redirigir a login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
