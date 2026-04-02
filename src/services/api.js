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
      const requestUrl = error.config?.url || '';
      const esFlujoRegistroQR = requestUrl.includes('/asistencias/marcar');

      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Also removing user just in case

      if (esFlujoRegistroQR) {
        // Solo para QR vencido/401 en registro de asistencia
        window.location.replace('about:blank');
      } else {
        // Flujo normal: volver al login
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;