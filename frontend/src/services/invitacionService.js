import api from './api';

const invitacionService = {
  getAll: async () => {
    const response = await api.get('/api/invitaciones');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/invitaciones/${id}`);
    return response.data;
  },

  create: async (invitacion) => {
    const response = await api.post('/api/invitaciones', invitacion);
    return response.data;
  },

  aceptar: async (id) => {
    const response = await api.post(`/api/invitaciones/${id}/aceptar`);
    return response.data;
  },

  rechazar: async (id) => {
    const response = await api.post(`/api/invitaciones/${id}/rechazar`);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/api/invitaciones/${id}`);
  },
};

export default invitacionService;