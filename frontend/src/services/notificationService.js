import api from './api';

// Helper para obtener headers con token
const getAuthHeaders = () => {
  const token = localStorage.getItem('local407_token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

const notificationService = {
  // Obtener notificaciones no leídas
  getUnread: async (usuarioId) => {
    const response = await api.get(`/notifications/usuario/${usuarioId}/unread`, getAuthHeaders());
    return response.data;
  },

  // Obtener todas las notificaciones
  getAll: async (usuarioId) => {
    const response = await api.get(`/notifications/usuario/${usuarioId}`, getAuthHeaders());
    return response.data;
  },

  // Contar notificaciones no leídas
  getUnreadCount: async (usuarioId) => {
    const response = await api.get(`/notifications/usuario/${usuarioId}/unread/count`, getAuthHeaders());
    return response.data.count;
  },

  // Marcar como leída
  markAsRead: async (notificationId, usuarioId) => {
    await api.patch(`/notifications/${notificationId}/read?usuarioId=${usuarioId}`, null, getAuthHeaders());
  },

  // Marcar todas como leídas
  markAllAsRead: async (usuarioId) => {
    await api.patch(`/notifications/usuario/${usuarioId}/read-all`, null, getAuthHeaders());
  },

  // Eliminar notificación
  delete: async (notificationId, usuarioId) => {
    await api.delete(`/notifications/${notificationId}?usuarioId=${usuarioId}`, getAuthHeaders());
  }
};

export default notificationService;