import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import reservaService from '../services/reservaService';
import notificationService from '../services/notificationService';
import { EventCard } from '../components/features';
import { NotificationItem } from '../components/features';
import { Button } from '../components/ui';
import { Plus as PlusIcon } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    reservas: [],
    notifications: [],
    aprobacionesPendientes: []
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar próximas reservas (máx 3 como especifica PROXIMOS_PASOS.txt)
      const reservasResponse = await reservaService.getCompartidas(user.id);
      const todasReservas = reservasResponse || [];

      // Filtrar próximas reservas (futuras) y tomar solo las 3 primeras
      const ahora = new Date();
      const proximasReservas = todasReservas
        .filter(r => new Date(r.fechaInicio) > ahora)
        .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
        .slice(0, 3);

      // Cargar notificaciones recientes (máx 5 como especifica PROXIMOS_PASOS.txt)
      const notificationsResponse = await notificationService.getAll(user.id);
      const allNotifications = notificationsResponse || [];
      const recentNotifications = allNotifications.slice(0, 5);

      // Cargar aprobaciones pendientes
      const aprobacionesResponse = await reservaService.getAprobacionesPendientes(user.id);
      const aprobacionesPendientes = aprobacionesResponse || [];

      setData({
        reservas: proximasReservas,
        notifications: recentNotifications,
        aprobacionesPendientes: aprobacionesPendientes
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId, user.id);
      // Recargar notificaciones
      loadDashboardData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Hola, {user?.nombre}
        </h1>
        <p className="text-text-secondary">
          Bienvenido/a a tu espacio de ensayos
        </p>
      </div>

      {/* Alert: Aprobaciones Pendientes */}
      {data.aprobacionesPendientes.length > 0 && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                Tienes {data.aprobacionesPendientes.length} solicitud{data.aprobacionesPendientes.length !== 1 ? 'es' : ''} de aprobación pendiente{data.aprobacionesPendientes.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Hay reservas de día completo esperando tu aprobación
              </p>
              <Button
                variant="warning"
                size="sm"
                onClick={() => navigate('/aprobaciones')}
              >
                Revisar Solicitudes →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Próximos Ensayos/Shows */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              Próximos Ensayos
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/calendario')}
            >
              Ver más →
            </Button>
          </div>

          <div className="space-y-3">
            {data.reservas.length > 0 ? (
              data.reservas.map((reserva) => (
                <EventCard
                  key={reserva.id}
                  booking={reserva}
                  onClick={() => navigate(`/reservas/${reserva.id}`)}
                />
              ))
            ) : (
              <div className="text-center py-12 px-4 bg-card-bg border border-border rounded-lg">
                <div className="text-4xl mb-3">🎸</div>
                <p className="text-text-secondary mb-4">No tienes ensayos próximos</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/nueva-reserva')}
                >
                  Crear Reserva
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Notificaciones Recientes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              Notificaciones
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notifications')}
            >
              Ver más →
            </Button>
          </div>

          <div className="bg-card-bg border border-border rounded-lg overflow-hidden">
            {data.notifications.length > 0 ? (
              data.notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  isRead={notification.leida}
                  onMarkRead={() => handleMarkAsRead(notification.id)}
                  onClick={() => navigate('/notifications')}
                />
              ))
            ) : (
              <div className="text-center py-12 px-4">
                <div className="text-4xl mb-3">🔔</div>
                <p className="text-text-secondary">No tienes notificaciones</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB (Floating Action Button) */}
      <button
        onClick={() => navigate('/nueva-reserva')}
        className="fixed bottom-20 md:bottom-8 right-6 bg-accent hover:bg-accent-hover text-white rounded-full w-14 h-14 flex items-center justify-center shadow-notion-lg transition-all duration-200 hover:scale-110 focus-ring z-40"
        aria-label="Nueva reserva"
      >
        <PlusIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Dashboard;