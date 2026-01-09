import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import prestamoService from '../services/prestamoService';
import { Button, Card, Badge } from '../components/ui';
import { Plus, ArrowRight, CheckCircle, Trash2, Package, RefreshCw } from 'lucide-react';
import PrestamoForm from '../components/prestamos/PrestamoForm';

const Prestamos = () => {
  const { user } = useAuth();
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [tab, setTab] = useState('TODOS');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (user) {
      loadPrestamos();
    }
  }, [user]);

  const loadPrestamos = async () => {
    try {
      setLoading(true);
      setError('');

      const allPrestamos = await prestamoService.getAll();

      // Filter loans related to the user
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
      setActionLoading(id);
      setError('');
      await prestamoService.devolver(id);
      setSuccess('Préstamo devuelto correctamente');
      setTimeout(() => setSuccess(''), 3000);
      loadPrestamos();
    } catch (err) {
      setError(err.response?.data || 'Error al devolver el préstamo');
      console.error('Error returning prestamo:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este préstamo?')) return;

    try {
      setActionLoading(id);
      setError('');
      await prestamoService.delete(id);
      setSuccess('Préstamo eliminado correctamente');
      setTimeout(() => setSuccess(''), 3000);
      loadPrestamos();
    } catch (err) {
      setError('Error al eliminar el préstamo');
      console.error('Error deleting prestamo:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFormClose = (created = false) => {
    setOpenForm(false);
    if (created) {
      setSuccess('Préstamo creado correctamente');
      setTimeout(() => setSuccess(''), 3000);
      loadPrestamos();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'ACTIVO':
        return <Badge variant="accent">Activo</Badge>;
      case 'DEVUELTO':
        return <Badge variant="success">Devuelto</Badge>;
      case 'VENCIDO':
        return <Badge variant="error">Vencido</Badge>;
      default:
        return <Badge variant="neutral">{estado}</Badge>;
    }
  };

  const getFilteredPrestamos = () => {
    switch (tab) {
      case 'PRESTADOS':
        return prestamos.filter(p => p.prestadoPor?.id === user.id);
      case 'RECIBIDOS':
        return prestamos.filter(p =>
          p.prestadoAUsuario?.id === user.id ||
          (p.prestadoABanda?.miembros && p.prestadoABanda.miembros.some(m => m.id === user.id))
        );
      case 'ACTIVOS':
        return prestamos.filter(p => p.estado === 'ACTIVO');
      default:
        return prestamos;
    }
  };

  const tabs = [
    { id: 'TODOS', label: 'Todos', count: prestamos.length },
    { id: 'PRESTADOS', label: 'Prestados por mí', count: prestamos.filter(p => p.prestadoPor?.id === user.id).length },
    { id: 'RECIBIDOS', label: 'Recibidos', count: prestamos.filter(p => p.prestadoAUsuario?.id === user.id || (p.prestadoABanda?.miembros && p.prestadoABanda.miembros.some(m => m.id === user.id))).length },
    { id: 'ACTIVOS', label: 'Activos', count: prestamos.filter(p => p.estado === 'ACTIVO').length },
  ];

  const filteredPrestamos = getFilteredPrestamos();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Gestión de Préstamos</h1>
          <p className="text-text-secondary">
            Administra los préstamos de tu equipamiento
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={loadPrestamos}
          >
            Actualizar
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setOpenForm(true)}
          >
            Nuevo Préstamo
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-lg text-error flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-error hover:text-error/80">
            &times;
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-success/10 border border-success/20 rounded-lg text-success flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-success hover:text-success/80">
            &times;
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTab(t.id)}
          >
            {t.label} ({t.count})
          </Button>
        ))}
      </div>

      {/* Prestamos List */}
      {filteredPrestamos.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop Table Header */}
          <div className="hidden lg:grid lg:grid-cols-7 gap-4 px-4 py-2 bg-secondary rounded-lg text-sm font-medium text-text-secondary">
            <div>Item</div>
            <div>Prestado a</div>
            <div>Origen → Destino</div>
            <div>Fecha Préstamo</div>
            <div>Devolución</div>
            <div>Estado</div>
            <div className="text-right">Acciones</div>
          </div>

          {/* Prestamo Cards/Rows */}
          {filteredPrestamos.map((prestamo) => (
            <Card key={prestamo.id} hover>
              {/* Desktop View */}
              <div className="hidden lg:grid lg:grid-cols-7 gap-4 items-center">
                <div>
                  <p className="font-semibold text-text-primary truncate">
                    {prestamo.item?.descripcion || 'N/A'}
                  </p>
                  {prestamo.item?.categoria && (
                    <p className="text-sm text-text-muted">{prestamo.item.categoria}</p>
                  )}
                </div>

                <div>
                  {prestamo.prestadoAUsuario ? (
                    <p className="text-text-primary">
                      {prestamo.prestadoAUsuario.nombre} {prestamo.prestadoAUsuario.apellido}
                    </p>
                  ) : prestamo.prestadoABanda ? (
                    <Badge variant="accent">{prestamo.prestadoABanda.nombre}</Badge>
                  ) : (
                    <span className="text-text-muted">N/A</span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="truncate">{prestamo.localOrigen?.nombre || 'N/A'}</span>
                  <ArrowRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                  <span className="truncate">{prestamo.localDestino?.nombre || 'N/A'}</span>
                </div>

                <div className="text-sm text-text-secondary">
                  {formatDate(prestamo.fechaPrestamo)}
                </div>

                <div className="text-sm text-text-secondary">
                  {formatDate(prestamo.fechaDevolucionEsperada)}
                </div>

                <div>{getEstadoBadge(prestamo.estado)}</div>

                <div className="flex gap-2 justify-end">
                  {prestamo.estado === 'ACTIVO' && prestamo.prestadoPor?.id === user.id && (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={CheckCircle}
                      onClick={() => handleDevolver(prestamo.id)}
                      loading={actionLoading === prestamo.id}
                    >
                      Devolver
                    </Button>
                  )}
                  {prestamo.prestadoPor?.id === user.id && (
                    <Button
                      size="sm"
                      variant="danger"
                      icon={Trash2}
                      onClick={() => handleDelete(prestamo.id)}
                      loading={actionLoading === prestamo.id}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>

              {/* Mobile View */}
              <div className="lg:hidden space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">
                      {prestamo.item?.descripcion || 'N/A'}
                    </h3>
                    {prestamo.item?.categoria && (
                      <p className="text-sm text-text-muted">{prestamo.item.categoria}</p>
                    )}
                  </div>
                  {getEstadoBadge(prestamo.estado)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-text-muted">Prestado a</p>
                    <p className="text-text-primary">
                      {prestamo.prestadoAUsuario
                        ? `${prestamo.prestadoAUsuario.nombre} ${prestamo.prestadoAUsuario.apellido}`
                        : prestamo.prestadoABanda?.nombre || 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted">Devolución</p>
                    <p className="text-text-primary">{formatDate(prestamo.fechaDevolucionEsperada)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-text-secondary p-2 bg-secondary rounded">
                  <span className="truncate">{prestamo.localOrigen?.nombre || 'N/A'}</span>
                  <ArrowRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                  <span className="truncate">{prestamo.localDestino?.nombre || 'N/A'}</span>
                </div>

                {(prestamo.prestadoPor?.id === user.id) && (
                  <div className="flex gap-2 pt-2 border-t border-border">
                    {prestamo.estado === 'ACTIVO' && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={CheckCircle}
                        fullWidth
                        onClick={() => handleDevolver(prestamo.id)}
                        loading={actionLoading === prestamo.id}
                      >
                        Devolver
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      icon={Trash2}
                      fullWidth
                      onClick={() => handleDelete(prestamo.id)}
                      loading={actionLoading === prestamo.id}
                    >
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-16 px-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-accent/10 rounded-full">
              <Package className="w-12 h-12 text-accent" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            {tab === 'TODOS'
              ? 'No hay préstamos'
              : tab === 'PRESTADOS'
                ? 'No has prestado nada'
                : tab === 'RECIBIDOS'
                  ? 'No has recibido préstamos'
                  : 'No hay préstamos activos'
            }
          </h3>
          <p className="text-text-secondary mb-6">
            Comienza creando un nuevo préstamo de equipamiento
          </p>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setOpenForm(true)}
          >
            Nuevo Préstamo
          </Button>
        </div>
      )}

      {/* Form Modal */}
      {openForm && (
        <PrestamoForm
          open={openForm}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default Prestamos;