import api from './api';

const invitacionService = {
  getAll: async () => {
    const response = await api.get('/invitaciones');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/invitaciones/${id}`);
    return response.data;
  },

  create: async (invitacion) => {
    const response = await api.post('/invitaciones', invitacion);
    return response.data;
  },

  aceptar: async (id) => {
    const response = await api.post(`/invitaciones/${id}/aceptar`);
    return response.data;
  },

  rechazar: async (id) => {
    const response = await api.post(`/invitaciones/${id}/rechazar`);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/invitaciones/${id}`);
  },
};

export default invitacionService;