import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import localService from '../../services/localService';

// Schema de validación
const reservaSchema = yup.object({
  localId: yup
    .number()
    .required('Debes seleccionar un local')
    .typeError('Debes seleccionar un local'),
  fechaInicio: yup
    .string()
    .required('La fecha de inicio es obligatoria'),
  fechaFin: yup
    .string()
    .required('La fecha de fin es obligatoria')
    .test('fecha-fin-mayor', 'La fecha de fin debe ser posterior a la fecha de inicio', function(value) {
      const { fechaInicio } = this.parent;
      if (!fechaInicio || !value) return true;
      return new Date(value) > new Date(fechaInicio);
    }),
  esReservaDiaCompleto: yup
    .boolean(),
  notas: yup
    .string()
    .max(500, 'Máximo 500 caracteres'),
});

const ReservaForm = ({ open, onClose, onSubmit, reserva, loading }) => {
  const { user } = useAuth();
  const isEditing = !!reserva;
  const [locales, setLocales] = useState([]);
  const [loadingLocales, setLoadingLocales] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(reservaSchema),
    defaultValues: {
      localId: '',
      fechaInicio: '',
      fechaFin: '',
      esReservaDiaCompleto: false,
      notas: '',
    },
  });

  const esReservaDiaCompleto = watch('esReservaDiaCompleto');

  // Cargar locales cuando se abre el formulario
  useEffect(() => {
    if (open) {
      loadLocales();
    }
  }, [open]);

  const loadLocales = async () => {
    try {
      setLoadingLocales(true);
      const data = await localService.getAll();
      setLocales(data);
    } catch (error) {
      console.error('Error loading locales:', error);
      setLocales([]);
    } finally {
      setLoadingLocales(false);
    }
  };

  // Resetear formulario cuando cambia la reserva
  useEffect(() => {
    if (open) {
      if (reserva) {
        // Convertir fechas a formato datetime-local
        const formatDateTimeLocal = (dateString) => {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        reset({
          localId: reserva.local?.id || '',
          fechaInicio: formatDateTimeLocal(reserva.fechaInicio),
          fechaFin: formatDateTimeLocal(reserva.fechaFin),
          esReservaDiaCompleto: reserva.esReservaDiaCompleto || false,
          notas: reserva.notas || '',
        });
      } else {
        reset({
          localId: '',
          fechaInicio: '',
          fechaFin: '',
          esReservaDiaCompleto: false,
          notas: '',
        });
      }
    }
  }, [open, reserva, reset]);

  const handleFormSubmit = (data) => {
    // Preparar datos para el backend
    const reservaData = {
      fechaInicio: new Date(data.fechaInicio).toISOString(),
      fechaFin: new Date(data.fechaFin).toISOString(),
      esReservaDiaCompleto: data.esReservaDiaCompleto,
      notas: data.notas || null,
      usuario: { id: user.id },
      local: { id: data.localId },
    };

    onSubmit(reservaData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar Reserva' : 'Nueva Reserva'}
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {/* Información sobre reservas de día completo */}
            {esReservaDiaCompleto && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Las reservas de día completo requieren la aprobación de todos los usuarios del local.
              </Alert>
            )}

            <Grid container spacing={2}>
              {/* Local */}
              <Grid item xs={12}>
                <Controller
                  name="localId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.localId}>
                      <InputLabel>Local</InputLabel>
                      <Select
                        {...field}
                        label="Local"
                        disabled={loadingLocales || isEditing}
                      >
                        {loadingLocales ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Cargando locales...
                          </MenuItem>
                        ) : locales.length === 0 ? (
                          <MenuItem disabled>
                            No hay locales disponibles
                          </MenuItem>
                        ) : (
                          locales.map((local) => (
                            <MenuItem key={local.id} value={local.id}>
                              {local.nombre}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {errors.localId && (
                        <Box component="span" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 2 }}>
                          {errors.localId.message}
                        </Box>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Fecha y hora de inicio */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="fechaInicio"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Fecha y hora de inicio"
                      type="datetime-local"
                      fullWidth
                      required
                      error={!!errors.fechaInicio}
                      helperText={errors.fechaInicio?.message}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Fecha y hora de fin */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="fechaFin"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Fecha y hora de fin"
                      type="datetime-local"
                      fullWidth
                      required
                      error={!!errors.fechaFin}
                      helperText={errors.fechaFin?.message}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Reserva de día completo */}
              <Grid item xs={12}>
                <Controller
                  name="esReservaDiaCompleto"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          disabled={isEditing}
                        />
                      }
                      label="Reserva de día completo (requiere aprobación de todos los usuarios del local)"
                    />
                  )}
                />
              </Grid>

              {/* Notas */}
              <Grid item xs={12}>
                <Controller
                  name="notas"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notas (opcional)"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.notas}
                      helperText={errors.notas?.message}
                      placeholder="Agrega notas o detalles sobre la reserva..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Reserva'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ReservaForm;