import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';    

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const desempenoService = {
  obtenerRankingPorClase: async (claseId) => {
    const res = await axios.get(`${API_URL}/desempeno/clase/${claseId}/ranking`, { headers: getAuthHeaders() });
    return res.data;
  },
  obtenerRankingPorSesion: async (sesionId) => {
    const res = await axios.get(`${API_URL}/desempeno/sesion/${sesionId}/ranking`, { headers: getAuthHeaders() });
    return res.data;
  }
};
