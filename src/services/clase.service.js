import apiClient from './api';

export const claseService = {
  // Crear una nueva clase
  crearClase: async (nombre, descripcion) => {
    try {
      const response = await apiClient.post('/clases', { nombre, descripcion });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.mensaje || error.response.data.message || 'Error al crear la clase');
      }
      throw new Error(error.message || 'Error de conexión con el servidor');
    }
  },
  
  // Obtener todas las clases del catedrático
  obtenerClases: async () => {
    try {
      const response = await apiClient.get('/clases');
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.mensaje || error.response.data.message || 'Error al obtener las clases');
      }
      throw new Error(error.message || 'Error de conexión con el servidor');
    }
  },

  // Obtener una clase específica por su ID
  obtenerClasePorId: async (id) => {
    try {
      const response = await apiClient.get(`/clases/${id}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.mensaje || error.response.data.message || 'Error al obtener la clase');
      }
      throw new Error(error.message || 'Error de conexión con el servidor');
    }
  },

  // Actualizar una clase
  actualizarClase: async (id, datosActualizados) => {
    try {
      const response = await apiClient.put(`/clases/${id}`, datosActualizados);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.mensaje || error.response.data.message || 'Error al actualizar la clase');
      }
      throw new Error(error.message || 'Error de conexión con el servidor');
    }
  },

  // Eliminar una clase (borrado lógico)
  eliminarClase: async (id) => {
    try {
      const response = await apiClient.delete(`/clases/${id}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.mensaje || error.response.data.message || 'Error al eliminar la clase');
      }
      throw new Error(error.message || 'Error de conexión con el servidor');
    }
  }
};