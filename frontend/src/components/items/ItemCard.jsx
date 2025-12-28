import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  CardActions,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

const ItemCard = ({ item, onEdit, onDelete, onView }) => {
  // Determinar si está prestado (localActual diferente de localOriginal)
  const isPrestado = item.localOriginal?.id !== item.localActual?.id;

  // Color del chip según estado
  const getAvailabilityColor = () => {
    if (isPrestado) {
      return 'error'; // Rojo si está prestado
    }
    return 'success'; // Verde si está disponible
  };

  // Texto del chip según estado
  const getAvailabilityText = () => {
    if (isPrestado) {
      return `Prestado en ${item.localActual?.nombre || 'otro local'}`;
    }
    return 'Disponible';
  };

  // Obtener nombre del propietario
  const getPropietarioNombre = () => {
    if (item.propietarioUsuario) {
      return `${item.propietarioUsuario.nombre} ${item.propietarioUsuario.apellido}`;
    } else if (item.propietarioBanda) {
      return `Banda: ${item.propietarioBanda.nombre}`;
    }
    return 'N/A';
  };

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
        <Typography variant="h6" component="h3" gutterBottom>
          {item.descripcion}
        </Typography>

        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Cantidad:
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {item.cantidad || 0}
          </Typography>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Ubicación actual:
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {item.localActual?.nombre || 'N/A'}
          </Typography>
        </Box>

        {isPrestado && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Local original:
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {item.localOriginal?.nombre || 'N/A'}
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Propietario:
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {getPropietarioNombre()}
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Chip
            label={getAvailabilityText()}
            color={getAvailabilityColor()}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
        <Button
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => onView && onView(item)}
        >
          Ver
        </Button>
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onEdit && onEdit(item)}
            sx={{ mr: 0.5 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete && onDelete(item)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

export default ItemCard;