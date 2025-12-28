import api from './api';

const reservaService = {
  // Obtener todas las reservas
  getAll: async () => {
    const response = await api.get('/reservas');
    return response.data;
  },

  // Obtener reserva por ID
  getById: async (id) => {
    const response = await api.get(`/reservas/${id}`);
    return response.data;
  },

  // Obtener reservas de un usuario
  getByUsuario: async (usuarioId) => {
    const response = await api.get(`/reservas/usuario/${usuarioId}`);
    return response.data;
  },

  // Obtener reservas compartidas del usuario (propias + de sus bandas)
  getCompartidas: async (usuarioId) => {
    const response = await api.get(`/reservas/usuario/${usuarioId}/compartidas`);
    return response.data;
  },

  // Obtener reservas de un local
  getByLocal: async (localId) => {
    const response = await api.get(`/reservas/local/${localId}`);
    return response.data;
  },

  // Obtener reservas de una banda
  getByBanda: async (bandaId) => {
    const response = await api.get(`/reservas/banda/${bandaId}`);
    return response.data;
  },

  // Obtener reservas por estado
  getByEstado: async (estado) => {
    const response = await api.get(`/reservas/estado/${estado}`);
    return response.data;
  },

  // Crear reserva
  create: async (reservaData) => {
    const response = await api.post('/reservas', reservaData);
    return response.data;
  },

  // Actualizar reserva
  update: async (id, reservaData) => {
    const response = await api.put(`/reservas/${id}`, reservaData);
    return response.data;
  },

  // Eliminar reserva
  delete: async (id) => {
    await api.delete(`/reservas/${id}`);
  },

  // Obtener aprobaciones de una reserva
  getAprobaciones: async (reservaId) => {
    const response = await api.get(`/reservas/${reservaId}/aprobaciones`);
    return response.data;
  },

  // Obtener aprobaciones pendientes de un usuario
  getAprobacionesPendientes: async (usuarioId) => {
    const response = await api.get(`/reservas/aprobaciones/pendientes/usuario/${usuarioId}`);
    return response.data;
  },

  // Responder a una aprobación (aprobar/rechazar)
  responderAprobacion: async (aprobacionId, aprobada) => {
    const response = await api.put(`/reservas/aprobaciones/${aprobacionId}`, {
      aprobada,
    });
    return response.data;
  },
};

export default reservaService;