import apiClient from './api';

export const dashboardService = {
  obtenerMetricas: async () => {
    try {
      const response = await apiClient.get('/dashboard/metricas');
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || error.response.data.message || 'Error al obtener métricas');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  }
};
