import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import reservaService from '../services/reservaService';
import ReservaCard from '../components/reservas/ReservaCard';
import ReservaForm from '../components/reservas/ReservaForm';
import { useAuth } from '../hooks/useAuth';

function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [aprobacionesPendientes, setAprobacionesPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();

  // Estado del formulario
  const [formOpen, setFormOpen] = useState(false);
  const [editingReserva, setEditingReserva] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Estado de confirmación de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reservaToDelete, setReservaToDelete] = useState(null);

  // Estado para el diálogo de detalles
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);

  // Cargar datos
  useEffect(() => {
    if (user) {
      loadReservas();
      loadAprobacionesPendientes();
    }
  }, [user]);

  const loadReservas = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await reservaService.getByUsuario(user.id);
      setReservas(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar reservas');
      console.error('Error loading reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAprobacionesPendientes = async () => {
    try {
      const data = await reservaService.getAprobacionesPendientes(user.id);
      setAprobacionesPendientes(data);
    } catch (err) {
      console.error('Error loading aprobaciones:', err);
    }
  };

  // Manejar cambio de tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Abrir formulario para crear
  const handleCreate = () => {
    setEditingReserva(null);
    setFormOpen(true);
  };

  // Abrir formulario para editar
  const handleEdit = (reserva) => {
    setEditingReserva(reserva);
    setFormOpen(true);
  };

  // Cerrar formulario
  const handleFormClose = () => {
    setFormOpen(false);
    setEditingReserva(null);
  };

  // Guardar reserva (crear o actualizar)
  const handleFormSubmit = async (reservaData) => {
    try {
      setFormLoading(true);

      if (editingReserva) {
        await reservaService.update(editingReserva.id, reservaData);
        setSuccess('Reserva actualizada correctamente');
      } else {
        await reservaService.create(reservaData);
        setSuccess('Reserva creada correctamente');
      }

      handleFormClose();
      loadReservas();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar reserva');
      console.error('Error saving reserva:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Abrir diálogo de confirmación de eliminación
  const handleDeleteClick = (reserva) => {
    setReservaToDelete(reserva);
    setDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (!reservaToDelete) return;

    try {
      await reservaService.delete(reservaToDelete.id);
      setSuccess('Reserva eliminada correctamente');
      setDeleteDialogOpen(false);
      setReservaToDelete(null);
      loadReservas();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar reserva');
      console.error('Error deleting reserva:', err);
    }
  };

  // Cancelar eliminación
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setReservaToDelete(null);
  };

  // Ver detalles de reserva
  const handleView = async (reserva) => {
    setSelectedReserva(reserva);

    // Si es una reserva de día completo, cargar las aprobaciones
    if (reserva.esReservaDiaCompleto) {
      try {
        const aprobaciones = await reservaService.getAprobaciones(reserva.id);
        setSelectedReserva({ ...reserva, aprobaciones });
      } catch (err) {
        console.error('Error loading aprobaciones:', err);
      }
    }

    setDetailsDialogOpen(true);
  };

  // Responder a una aprobación
  const handleResponderAprobacion = async (aprobacionId, aprobada) => {
    try {
      await reservaService.responderAprobacion(aprobacionId, aprobada);
      setSuccess(aprobada ? 'Reserva aprobada' : 'Reserva rechazada');
      loadAprobacionesPendientes();
      loadReservas();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al responder aprobación');
      console.error('Error responding to approval:', err);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Reservas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nueva Reserva
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Mis Reservas" />
          <Tab
            label={
              <Badge badgeContent={aprobacionesPendientes.length} color="error">
                <span>Aprobaciones Pendientes</span>
              </Badge>
            }
          />
        </Tabs>
      </Box>

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {/* Tab Panel: Mis Reservas */}
      {!loading && tabValue === 0 && (
        <>
          {reservas.length > 0 ? (
            <Grid container spacing={3}>
              {reservas.map((reserva) => (
                <Grid item xs={12} sm={6} md={4} key={reserva.id}>
                  <ReservaCard
                    reserva={reserva}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onView={handleView}
                    currentUserId={user.id}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tienes reservas
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Crea tu primera reserva para comenzar
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                Nueva Reserva
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Tab Panel: Aprobaciones Pendientes */}
      {!loading && tabValue === 1 && (
        <>
          {aprobacionesPendientes.length > 0 ? (
            <Grid container spacing={3}>
              {aprobacionesPendientes.map((aprobacion) => (
                <Grid item xs={12} sm={6} md={4} key={aprobacion.id}>
                  <ReservaCard
                    reserva={aprobacion.reserva}
                    onView={handleView}
                    currentUserId={user.id}
                  />
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      onClick={() => handleResponderAprobacion(aprobacion.id, true)}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      fullWidth
                      onClick={() => handleResponderAprobacion(aprobacion.id, false)}
                    >
                      Rechazar
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tienes aprobaciones pendientes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aquí aparecerán las reservas de día completo que requieran tu aprobación
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Formulario de crear/editar */}
      <ReservaForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        reserva={editingReserva}
        loading={formLoading}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar esta reserva?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de detalles */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de la Reserva</DialogTitle>
        <DialogContent>
          {selectedReserva && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Local:</strong> {selectedReserva.local?.nombre}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Tipo:</strong> {selectedReserva.esReservaDiaCompleto ? 'Día completo' : 'Por horas'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Estado:</strong> {selectedReserva.estado}
              </Typography>
              {selectedReserva.notas && (
                <Typography variant="body1" gutterBottom>
                  <strong>Notas:</strong> {selectedReserva.notas}
                </Typography>
              )}

              {/* Aprobaciones si es día completo */}
              {selectedReserva.esReservaDiaCompleto && selectedReserva.aprobaciones && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Aprobaciones:
                  </Typography>
                  {selectedReserva.aprobaciones.map((apr) => (
                    <Box key={apr.id} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {apr.usuario.nombre} {apr.usuario.apellido}:{' '}
                        {apr.aprobada === null ? 'Pendiente' : apr.aprobada ? 'Aprobó' : 'Rechazó'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes de éxito */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" variant="filled">
          {success}
        </Alert>
      </Snackbar>

      {/* Snackbar para mensajes de error */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError('')} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Reservas;