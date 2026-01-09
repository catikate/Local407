import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import bandaService from '../services/bandaService';
import { Button, Card, Badge } from '../components/ui';
import { Edit, LogOut, Music } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bandas, setBandas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBandas();
    }
  }, [user]);

  const loadBandas = async () => {
    try {
      setLoading(true);
      const response = await bandaService.getAll();
      const todasBandas = response.data || [];
      // Filtrar bandas donde el usuario es miembro
      const misBandas = todasBandas.filter(banda =>
        banda.miembros && banda.miembros.some(m => m.id === user.id)
      );
      setBandas(misBandas);
    } catch (error) {
      console.error('Error loading bandas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return '?';
    const nombre = user.nombre || '';
    const apellido = user.apellido || '';
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Mi Perfil</h1>
        <p className="text-text-secondary">
          Administra tu información personal y configuración
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna izquierda - Avatar y datos básicos */}
        <div className="md:col-span-1">
          <Card>
            <div className="text-center space-y-4">
              {/* Avatar grande */}
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full bg-accent flex items-center justify-center text-white text-4xl font-bold">
                  {getInitials()}
                </div>
              </div>

              {/* Nombre y email */}
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {user?.nombre} {user?.apellido}
                </h2>
                <p className="text-sm text-text-secondary mt-1">{user?.email}</p>
              </div>

              {/* Botones de acción */}
              <div className="space-y-2 pt-4">
                <Button
                  variant="primary"
                  icon={Edit}
                  fullWidth
                  onClick={() => alert('Funcionalidad de edición próximamente')}
                >
                  Editar Perfil
                </Button>
                <Button
                  variant="danger"
                  icon={LogOut}
                  fullWidth
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Columna derecha - Información y bandas */}
        <div className="md:col-span-2 space-y-6">
          {/* Información Personal */}
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Información Personal
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-muted mb-1">Nombre</p>
                <p className="text-text-primary font-medium">{user?.nombre || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">Apellido</p>
                <p className="text-text-primary font-medium">{user?.apellido || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">Email</p>
                <p className="text-text-primary font-medium">{user?.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">Teléfono</p>
                <p className="text-text-primary font-medium">
                  {user?.telefono || 'No especificado'}
                </p>
              </div>
            </div>
          </Card>

          {/* Mis Bandas */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Mis Bandas</h3>
              <Badge variant="accent">{bandas.length}</Badge>
            </div>

            {bandas.length > 0 ? (
              <div className="space-y-3">
                {bandas.map((banda) => (
                  <div
                    key={banda.id}
                    className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg hover:bg-hover transition-colors cursor-pointer"
                    onClick={() => navigate('/mis-bandas')}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <Music className="w-6 h-6 text-accent" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-text-primary truncate">
                        {banda.nombre}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {banda.local && (
                          <span className="text-xs text-text-muted">
                            {banda.local.nombre}
                          </span>
                        )}
                        {banda.miembros && (
                          <span className="text-xs text-text-muted">
                            • {banda.miembros.length} miembros
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">
                <Music className="w-12 h-12 mx-auto mb-3 text-text-muted" />
                <p>No perteneces a ninguna banda aún</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate('/mis-bandas')}
                >
                  Ver bandas
                </Button>
              </div>
            )}
          </Card>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <div className="text-2xl font-bold text-accent">{bandas.length}</div>
              <div className="text-sm text-text-muted mt-1">Bandas</div>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-accent">-</div>
              <div className="text-sm text-text-muted mt-1">Ensayos</div>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-accent">-</div>
              <div className="text-sm text-text-muted mt-1">Items</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;