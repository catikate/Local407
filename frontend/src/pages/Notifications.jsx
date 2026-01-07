import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Chip,
  Button,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  Cancel,
  Info,
  Warning,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import notificationService from '../services/notificationService';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const userData = JSON.parse(localStorage.getItem('local407_user'));

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    if (!userData?.id) return;

    try {
      setLoading(true);
      const data = await notificationService.getAll(userData.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId, userData.id);
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userData.id);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.delete(notificationId, userData.id);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

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

  const getPriorityColor = (priority) => {
    const colors = {
      URGENT: 'error',
      HIGH: 'warning',
      NORMAL: 'primary',
      LOW: 'default'
    };
    return colors[priority] || 'default';
  };

  const formatDate = (dateString) => {
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
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4">
            Notificaciones
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} nuevas`}
              color="error"
              size="small"
            />
          )}
        </Box>
        {unreadCount > 0 && (
          <Button
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllAsRead}
            variant="outlined"
          >
            Marcar todas como leídas
          </Button>
        )}
      </Box>

      {loading ? (
        <Typography>Cargando notificaciones...</Typography>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <NotificationsIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No tienes notificaciones
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.isRead ? 'background.paper' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected'
                    },
                    py: 2
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!notification.isRead && (
                        <IconButton
                          edge="end"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Marcar como leída"
                        >
                          <CheckCircle />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(notification.id)}
                        title="Eliminar"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getPriorityColor(notification.priority) + '.main' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.title}
                    primaryTypographyProps={{
                      sx: { fontWeight: notification.isRead ? 400 : 600 }
                    }}
                    secondary={
                      <>
                        {notification.message}
                        <br />
                        <Typography component="span" variant="caption" color="text.disabled">
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                  {(notification.priority === 'URGENT' || notification.emailSent) && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column', alignItems: 'flex-end', mr: 1 }}>
                      {notification.priority === 'URGENT' && (
                        <Chip label="Urgente" color="error" size="small" />
                      )}
                      {notification.emailSent && (
                        <Chip label="Email" size="small" variant="outlined" />
                      )}
                    </Box>
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
}

export default Notifications;