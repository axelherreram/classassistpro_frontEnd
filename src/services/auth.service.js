import apiClient from './api';

export const authService = {
  login: async (correo, password) => {
    try {
      const response = await apiClient.post('/auth/login', { correo, password });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || error.response.data.message || 'Error al iniciar sesión');
      }
      throw new Error(error.message || 'Error de conexión con el servidor');
    }
  },
  updateProfile: async (data) => {
    try {
      const response = await apiClient.put('/auth/profile', data);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || error.response.data.message || 'Error al actualizar perfil');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  }
};
