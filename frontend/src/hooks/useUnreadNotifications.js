import { useEffect, useState } from 'react';
import notificationService, { NOTIFICATIONS_CHANGED_EVENT } from '../services/notificationService';

export const UNREAD_POLL_INTERVAL_MS = 30000;

/**
 * Número de notificaciones sin leer del usuario.
 * Se refresca cada 30 s (mientras la pestaña está visible), al volver a la
 * pestaña y cuando otra parte de la app marca o elimina notificaciones.
 */
export const useUnreadNotifications = (usuarioId, intervalMs = UNREAD_POLL_INTERVAL_MS) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!usuarioId) return undefined;

    let cancelled = false;

    const load = () =>
      notificationService
        .getUnreadCount(usuarioId)
        .then((value) => {
          if (!cancelled) setCount(value);
        })
        .catch((error) => {
          // Si falla (red, sesión caducada) conservamos el último valor conocido
          console.error('Error loading unread notifications count:', error);
        });

    const loadIfVisible = () => {
      if (document.visibilityState === 'visible') load();
    };

    load();
    const timer = setInterval(loadIfVisible, intervalMs);
    document.addEventListener('visibilitychange', loadIfVisible);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, load);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', loadIfVisible);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, load);
    };
  }, [usuarioId, intervalMs]);

  // Sin usuario (sesión cerrada) no hay nada que mostrar
  return { count: usuarioId ? count : 0 };
};

export default useUnreadNotifications;
