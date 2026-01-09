import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import itemService from '../services/itemService';
import { Button, Card, Badge } from '../components/ui';
import { Plus, Package } from 'lucide-react';

const Items = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TODOS'); // TODOS, DISPONIBLE, PRESTADO

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await itemService.getByUsuario(user.id);
      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    if (filter === 'TODOS') return items;
    if (filter === 'DISPONIBLE') {
      return items.filter(item => !item.prestado);
    }
    if (filter === 'PRESTADO') {
      return items.filter(item => item.prestado);
    }
    return items;
  };

  const filteredItems = getFilteredItems();

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
          <h1 className="text-3xl font-bold text-text-primary mb-2">Mi Equipamiento</h1>
          <p className="text-text-secondary">
            Gestiona tu backline y equipamiento musical
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => alert('Funcionalidad de añadir próximamente')}
        >
          Añadir
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'TODOS' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('TODOS')}
        >
          Todos ({items.length})
        </Button>
        <Button
          variant={filter === 'DISPONIBLE' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('DISPONIBLE')}
        >
          Disponibles ({items.filter(i => !i.prestado).length})
        </Button>
        <Button
          variant={filter === 'PRESTADO' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('PRESTADO')}
        >
          Prestados ({items.filter(i => i.prestado).length})
        </Button>
      </div>

      {/* Grid de items */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} hover>
              <div className="space-y-3">
                {/* Header del item */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">
                      {item.descripcion || 'Sin descripción'}
                    </h3>
                    {item.categoria && (
                      <p className="text-sm text-text-muted capitalize">
                        {item.categoria}
                      </p>
                    )}
                  </div>
                  <Badge variant={item.prestado ? 'warning' : 'success'}>
                    {item.prestado ? 'Prestado' : 'Disponible'}
                  </Badge>
                </div>

                {/* Detalles */}
                {item.cantidad && (
                  <div className="text-sm text-text-secondary">
                    Cantidad: {item.cantidad}
                  </div>
                )}

                {/* Información de préstamo si está prestado */}
                {item.prestado && item.prestadoA && (
                  <div className="text-sm text-text-secondary p-2 bg-warning/5 rounded border border-warning/20">
                    Prestado a: <span className="font-medium">{item.prestadoA}</span>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    size="sm"
                    variant="secondary"
                    fullWidth
                    onClick={() => alert('Ver detalles próximamente')}
                  >
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant={item.prestado ? 'ghost' : 'primary'}
                    fullWidth
                    onClick={() => alert('Funcionalidad de préstamo próximamente')}
                  >
                    {item.prestado ? 'Devolver' : 'Prestar'}
                  </Button>
                </div>
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
            {filter === 'TODOS'
              ? 'No tienes equipamiento'
              : filter === 'DISPONIBLE'
                ? 'No tienes equipamiento disponible'
                : 'No tienes equipamiento prestado'
            }
          </h3>
          <p className="text-text-secondary mb-6">
            Comienza agregando tu primer item de backline
          </p>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => alert('Funcionalidad de añadir próximamente')}
          >
            Añadir Item
          </Button>
        </div>
      )}
    </div>
  );
};

export default Items;