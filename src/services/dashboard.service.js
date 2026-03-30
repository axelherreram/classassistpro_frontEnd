import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const dashboardService = {
  obtenerMetricas: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/metricas`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
