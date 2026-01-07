import { useState, useEffect, useRef } from 'react';
import notificationService from '../../services/notificationService';
import './NotificationBell.css';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Cargar contador de notificaciones no leídas cada 30 segundos
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('local407_user'));
    if (!userData?.id) return;

    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount(userData.id);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error cargando contador de notificaciones:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar notificaciones cuando se abre el dropdown
  const handleToggle = async () => {
    const userData = JSON.parse(localStorage.getItem('local407_user'));
    if (!isOpen && userData?.id) {
      setLoading(true);
      try {
        const data = await notificationService.getUnread(userData.id);
        setNotifications(data);
      } catch (error) {
        console.error('Error cargando notificaciones:', error);
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  // Marcar como leída
  const handleMarkAsRead = async (notificationId) => {
    const userData = JSON.parse(localStorage.getItem('local407_user'));
    if (!userData?.id) return;

    try {
      await notificationService.markAsRead(notificationId, userData.id);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    const userData = JSON.parse(localStorage.getItem('local407_user'));
    if (!userData?.id) return;

    try {
      await notificationService.markAllAsRead(userData.id);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };

  // Obtener icono según el tipo de notificación
  const getNotificationIcon = (type) => {
    const icons = {
      BOOKING_CREATED: '📅',
      BOOKING_PENDING_APPROVAL: '⏳',
      BOOKING_APPROVED: '✅',
      BOOKING_REJECTED: '❌',
      BOOKING_CANCELLED: '🚫',
      ITEM_LOAN_REQUEST: '📦',
      ITEM_LOAN_APPROVED: '✅',
      ITEM_LOAN_REJECTED: '❌',
      ITEM_OVERDUE: '⚠️',
      RETURN_ITEM_REMINDER: '📦',
      MEMBER_ADDED: '🎵',
      MEMBER_REMOVED: '👋',
      LOCAL_CHANGED: '🏢',
      PAYMENT_REMINDER: '💰',
      REHEARSAL_REMINDER: '🎸'
    };
    return icons[type] || '🔔';
  };

  // Formatear fecha relativa
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInDays < 7) return `Hace ${diffInDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Verificar si hay usuario logueado
  const userData = JSON.parse(localStorage.getItem('local407_user') || 'null');
  const hasToken = !!localStorage.getItem('local407_token');

  if (!userData || !hasToken) return null;

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={handleToggle}
        aria-label="Notificaciones"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notificaciones</h3>
            {notifications.length > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">Cargando...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <span className="empty-icon">📭</span>
                <p>No tienes notificaciones nuevas</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item priority-${notification.priority?.toLowerCase() || 'normal'}`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {formatRelativeTime(notification.createdAt)}
                    </div>
                  </div>
                  {notification.priority === 'URGENT' && (
                    <div className="urgent-indicator">!</div>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <a href="/notifications">Ver todas las notificaciones</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;