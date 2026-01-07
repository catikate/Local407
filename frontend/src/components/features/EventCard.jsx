import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const EventCard = ({
  booking,
  onClick,
  showActions = false,
  onEdit,
  onCancel,
}) => {
  const {
    banda,
    local,
    fechaInicio,
    fechaFin,
    tipoEvento,
    estado,
  } = booking || {};

  // Formatear fecha y hora
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, "EEEE, d MMMM", { locale: es });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, "HH:mm");
  };

  // Determinar variante del badge según estado
  const getBadgeVariant = () => {
    switch (estado) {
      case 'APROBADA':
        return 'success';
      case 'PENDIENTE':
        return 'warning';
      case 'RECHAZADA':
      case 'CANCELADA':
        return 'error';
      default:
        return 'neutral';
    }
  };

  // Icono según tipo de evento
  const getEventIcon = () => {
    return tipoEvento === 'CONCIERTO' ? '🎤' : '🎸';
  };

  return (
    <Card hover={!!onClick} onClick={onClick}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0">{getEventIcon()}</span>
          <h3 className="font-semibold text-text-primary truncate">
            {banda?.nombre || 'Sin banda'}
          </h3>
        </div>
        <Badge variant={getBadgeVariant()}>
          {estado || 'Pendiente'}
        </Badge>
      </div>

      {/* Información */}
      <div className="space-y-2 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="capitalize">{formatDate(fechaInicio)}</span>
        </div>

        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {formatTime(fechaInicio)} - {formatTime(fechaFin)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{local?.nombre || 'Sin local'}</span>
        </div>
      </div>

      {/* Acciones */}
      {showActions && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-border">
          <Button
            size="sm"
            variant="secondary"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            Ver detalles
          </Button>
          {onEdit && estado === 'PENDIENTE' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              Editar
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default EventCard;