import api from './api';

const itemService = {
  // Obtener todos los items
  getAll: async () => {
    const response = await api.get('/items');
    return response.data;
  },

  // Obtener item por ID
  getById: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  // Crear nuevo item
  create: async (itemData) => {
    const response = await api.post('/items', itemData);
    return response.data;
  },

  // Actualizar item existente
  update: async (id, itemData) => {
    const response = await api.put(`/items/${id}`, itemData);
    return response.data;
  },

  // Eliminar item
  delete: async (id) => {
    await api.delete(`/items/${id}`);
  },

  // Obtener items por usuario (propietario)
  getByUsuario: async (usuarioId) => {
    const response = await api.get(`/items/usuario/${usuarioId}`);
    return response.data;
  },

  // Obtener items por local
  getByLocal: async (localId) => {
    const response = await api.get(`/items/local/${localId}`);
    return response.data;
  },

  // Obtener items prestados a un usuario/banda
  getByPrestadoA: async (prestadoAId) => {
    const response = await api.get(`/items/prestado/${prestadoAId}`);
    return response.data;
  },

  // Obtener items de los locales del usuario
  getByUsuarioLocales: async (usuarioId) => {
    const response = await api.get(`/items/usuario/${usuarioId}/locales`);
    return response.data;
  },
};

export default itemService;