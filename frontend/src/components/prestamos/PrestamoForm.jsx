import { useState, useEffect } from 'react';
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
  Alert,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import itemService from '../../services/itemService';
import localService from '../../services/localService';
import bandaService from '../../services/bandaService';
import usuarioService from '../../services/usuarioService';
import prestamoService from '../../services/prestamoService';

// Schema de validación
const prestamoSchema = yup.object({
  itemId: yup
    .number()
    .required('Debes seleccionar un item')
    .typeError('Debes seleccionar un item'),
  receptorTipo: yup
    .string()
    .required('Debes seleccionar el tipo de receptor')
    .oneOf(['usuario', 'banda']),
  receptorId: yup
    .mixed()
    .when('receptorTipo', {
      is: (val) => !!val,
      then: (schema) => schema.required('Debes seleccionar un receptor').test('is-number', 'Debes seleccionar un receptor', value => typeof value === 'number'),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
  localDestinoId: yup
    .number()
    .required('Debes seleccionar un local destino')
    .typeError('Debes seleccionar un local destino'),
  fechaDevolucionEsperada: yup
    .string()
    .required('Debes especificar la fecha de devolución'),
  notas: yup
    .string()
    .max(500, 'Máximo 500 caracteres'),
});

const PrestamoForm = ({ open, onClose }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [locales, setLocales] = useState([]);
  const [bandas, setBandas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(prestamoSchema),
    defaultValues: {
      itemId: '',
      receptorTipo: 'usuario',
      receptorId: '',
      localDestinoId: '',
      fechaDevolucionEsperada: '',
      notas: '',
    },
  });

  const receptorTipo = watch('receptorTipo');
  const itemId = watch('itemId');

  // Cargar datos cuando se abre el formulario
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Cuando se selecciona un item, autocompletar local origen y destino
  useEffect(() => {
    if (itemId && items.length > 0) {
      const selectedItem = items.find(i => i.id === itemId);
      if (selectedItem?.localActual?.id) {
        setValue('localDestinoId', selectedItem.localActual.id);
      }
    }
  }, [itemId, items, setValue]);

  const loadData = async () => {
    try {
      setLoadingData(true);

      // Cargar items del usuario que no estén prestados
      const allItems = await itemService.getByUsuario(user.id);
      // Filtrar items disponibles (no prestados actualmente)
      const availableItems = allItems.filter(item => {
        // El item está disponible si está en su local original
        return item.localActual?.id === item.localOriginal?.id;
      });
      setItems(availableItems);

      // Cargar locales
      const localesData = await localService.getAll();
      setLocales(localesData.data || []);

      // Cargar bandas
      const bandasData = await bandaService.getAll();
      setBandas(bandasData.data || []);

      // Cargar usuarios (para prestar a otros usuarios)
      const usuariosData = await usuarioService.getAll();
      const otrosUsuarios = usuariosData.data?.filter(u => u.id !== user.id) || [];
      setUsuarios(otrosUsuarios);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      const selectedItem = items.find(i => i.id === data.itemId);

      // Preparar datos del préstamo
      const prestamoData = {
        item: { id: data.itemId },
        prestadoPor: { id: user.id },
        localOrigen: { id: selectedItem.localOriginal.id },
        localDestino: { id: data.localDestinoId },
        fechaDevolucionEsperada: data.fechaDevolucionEsperada,
        notas: data.notas || null,
      };

      // Agregar receptor según el tipo seleccionado
      if (data.receptorTipo === 'usuario') {
        prestamoData.prestadoAUsuario = { id: data.receptorId };
        prestamoData.prestadoABanda = null;
      } else {
        prestamoData.prestadoABanda = { id: data.receptorId };
        prestamoData.prestadoAUsuario = null;
      }

      await prestamoService.create(prestamoData);
      onClose();
    } catch (err) {
      setError(err.response?.data || 'Error al crear el préstamo');
      console.error('Error creating prestamo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    onClose();
  };

  // Obtener el local origen del item seleccionado
  const getLocalOrigen = () => {
    if (!itemId || items.length === 0) return null;
    const selectedItem = items.find(i => i.id === itemId);
    return selectedItem?.localOriginal;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Nuevo Préstamo</DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {loadingData ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={2}>
                {/* Selector de item */}
                <Grid item xs={12}>
                  <Controller
                    name="itemId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth required error={!!errors.itemId}>
                        <InputLabel>Item a Prestar</InputLabel>
                        <Select
                          {...field}
                          label="Item a Prestar"
                        >
                          {items.length === 0 ? (
                            <MenuItem disabled>
                              No tienes items disponibles para prestar
                            </MenuItem>
                          ) : (
                            items.map((item) => (
                              <MenuItem key={item.id} value={item.id}>
                                {item.descripcion} - {item.localActual?.nombre}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                        {errors.itemId && (
                          <Box component="span" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 2 }}>
                            {errors.itemId.message}
                          </Box>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Tipo de receptor */}
                <Grid item xs={12}>
                  <Controller
                    name="receptorTipo"
                    control={control}
                    render={({ field }) => (
                      <FormControl component="fieldset">
                        <FormLabel component="legend">Prestar a *</FormLabel>
                        <RadioGroup {...field} row>
                          <FormControlLabel value="usuario" control={<Radio />} label="Usuario" />
                          <FormControlLabel value="banda" control={<Radio />} label="Banda" />
                        </RadioGroup>
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Selector de receptor */}
                <Grid item xs={12}>
                  <Controller
                    name="receptorId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth required error={!!errors.receptorId}>
                        <InputLabel>
                          {receptorTipo === 'usuario' ? 'Usuario' : 'Banda'}
                        </InputLabel>
                        <Select
                          {...field}
                          label={receptorTipo === 'usuario' ? 'Usuario' : 'Banda'}
                        >
                          {receptorTipo === 'usuario' ? (
                            usuarios.length === 0 ? (
                              <MenuItem disabled>No hay usuarios disponibles</MenuItem>
                            ) : (
                              usuarios.map((usuario) => (
                                <MenuItem key={usuario.id} value={usuario.id}>
                                  {usuario.nombre} {usuario.apellido} ({usuario.email})
                                </MenuItem>
                              ))
                            )
                          ) : (
                            bandas.length === 0 ? (
                              <MenuItem disabled>No hay bandas disponibles</MenuItem>
                            ) : (
                              bandas.map((banda) => (
                                <MenuItem key={banda.id} value={banda.id}>
                                  {banda.nombre} - {banda.local?.nombre}
                                </MenuItem>
                              ))
                            )
                          )}
                        </Select>
                        {errors.receptorId && (
                          <Box component="span" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 2 }}>
                            {errors.receptorId.message}
                          </Box>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Local origen (solo lectura) */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Local Origen"
                    value={getLocalOrigen()?.nombre || 'Selecciona un item'}
                    fullWidth
                    disabled
                    helperText="Automático según el item"
                  />
                </Grid>

                {/* Local destino */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="localDestinoId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth required error={!!errors.localDestinoId}>
                        <InputLabel>Local Destino</InputLabel>
                        <Select
                          {...field}
                          label="Local Destino"
                        >
                          {locales.length === 0 ? (
                            <MenuItem disabled>No hay locales disponibles</MenuItem>
                          ) : (
                            locales.map((local) => (
                              <MenuItem key={local.id} value={local.id}>
                                {local.nombre}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                        {errors.localDestinoId && (
                          <Box component="span" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 2 }}>
                            {errors.localDestinoId.message}
                          </Box>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Fecha devolución esperada */}
                <Grid item xs={12}>
                  <Controller
                    name="fechaDevolucionEsperada"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Fecha Devolución Esperada"
                        type="datetime-local"
                        fullWidth
                        required
                        error={!!errors.fechaDevolucionEsperada}
                        helperText={errors.fechaDevolucionEsperada?.message}
                        InputLabelProps={{ shrink: true }}
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
                        label="Notas"
                        fullWidth
                        multiline
                        rows={3}
                        error={!!errors.notas}
                        helperText={errors.notas?.message}
                        placeholder="Notas opcionales sobre el préstamo"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading || loadingData}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || loadingData || items.length === 0}
          >
            {loading ? 'Creando...' : 'Crear Préstamo'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PrestamoForm;