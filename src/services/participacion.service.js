import apiClient from './api';

export const participacionService = {
  // Obtener datos para la ruleta
  generarRuleta: async (sesionId) => {
    try {
      const response = await apiClient.get(`/participaciones/sesion/${sesionId}/ruleta`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al generar la ruleta');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  },

  // Registrar calificación de participación
  registrarParticipacion: async (sesionId, datos) => {
    try {
      const response = await apiClient.post(`/participaciones/sesion/${sesionId}`, datos);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al registrar la participación');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  },

  // Obtener participaciones de la sesión
  obtenerParticipaciones: async (sesionId) => {
    try {
      const response = await apiClient.get(`/participaciones/sesion/${sesionId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al obtener las participaciones');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  }
};
