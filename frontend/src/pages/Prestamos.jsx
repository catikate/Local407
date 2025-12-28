import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  SwapHoriz as SwapHorizIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import prestamoService from '../services/prestamoService';
import PrestamoForm from '../components/prestamos/PrestamoForm';

const Prestamos = () => {
  const { user } = useAuth();
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (user) {
      loadPrestamos();
    }
  }, [user]);

  const loadPrestamos = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar todos los préstamos
      const allPrestamos = await prestamoService.getAll();

      // Filtrar préstamos relacionados con el usuario
      const misPrestamos = allPrestamos.filter(p =>
        p.prestadoPor?.id === user.id ||
        p.prestadoAUsuario?.id === user.id ||
        (p.prestadoABanda?.miembros && p.prestadoABanda.miembros.some(m => m.id === user.id))
      );

      setPrestamos(misPrestamos);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar préstamos');
      console.error('Error loading prestamos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDevolver = async (id) => {
    try {
      await prestamoService.devolver(id);
      loadPrestamos();
    } catch (err) {
      setError(err.response?.data || 'Error al devolver el préstamo');
      console.error('Error returning prestamo:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este préstamo?')) {
      try {
        await prestamoService.delete(id);
        loadPrestamos();
      } catch (err) {
        setError('Error al eliminar el préstamo');
        console.error('Error deleting prestamo:', err);
      }
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    loadPrestamos();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'ACTIVO':
        return 'primary';
      case 'DEVUELTO':
        return 'success';
      case 'VENCIDO':
        return 'error';
      default:
        return 'default';
    }
  };

  const getFilteredPrestamos = () => {
    if (tab === 0) return prestamos; // Todos
    if (tab === 1) return prestamos.filter(p => p.prestadoPor?.id === user.id); // Prestados por mí
    if (tab === 2) return prestamos.filter(p => p.prestadoAUsuario?.id === user.id ||
      (p.prestadoABanda?.miembros && p.prestadoABanda.miembros.some(m => m.id === user.id))); // Recibidos
    if (tab === 3) return prestamos.filter(p => p.estado === 'ACTIVO'); // Activos
    return prestamos;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const filteredPrestamos = getFilteredPrestamos();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Gestión de Préstamos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Nuevo Préstamo
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          <Tab label="Todos" />
          <Tab label="Prestados por mí" />
          <Tab label="Recibidos" />
          <Tab label="Activos" />
        </Tabs>
      </Box>

      {/* Table */}
      {filteredPrestamos.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Prestado a</TableCell>
                <TableCell>Origen → Destino</TableCell>
                <TableCell>Fecha Préstamo</TableCell>
                <TableCell>Devolución Esperada</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPrestamos.map((prestamo) => (
                <TableRow key={prestamo.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {prestamo.item?.descripcion || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {prestamo.prestadoAUsuario ? (
                      <Typography variant="body2">
                        {prestamo.prestadoAUsuario.nombre} {prestamo.prestadoAUsuario.apellido}
                      </Typography>
                    ) : prestamo.prestadoABanda ? (
                      <Chip
                        label={prestamo.prestadoABanda.nombre}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">
                        {prestamo.localOrigen?.nombre || 'N/A'}
                      </Typography>
                      <SwapHorizIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {prestamo.localDestino?.nombre || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(prestamo.fechaPrestamo)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(prestamo.fechaDevolucionEsperada)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={prestamo.estado}
                      size="small"
                      color={getEstadoColor(prestamo.estado)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      {prestamo.estado === 'ACTIVO' && prestamo.prestadoPor?.id === user.id && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleDevolver(prestamo.id)}
                        >
                          Devolver
                        </Button>
                      )}
                      {prestamo.prestadoPor?.id === user.id && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(prestamo.id)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No hay préstamos para mostrar
          </Typography>
        </Paper>
      )}

      {/* Form Dialog */}
      {openForm && (
        <PrestamoForm
          open={openForm}
          onClose={handleFormClose}
        />
      )}
    </Box>
  );
};

export default Prestamos;