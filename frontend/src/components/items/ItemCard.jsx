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
  // Color del chip según disponibilidad
  const getAvailabilityColor = () => {
    if (item.prestadoA) {
      return 'error'; // Rojo si está prestado
    }
    return 'success'; // Disponible
  };

  // Texto del chip según disponibilidad
  const getAvailabilityText = () => {
    if (item.prestadoA) {
      return `Prestado a ${item.prestadoA.nombre}`;
    }
    return 'Disponible';
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
            Local:
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {item.local?.nombre || 'N/A'}
          </Typography>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Propietario:
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {item.usuario ? `${item.usuario.nombre} ${item.usuario.apellido}` : 'N/A'}
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