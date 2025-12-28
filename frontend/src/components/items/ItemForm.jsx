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
  Grid,
  Box,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import localService from '../../services/localService';
import bandaService from '../../services/bandaService';

// Schema de validación
const itemSchema = yup.object({
  descripcion: yup
    .string()
    .required('La descripción es obligatoria')
    .max(500, 'Máximo 500 caracteres'),
  cantidad: yup
    .number()
    .required('La cantidad es obligatoria')
    .min(1, 'La cantidad debe ser al menos 1')
    .integer('La cantidad debe ser un número entero')
    .typeError('Debe ser un número válido'),
  localId: yup
    .number()
    .required('Debes seleccionar un local')
    .typeError('Debes seleccionar un local'),
  propietarioTipo: yup
    .string()
    .required('Debes seleccionar el tipo de propietario')
    .oneOf(['usuario', 'banda']),
  bandaId: yup
    .mixed()
    .when('propietarioTipo', {
      is: 'banda',
      then: (schema) => schema.required('Debes seleccionar una banda').test('is-number', 'Debes seleccionar una banda', value => typeof value === 'number'),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
});

const ItemForm = ({ open, onClose, onSubmit, item, loading }) => {
  const { user } = useAuth();
  const isEditing = !!item;
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
    resolver: yupResolver(itemSchema),
    defaultValues: {
      descripcion: '',
      cantidad: 1,
      localId: '',
      propietarioTipo: 'usuario',
      bandaId: '',
    },
  });

  const propietarioTipo = watch('propietarioTipo');
  const bandaId = watch('bandaId');

  // Cargar locales y bandas cuando se abre el formulario
  useEffect(() => {
    if (open) {
      loadLocales();
      loadBandas();
    }
  }, [open]);

  // Cuando se selecciona una banda, autocompletar el local con el local de la banda
  useEffect(() => {
    if (propietarioTipo === 'banda' && bandaId && bandas.length > 0) {
      const bandaSeleccionada = bandas.find(b => b.id === bandaId);
      if (bandaSeleccionada?.local?.id) {
        reset(prev => ({
          ...prev,
          localId: bandaSeleccionada.local.id
        }), { keepDirty: true });
      }
    }
  }, [bandaId, propietarioTipo, bandas, reset]);

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
      const todasBandas = response.data || [];
      // Filtrar bandas donde el usuario es miembro
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

  // Obtener locales disponibles según el tipo de propietario
  const getLocalesDisponibles = () => {
    if (propietarioTipo === 'banda') {
      // Si es banda, solo mostrar locales de las bandas del usuario
      const localesIds = [...new Set(bandas.map(b => b.local?.id).filter(Boolean))];
      return locales.filter(local => localesIds.includes(local.id));
    } else {
      // Si es usuario, mostrar locales de las bandas del usuario
      const localesIds = [...new Set(bandas.map(b => b.local?.id).filter(Boolean))];
      return locales.filter(local => localesIds.includes(local.id));
    }
  };

  // Resetear formulario cuando cambia el item
  useEffect(() => {
    if (open) {
      if (item) {
        reset({
          descripcion: item.descripcion || '',
          cantidad: item.cantidad || 1,
          localId: item.localOriginal?.id || item.localActual?.id || '',
          propietarioTipo: item.propietarioBanda ? 'banda' : 'usuario',
          bandaId: item.propietarioBanda?.id || '',
        });
      } else {
        reset({
          descripcion: '',
          cantidad: 1,
          localId: '',
          propietarioTipo: 'usuario',
          bandaId: '',
        });
      }
    }
  }, [open, item, reset]);

  const handleFormSubmit = (data) => {
    // Preparar datos para el backend
    const itemData = {
      descripcion: data.descripcion,
      cantidad: data.cantidad,
      localOriginal: { id: data.localId },
      localActual: { id: data.localId }, // Al crear, ambos son el mismo
    };

    // Agregar propietario según el tipo seleccionado
    if (data.propietarioTipo === 'usuario') {
      itemData.propietarioUsuario = { id: user.id };
    } else {
      itemData.propietarioBanda = { id: data.bandaId };
    }

    onSubmit(itemData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar Item' : 'Nuevo Item'}
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              {/* Tipo de propietario */}
              <Grid item xs={12}>
                <Controller
                  name="propietarioTipo"
                  control={control}
                  render={({ field }) => (
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Propietario *</FormLabel>
                      <RadioGroup {...field} row>
                        <FormControlLabel value="usuario" control={<Radio />} label="Yo (usuario)" />
                        <FormControlLabel value="banda" control={<Radio />} label="Mi banda" />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Selector de banda (solo si propietarioTipo es 'banda') */}
              {propietarioTipo === 'banda' && (
                <Grid item xs={12}>
                  <Controller
                    name="bandaId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth required error={!!errors.bandaId}>
                        <InputLabel>Banda</InputLabel>
                        <Select
                          {...field}
                          label="Banda"
                          disabled={loadingBandas}
                        >
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
              )}

              {/* Descripción */}
              <Grid item xs={12}>
                <Controller
                  name="descripcion"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descripción"
                      fullWidth
                      multiline
                      rows={3}
                      required
                      error={!!errors.descripcion}
                      helperText={errors.descripcion?.message}
                      placeholder="Ej: Amplificador Fender Blues Junior 15W, en excelente estado"
                    />
                  )}
                />
              </Grid>

              {/* Cantidad */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="cantidad"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Cantidad"
                      type="number"
                      fullWidth
                      required
                      error={!!errors.cantidad}
                      helperText={errors.cantidad?.message}
                      inputProps={{ min: 1, step: 1 }}
                    />
                  )}
                />
              </Grid>

              {/* Local */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="localId"
                  control={control}
                  render={({ field }) => {
                    const localesDisponibles = getLocalesDisponibles();
                    return (
                      <FormControl fullWidth required error={!!errors.localId}>
                        <InputLabel>Local</InputLabel>
                        <Select
                          {...field}
                          label="Local"
                          disabled={loadingLocales || (propietarioTipo === 'banda' && bandaId)}
                        >
                          {loadingLocales ? (
                            <MenuItem disabled>
                              <CircularProgress size={20} sx={{ mr: 1 }} />
                              Cargando locales...
                            </MenuItem>
                          ) : localesDisponibles.length === 0 ? (
                            <MenuItem disabled>
                              {propietarioTipo === 'usuario'
                                ? 'No tienes bandas con locales asignados'
                                : 'No hay locales disponibles'}
                            </MenuItem>
                          ) : (
                            localesDisponibles.map((local) => (
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
                    );
                  }}
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
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ItemForm;