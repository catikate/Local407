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
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import localService from '../../services/localService';

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
});

const ItemForm = ({ open, onClose, onSubmit, item, loading }) => {
  const { user } = useAuth();
  const isEditing = !!item;
  const [locales, setLocales] = useState([]);
  const [loadingLocales, setLoadingLocales] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(itemSchema),
    defaultValues: {
      descripcion: '',
      cantidad: 1,
      localId: '',
    },
  });

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

  // Resetear formulario cuando cambia el item
  useEffect(() => {
    if (open) {
      if (item) {
        reset({
          descripcion: item.descripcion || '',
          cantidad: item.cantidad || 1,
          localId: item.local?.id || '',
        });
      } else {
        reset({
          descripcion: '',
          cantidad: 1,
          localId: '',
        });
      }
    }
  }, [open, item, reset]);

  const handleFormSubmit = (data) => {
    // Preparar datos para el backend
    const itemData = {
      descripcion: data.descripcion,
      cantidad: data.cantidad,
      usuario: { id: user.id },
      local: { id: data.localId },
    };

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
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.localId}>
                      <InputLabel>Local</InputLabel>
                      <Select
                        {...field}
                        label="Local"
                        disabled={loadingLocales}
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