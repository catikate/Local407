import api from './api';

const notificationService = {
  // Obtener notificaciones no leídas
  getUnread: async (usuarioId) => {
    const response = await api.get(`/notifications/usuario/${usuarioId}/unread`);
    return response.data;
  },

  // Obtener todas las notificaciones
  getAll: async (usuarioId) => {
    const response = await api.get(`/notifications/usuario/${usuarioId}`);
    return response.data;
  },

  // Contar notificaciones no leídas
  getUnreadCount: async (usuarioId) => {
    const response = await api.get(`/notifications/usuario/${usuarioId}/unread/count`);
    return response.data.count;
  },

  // Marcar como leída
  markAsRead: async (notificationId, usuarioId) => {
    await api.patch(`/notifications/${notificationId}/read?usuarioId=${usuarioId}`);
  },

  // Marcar todas como leídas
  markAllAsRead: async (usuarioId) => {
    await api.patch(`/notifications/usuario/${usuarioId}/read-all`);
  },

  // Eliminar notificación
  delete: async (notificationId, usuarioId) => {
    await api.delete(`/notifications/${notificationId}?usuarioId=${usuarioId}`);
  }
};

export default notificationService;