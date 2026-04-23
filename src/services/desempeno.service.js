import apiClient from './api';

export const desempenoService = {
  obtenerRankingPorClase: async (claseId) => {
    try {
      const response = await apiClient.get(`/desempeno/clase/${claseId}/ranking`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al obtener ranking por clase');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  },
  obtenerRankingPorSesion: async (sesionId) => {
    try {
      const response = await apiClient.get(`/desempeno/sesion/${sesionId}/ranking`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al obtener ranking por sesión');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  }
};
