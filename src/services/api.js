import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token automáticamente a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // o el esquema que use tu backend
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor opcional para manejar errores globales como token expirado (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el token expira o es inválido, podrías redirigir al login
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Also removing user just in case
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;