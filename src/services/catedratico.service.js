import apiClient from './api';

export const catedraticoService = {
  // Obtener todos los catedráticos activos
  getCatedraticos: async () => {
    try {
      const response = await apiClient.get('/catedraticos');
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al obtener catedráticos');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  },

  // Crear un nuevo catedrático
  createCatedratico: async (data) => {
    try {
      const response = await apiClient.post('/catedraticos', data);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al crear catedrático');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  },

  // Actualizar un catedrático existente
  updateCatedratico: async (id, data) => {
    try {
      const response = await apiClient.put(`/catedraticos/${id}`, data);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al actualizar catedrático');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  },

  // Eliminar un catedrático (borrado lógico)
  deleteCatedratico: async (id) => {
    try {
      const response = await apiClient.delete(`/catedraticos/${id}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al eliminar catedrático');
      }
      throw new Error(error.message || 'Error de conexión');
    }
  }
};
