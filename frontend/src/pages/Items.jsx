import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Pagination,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import itemService from '../services/itemService';
import ItemCard from '../components/items/ItemCard';
import ItemFilters from '../components/items/ItemFilters';
import ItemForm from '../components/items/ItemForm';

const Items = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
  });

  // Estado del formulario
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Estado de confirmación de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Cargar items
  useEffect(() => {
    if (user?.id) {
      loadItems();
    }
  }, [page, filters, user?.id]);

  const loadItems = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');
      // Obtener solo los items de los locales del usuario
      const data = await itemService.getByUsuarioLocales(user.id);

      // Filtrar items si hay búsqueda
      let filteredItems = data || [];
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.descripcion?.toLowerCase().includes(searchLower)
        );
      }

      setItems(filteredItems);
      setTotalPages(1);
      setTotalElements(filteredItems.length);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar items');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de filtros
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0); // Resetear a la primera página
  };

  // Manejar cambio de página
  const handlePageChange = (event, value) => {
    setPage(value - 1); // MUI Pagination es 1-indexed, backend es 0-indexed
  };

  // Abrir formulario para crear
  const handleCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  // Abrir formulario para editar
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  // Cerrar formulario
  const handleFormClose = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  // Guardar item (crear o actualizar)
  const handleFormSubmit = async (itemData) => {
    try {
      setFormLoading(true);

      if (editingItem) {
        await itemService.update(editingItem.id, itemData);
        setSuccess('Item actualizado correctamente');
      } else {
        await itemService.create(itemData);
        setSuccess('Item creado correctamente');
      }

      handleFormClose();
      loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar item');
      console.error('Error saving item:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Abrir diálogo de confirmación de eliminación
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await itemService.delete(itemToDelete.id);
      setSuccess('Item eliminado correctamente');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar item');
      console.error('Error deleting item:', err);
    }
  };

  // Cancelar eliminación
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Ver detalle (por ahora solo muestra alert)
  const handleView = (item) => {
    // Aquí podrías abrir un modal con más detalles
    alert(`Ver detalle de: ${item.descripcion}`);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Inventario de Backline
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nuevo Item
        </Button>
      </Box>

      {/* Filtros */}
      <ItemFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Contador de resultados */}
      {!loading && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          {totalElements} {totalElements === 1 ? 'item encontrado' : 'items encontrados'}
        </Typography>
      )}

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {/* Grid de items */}
      {!loading && items.length > 0 && (
        <>
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <ItemCard
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onView={handleView}
                />
              </Grid>
            ))}
          </Grid>

          {/* Paginación */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No se encontraron items
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {filters.search
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primer item'}
          </Typography>
          {!filters.search && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              Agregar Primer Item
            </Button>
          )}
        </Box>
      )}

      {/* Formulario de crear/editar */}
      <ItemForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        item={editingItem}
        loading={formLoading}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el item "{itemToDelete?.descripcion}"?
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
};

export default Items;