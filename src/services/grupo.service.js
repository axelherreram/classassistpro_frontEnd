import apiClient from './api';

export const grupoService = {
  generarGrupos: async (sesionId, datos) => {
    try {
      const response = await apiClient.post(`/grupos/sesion/${sesionId}/generar`, datos);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al generar los grupos');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  },

  obtenerGrupos: async (sesionId) => {
    try {
      const response = await apiClient.get(`/grupos/sesion/${sesionId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al obtener los grupos');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  },

  calificarGrupo: async (grupoId, datos) => {
    try {
      const response = await apiClient.post(`/grupos/${grupoId}/calificar`, datos);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al calificar el grupo');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  }
};
