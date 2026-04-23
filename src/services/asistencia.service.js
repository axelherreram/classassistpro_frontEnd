import apiClient from './api';

export const asistenciaService = {
  // Obtener todas las sesiones de una clase
  obtenerSesiones: async (claseId) => {
    try {
      const response = await apiClient.get(`/asistencias/clase/${claseId}/sesiones`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al obtener sesiones');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  },

  // Crear una nueva sesión
  crearSesion: async (datos) => {
    try {
      const response = await apiClient.post('/asistencias/sesion', datos);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al crear sesión');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  },

  // Generar QR para una sesión
  generarQR: async (sesionId, regenerar = false) => {
    try {
      const response = await apiClient.get(`/asistencias/sesion/${sesionId}/qr?regenerar=${regenerar}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al generar QR');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  },

  // Obtener estudiantes que asistieron a la sesión
  obtenerAsistencias: async (sesionId) => {
    try {
      const response = await apiClient.get(`/asistencias/sesion/${sesionId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al obtener la lista de asistencias');
      }
      throw new Error(error.message || 'Error de conexión');
    }  },

  // (ESTUDIANTES) Registrar asistencia con QR y Selfie
  marcarAsistencia: async (datos) => {
    // datos contendrá: { token, carnet, foto }
    try {
      const response = await apiClient.post('/asistencias/marcar', datos);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al marcar asistencia');
      }
      throw new Error(error.message || 'Error de conexión');
    }  }
};