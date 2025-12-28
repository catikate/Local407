import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import reservaService from '../services/reservaService';

const Invitaciones = () => {
  const { user } = useAuth();
  const [aprobaciones, setAprobaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadAprobacionesPendientes();
    }
  }, [user?.id]);

  const loadAprobacionesPendientes = async () => {
    try {
      setLoading(true);
      const data = await reservaService.getAprobacionesPendientes(user.id);
      setAprobaciones(data || []);
    } catch (err) {
      console.error('Error loading aprobaciones:', err);
      setError('Error al cargar las solicitudes de aprobación');
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = async (aprobacionId, aprobada) => {
    try {
      await reservaService.responderAprobacion(aprobacionId, aprobada);
      setSuccess(aprobada ? 'Reserva aprobada' : 'Reserva rechazada');
      loadAprobacionesPendientes(); // Recargar lista
    } catch (err) {
      console.error('Error responding to aprobacion:', err);
      setError('Error al responder la solicitud');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Solicitudes de Aprobación
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Reservas de día completo que requieren tu aprobación
        </Typography>
      </Box>

      {aprobaciones.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              No tienes solicitudes de aprobación pendientes
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {aprobaciones.map((aprobacion) => (
            <Grid item xs={12} key={aprobacion.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <CalendarIcon color="primary" />
                        <Typography variant="h6">
                          Reserva de Día Completo
                        </Typography>
                        <Chip
                          label="Pendiente"
                          color="warning"
                          size="small"
                        />
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Local
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {aprobacion.reserva?.local?.nombre || 'N/A'}
                          </Typography>
                        </Grid>

                        {aprobacion.reserva?.banda && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                              Banda
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {aprobacion.reserva.banda.nombre}
                            </Typography>
                          </Grid>
                        )}

                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Solicitado por
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {aprobacion.reserva?.usuario?.nombre} {aprobacion.reserva?.usuario?.apellido}
                          </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <TimeIcon fontSize="small" color="action" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Inicio
                              </Typography>
                              <Typography variant="body1">
                                {formatDate(aprobacion.reserva?.fechaInicio)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <TimeIcon fontSize="small" color="action" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Fin
                              </Typography>
                              <Typography variant="body1">
                                {formatDate(aprobacion.reserva?.fechaFin)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {aprobacion.reserva?.notas && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Notas
                            </Typography>
                            <Typography variant="body1">
                              {aprobacion.reserva.notas}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>

                    <Box display="flex" flexDirection="column" gap={1} ml={2}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckIcon />}
                        onClick={() => handleResponder(aprobacion.id, true)}
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleResponder(aprobacion.id, false)}
                      >
                        Rechazar
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Invitaciones;