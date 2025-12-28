import api from './api';

const usuarioService = {
  getAll: () => {
    return api.get('/usuarios');
  },

  getById: (id) => {
    return api.get(`/usuarios/${id}`);
  },

  create: (data) => {
    return api.post('/usuarios', data);
  },

  update: (id, data) => {
    return api.put(`/usuarios/${id}`, data);
  },

  delete: (id) => {
    return api.delete(`/usuarios/${id}`);
  },
};

export default usuarioService;