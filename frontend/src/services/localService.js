import api from './api';

const localService = {
  getAll: () => {
    return api.get('/locales');
  },

  getById: (id) => {
    return api.get(`/locales/${id}`);
  },

  create: (local) => {
    return api.post('/locales', local);
  },

  update: (id, local) => {
    return api.put(`/locales/${id}`, local);
  },

  delete: (id) => {
    return api.delete(`/locales/${id}`);
  },

  getItems: (localId) => {
    return api.get(`/locales/${localId}/items`);
  },

  addUsuario: (localId, usuarioId) => {
    return api.post(`/locales/${localId}/usuarios/${usuarioId}`);
  },

  removeUsuario: (localId, usuarioId) => {
    return api.delete(`/locales/${localId}/usuarios/${usuarioId}`);
  },
};

export default localService;