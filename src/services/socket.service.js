import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// Quitamos '/api' del endpoint para conectarnos a la raíz del backend en el que vive el socket 
const SOCKET_URL = API_URL.replace('/api', '');

export const socket = io(SOCKET_URL, {
  autoConnect: false // No conectar automáticamente, sólo cuando se lo pidamos
});
