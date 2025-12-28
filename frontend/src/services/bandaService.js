import api from './api';

const bandaService = {
  getAll: () => {
    return api.get('/bandas');
  },

  getById: (id) => {
    return api.get(`/bandas/${id}`);
  },

  getByLocalId: (localId) => {
    return api.get(`/bandas/local/${localId}`);
  },

  searchByNombre: (nombre) => {
    return api.get(`/bandas/search?nombre=${nombre}`);
  },

  create: (data) => {
    return api.post('/bandas', data);
  },

  update: (id, data) => {
    return api.put(`/bandas/${id}`, data);
  },

  delete: (id) => {
    return api.delete(`/bandas/${id}`);
  },

  addMiembro: (bandaId, usuarioId) => {
    return api.post(`/bandas/${bandaId}/miembros/${usuarioId}`);
  },

  removeMiembro: (bandaId, usuarioId) => {
    return api.delete(`/bandas/${bandaId}/miembros/${usuarioId}`);
  },

  unirseABanda: (bandaId, usuarioId) => {
    return api.post(`/bandas/${bandaId}/unirse/${usuarioId}`);
  },
};

export default bandaService;