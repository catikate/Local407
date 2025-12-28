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
import bandaService from '../../services/bandaService';

// Schema de validación
const reservaSchema = yup.object({
  tipoEvento: yup
    .string()
    .required('Debes seleccionar el tipo de evento')
    .oneOf(['ENSAYO', 'SHOW', 'SHOW_PERSONAL']),
  localId: yup
    .number()
    .when('tipoEvento', {
      is: 'ENSAYO',
      then: (schema) => schema.required('El local es obligatorio para ensayos').typeError('Debes seleccionar un local'),
      otherwise: (schema) => schema.nullable().transform((value) => value === '' ? null : value),
    }),
  bandaId: yup
    .number()
    .when('tipoEvento', {
      is: 'SHOW',
      then: (schema) => schema.required('La banda es obligatoria para shows').typeError('Debes seleccionar una banda'),
      otherwise: (schema) => schema.nullable().transform((value) => value === '' ? null : value),
    }),
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
  const [bandas, setBandas] = useState([]);
  const [loadingBandas, setLoadingBandas] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(reservaSchema),
    defaultValues: {
      tipoEvento: 'ENSAYO',
      localId: '',
      bandaId: '',
      fechaInicio: '',
      fechaFin: '',
      esReservaDiaCompleto: false,
      notas: '',
    },
  });

  const tipoEvento = watch('tipoEvento');
  const esReservaDiaCompleto = watch('esReservaDiaCompleto');

  // Cargar locales y bandas cuando se abre el formulario
  useEffect(() => {
    if (open) {
      loadLocales();
      loadBandas();
    }
  }, [open]);

  const loadLocales = async () => {
    try {
      setLoadingLocales(true);
      const response = await localService.getAll();
      setLocales(response.data || []);
    } catch (error) {
      console.error('Error loading locales:', error);
      setLocales([]);
    } finally {
      setLoadingLocales(false);
    }
  };

  const loadBandas = async () => {
    try {
      setLoadingBandas(true);
      const response = await bandaService.getAll();
      // Filtrar bandas del usuario
      const todasBandas = response.data;
      const bandasDelUsuario = todasBandas.filter(banda =>
        banda.miembros && banda.miembros.some(m => m.id === user.id)
      );
      setBandas(bandasDelUsuario);
    } catch (error) {
      console.error('Error loading bandas:', error);
      setBandas([]);
    } finally {
      setLoadingBandas(false);
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
          tipoEvento: reserva.tipoEvento || 'ENSAYO',
          localId: reserva.local?.id || '',
          bandaId: reserva.banda?.id || '',
          fechaInicio: formatDateTimeLocal(reserva.fechaInicio),
          fechaFin: formatDateTimeLocal(reserva.fechaFin),
          esReservaDiaCompleto: reserva.esReservaDiaCompleto || false,
          notas: reserva.notas || '',
        });
      } else {
        reset({
          tipoEvento: 'ENSAYO',
          localId: '',
          bandaId: '',
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
      tipoEvento: data.tipoEvento,
      fechaInicio: new Date(data.fechaInicio).toISOString(),
      fechaFin: new Date(data.fechaFin).toISOString(),
      esReservaDiaCompleto: data.esReservaDiaCompleto && data.tipoEvento === 'ENSAYO',
      notas: data.notas || null,
      usuario: { id: user.id },
    };

    // Incluir local si está seleccionado (obligatorio para ENSAYO)
    if (data.localId) {
      reservaData.local = { id: data.localId };
    }

    // Incluir banda si está seleccionada (obligatorio para SHOW)
    if (data.bandaId) {
      reservaData.banda = { id: data.bandaId };
    }

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
            {/* Información sobre tipo de evento */}
            {tipoEvento === 'ENSAYO' && esReservaDiaCompleto && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Las reservas de día completo requieren la aprobación de todos los usuarios del local.
              </Alert>
            )}
            {tipoEvento === 'SHOW' && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Los shows se confirman automáticamente.
              </Alert>
            )}
            {tipoEvento === 'SHOW_PERSONAL' && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Los shows personales se confirman automáticamente.
              </Alert>
            )}

            <Grid container spacing={2}>
              {/* Tipo de Evento */}
              <Grid item xs={12}>
                <Controller
                  name="tipoEvento"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.tipoEvento}>
                      <InputLabel>Tipo de Evento</InputLabel>
                      <Select
                        {...field}
                        label="Tipo de Evento"
                        disabled={isEditing}
                      >
                        <MenuItem value="ENSAYO">Ensayo</MenuItem>
                        <MenuItem value="SHOW">Show de Banda</MenuItem>
                        <MenuItem value="SHOW_PERSONAL">Show Personal</MenuItem>
                      </Select>
                      {errors.tipoEvento && (
                        <Box component="span" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 2 }}>
                          {errors.tipoEvento.message}
                        </Box>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Local */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="localId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required={tipoEvento === 'ENSAYO'} error={!!errors.localId}>
                      <InputLabel>{tipoEvento === 'ENSAYO' ? 'Local' : 'Local (opcional)'}</InputLabel>
                      <Select
                        {...field}
                        label={tipoEvento === 'ENSAYO' ? 'Local' : 'Local (opcional)'}
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

              {/* Banda */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="bandaId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required={tipoEvento === 'SHOW'} error={!!errors.bandaId}>
                      <InputLabel>
                        {tipoEvento === 'SHOW' ? 'Banda' : 'Banda (opcional)'}
                      </InputLabel>
                      <Select
                        {...field}
                        label={tipoEvento === 'SHOW' ? 'Banda' : 'Banda (opcional)'}
                        disabled={loadingBandas || isEditing}
                      >
                        {tipoEvento !== 'SHOW' && <MenuItem value="">Sin banda</MenuItem>}
                        {loadingBandas ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Cargando bandas...
                          </MenuItem>
                        ) : bandas.length === 0 ? (
                          <MenuItem disabled>
                            No tienes bandas
                          </MenuItem>
                        ) : (
                          bandas.map((banda) => (
                            <MenuItem key={banda.id} value={banda.id}>
                              {banda.nombre}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {errors.bandaId && (
                        <Box component="span" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 2 }}>
                          {errors.bandaId.message}
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

              {/* Reserva de día completo - solo para ENSAYO */}
              {tipoEvento === 'ENSAYO' && (
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
              )}

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