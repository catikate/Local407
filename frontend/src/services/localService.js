import api from './api';

const localService = {
  getAll: async () => {
    const response = await api.get('/api/locales');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/locales/${id}`);
    return response.data;
  },

  create: async (local) => {
    const response = await api.post('/api/locales', local);
    return response.data;
  },

  update: async (id, local) => {
    const response = await api.put(`/api/locales/${id}`, local);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/api/locales/${id}`);
  },

  getItems: async (localId) => {
    const response = await api.get(`/api/locales/${localId}/items`);
    return response.data;
  },
};

export default localService;