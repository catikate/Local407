import { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';

export default function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('local407_user'));
        const token = localStorage.getItem('local407_token');

        if (!user?.id || !token) {
          return;
        }

        const unreadCount = await notificationService.getUnreadCount(user.id);
        setCount(unreadCount || 0);
      } catch (error) {
        console.error('Error cargando notificaciones:', error);
      }
    };

    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return count > 0 ? (
    <span style={{
      backgroundColor: '#e74c3c',
      color: 'white',
      borderRadius: '10px',
      padding: '2px 8px',
      fontSize: '12px',
      fontWeight: 'bold',
      marginLeft: '8px'
    }}>
      {count}
    </span>
  ) : null;
}