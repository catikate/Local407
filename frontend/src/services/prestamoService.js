import api from './api';

const prestamoService = {
  // Obtener todos los préstamos
  getAll: async () => {
    const response = await api.get('/prestamos');
    return response.data;
  },

  // Obtener préstamo por ID
  getById: async (id) => {
    const response = await api.get(`/prestamos/${id}`);
    return response.data;
  },

  // Obtener préstamos por item
  getByItemId: async (itemId) => {
    const response = await api.get(`/prestamos/item/${itemId}`);
    return response.data;
  },

  // Obtener préstamos realizados por un usuario
  getByPrestadoPorId: async (usuarioId) => {
    const response = await api.get(`/prestamos/prestado-por/${usuarioId}`);
    return response.data;
  },

  // Obtener préstamos recibidos por un usuario
  getByPrestadoAUsuarioId: async (usuarioId) => {
    const response = await api.get(`/prestamos/prestado-a-usuario/${usuarioId}`);
    return response.data;
  },

  // Obtener préstamos recibidos por una banda
  getByPrestadoABandaId: async (bandaId) => {
    const response = await api.get(`/prestamos/prestado-a-banda/${bandaId}`);
    return response.data;
  },

  // Obtener préstamos por estado (ACTIVO, DEVUELTO, VENCIDO)
  getByEstado: async (estado) => {
    const response = await api.get(`/prestamos/estado/${estado}`);
    return response.data;
  },

  // Obtener préstamos vencidos
  getVencidos: async () => {
    const response = await api.get('/prestamos/vencidos');
    return response.data;
  },

  // Crear un nuevo préstamo
  create: async (prestamoData) => {
    const response = await api.post('/prestamos', prestamoData);
    return response.data;
  },

  // Actualizar un préstamo
  update: async (id, prestamoData) => {
    const response = await api.put(`/prestamos/${id}`, prestamoData);
    return response.data;
  },

  // Devolver un préstamo (marca como devuelto y restaura ubicación del item)
  devolver: async (id) => {
    const response = await api.put(`/prestamos/${id}/devolver`);
    return response.data;
  },

  // Actualizar estado de préstamos vencidos
  actualizarVencidos: async () => {
    await api.put('/prestamos/actualizar-vencidos');
  },

  // Eliminar un préstamo
  delete: async (id) => {
    await api.delete(`/prestamos/${id}`);
  },
};

export default prestamoService;