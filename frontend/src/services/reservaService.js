import api from './api';

const reservaService = {
  // Obtener todas las reservas
  getAll: async () => {
    const response = await api.get('/api/reservas');
    return response.data;
  },

  // Obtener reserva por ID
  getById: async (id) => {
    const response = await api.get(`/api/reservas/${id}`);
    return response.data;
  },

  // Obtener reservas de un usuario
  getByUsuario: async (usuarioId) => {
    const response = await api.get(`/api/reservas/usuario/${usuarioId}`);
    return response.data;
  },

  // Obtener reservas de un local
  getByLocal: async (localId) => {
    const response = await api.get(`/api/reservas/local/${localId}`);
    return response.data;
  },

  // Obtener reservas por estado
  getByEstado: async (estado) => {
    const response = await api.get(`/api/reservas/estado/${estado}`);
    return response.data;
  },

  // Crear reserva
  create: async (reservaData) => {
    const response = await api.post('/api/reservas', reservaData);
    return response.data;
  },

  // Actualizar reserva
  update: async (id, reservaData) => {
    const response = await api.put(`/api/reservas/${id}`, reservaData);
    return response.data;
  },

  // Eliminar reserva
  delete: async (id) => {
    await api.delete(`/api/reservas/${id}`);
  },

  // Obtener aprobaciones de una reserva
  getAprobaciones: async (reservaId) => {
    const response = await api.get(`/api/reservas/${reservaId}/aprobaciones`);
    return response.data;
  },

  // Obtener aprobaciones pendientes de un usuario
  getAprobacionesPendientes: async (usuarioId) => {
    const response = await api.get(`/api/reservas/aprobaciones/pendientes/usuario/${usuarioId}`);
    return response.data;
  },

  // Responder a una aprobación (aprobar/rechazar)
  responderAprobacion: async (aprobacionId, aprobada) => {
    const response = await api.put(`/api/reservas/aprobaciones/${aprobacionId}`, {
      aprobada,
    });
    return response.data;
  },
};

export default reservaService;