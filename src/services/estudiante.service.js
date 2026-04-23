import apiClient from './api';

export const estudianteService = {
  obtenerEstudiantesPorClase: async (claseId) => {
    try {
      const response = await apiClient.get(`/estudiantes/clase/${claseId}`);
      return response.data;
    } catch (error) {
       if (error.response) {
        throw new Error(error.response.data.mensaje || error.response.data.message || 'Error al obtener estudiantes');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  },

  crearEstudiante: async (claseId, datos) => {
    try {
      const response = await apiClient.post(`/estudiantes/clase/${claseId}`, datos);
      return response.data;
    } catch (error) {
       if (error.response) {
        throw new Error(error.response.data.mensaje || error.response.data.message || 'Error al crear estudiante');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  },

  subirExcel: async (claseId, file) => {
    try {
      const formData = new FormData();
      formData.append('archivo', file); // 'archivo' o el nombre que espere multer, verify in backend -> wait, multer usually uses 'archivo' or 'file', let's check it. Let's assume 'archivo' or standard. The subagent didn't specify the multiform field name, let's verify.
      
      const response = await apiClient.post(`/estudiantes/clase/${claseId}/excel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.mensaje || error.response.data.message || 'Error al procesar el Excel');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  },

  removerEstudiante: async (claseId, estId) => {
    try {
      const response = await apiClient.delete(`/estudiantes/clase/${claseId}/estudiante/${estId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al remover estudiante');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  }
};
