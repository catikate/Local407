import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ReservaCard = ({ reserva, onEdit, onDelete, onView, currentUserId }) => {
  // Formatear fechas
  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };

  const formatHora = (fecha) => {
    const date = new Date(fecha);
    return format(date, 'HH:mm', { locale: es });
  };

  // Color del chip según el estado
  const getEstadoColor = () => {
    switch (reserva.estado) {
      case 'CONFIRMADA':
        return 'success';
      case 'APROBADA':
        return 'primary';
      case 'PENDIENTE_APROBACIONES':
        return 'warning';
      case 'RECHAZADA':
        return 'error';
      case 'CANCELADA':
        return 'default';
      default:
        return 'default';
    }
  };

  // Texto del estado
  const getEstadoTexto = () => {
    switch (reserva.estado) {
      case 'CONFIRMADA':
        return 'Confirmada';
      case 'APROBADA':
        return 'Aprobada';
      case 'PENDIENTE_APROBACIONES':
        return 'Pendiente de aprobaciones';
      case 'RECHAZADA':
        return 'Rechazada';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return reserva.estado;
    }
  };

  const isOwner = reserva.usuario?.id === currentUserId;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Estado */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Chip
            label={getEstadoTexto()}
            color={getEstadoColor()}
            size="small"
            sx={{ fontWeight: 500 }}
          />
          {reserva.esReservaDiaCompleto && (
            <Chip
              label="Día completo"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 500 }}
            />
          )}
        </Box>

        {/* Local */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="h6" component="h3" fontWeight={600}>
            {reserva.local?.nombre || 'Local no especificado'}
          </Typography>
        </Box>

        {/* Fecha */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {formatFecha(reserva.fechaInicio)}
          </Typography>
        </Box>

        {/* Horario */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ScheduleIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {formatHora(reserva.fechaInicio)} - {formatHora(reserva.fechaFin)}
          </Typography>
        </Box>

        {/* Usuario creador */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Reservado por:
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {reserva.usuario ? `${reserva.usuario.nombre} ${reserva.usuario.apellido}` : 'N/A'}
          </Typography>
        </Box>

        {/* Notas */}
        {reserva.notas && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Notas:
            </Typography>
            <Typography variant="body2" sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {reserva.notas}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
        <Button
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => onView && onView(reserva)}
        >
          Ver detalles
        </Button>
        {isOwner && (
          <Box>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit && onEdit(reserva)}
              sx={{ mr: 0.5 }}
              disabled={reserva.estado === 'CANCELADA'}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete && onDelete(reserva)}
              disabled={reserva.estado === 'CANCELADA'}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </CardActions>
    </Card>
  );
};

export default ReservaCard;