import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificationItem = ({
  notification,
  isRead = false,
  onMarkRead,
  onClick,
}) => {
  const { title, message, createdAt, type } = notification || {};

  // Formatear tiempo relativo
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } catch {
      return '';
    }
  };

  // Icono según tipo de notificación
  const getIcon = () => {
    if (type?.includes('BOOKING') || type?.includes('RESERVA')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (type?.includes('LOAN') || type?.includes('PRESTAMO')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    }
    if (type?.includes('MEMBER')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    }
    // Icono por defecto
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-4 border-b border-border cursor-pointer transition-colors
        ${isRead ? 'bg-card-bg' : 'bg-accent/5 hover:bg-accent/10'}
        hover:bg-hover
      `}
    >
      <div className="flex items-start gap-3">
        {/* Indicador de no leído */}
        {!isRead && (
          <div className="flex-shrink-0 mt-1">
            <div className="w-2 h-2 rounded-full bg-accent" />
          </div>
        )}

        {/* Icono */}
        <div className="flex-shrink-0 mt-0.5 text-text-muted">
          {getIcon()}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium text-text-primary ${!isRead ? 'font-semibold' : ''}`}>
            {title || 'Sin título'}
          </h4>
          <p className="text-sm text-text-secondary mt-0.5 line-clamp-2">
            {message || 'Sin mensaje'}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {formatTime(createdAt)}
          </p>
        </div>

        {/* Acción de marcar como leído */}
        {!isRead && onMarkRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead();
            }}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-hover text-accent transition-colors"
            aria-label="Marcar como leído"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;