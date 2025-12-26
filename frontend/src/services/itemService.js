import api from './api';

const itemService = {
  // Obtener todos los items con filtros y paginación
  getAll: (page = 0, size = 12, filters = {}) => {
    const params = { page, size };

    if (filters.categoria) {
      params.categoria = filters.categoria;
    }

    if (filters.disponible !== null && filters.disponible !== undefined) {
      params.disponible = filters.disponible;
    }

    if (filters.search) {
      params.search = filters.search;
    }

    return api.get('/items', { params });
  },

  // Obtener item por ID
  getById: (id) => {
    return api.get(`/items/${id}`);
  },

  // Crear nuevo item
  create: (itemData) => {
    return api.post('/items', itemData);
  },

  // Actualizar item existente
  update: (id, itemData) => {
    return api.put(`/items/${id}`, itemData);
  },

  // Eliminar item
  delete: (id) => {
    return api.delete(`/items/${id}`);
  },

  // Obtener items por usuario
  getByUsuario: (usuarioId) => {
    return api.get(`/items/usuario/${usuarioId}`);
  },

  // Obtener items prestados a un usuario
  getByPrestadoA: (usuarioId) => {
    return api.get(`/items/prestado/${usuarioId}`);
  },
};

export default itemService;