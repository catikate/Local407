import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import reservaService from '../services/reservaService';
import { EventCard } from '../components/features';
import { Button } from '../components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

const Calendario = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filter, setFilter] = useState('TODOS'); // TODOS, ENSAYO, SHOW
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    if (user) {
      loadReservas();
    }
  }, [user, currentMonth]);

  const loadReservas = async () => {
    try {
      setLoading(true);

      // Cargar reservas compartidas del usuario
      const reservasResponse = await reservaService.getCompartidas(user.id);
      const todasReservas = reservasResponse || [];

      // Filtrar reservas del mes actual
      const inicioMes = startOfMonth(currentMonth);
      const finMes = endOfMonth(currentMonth);

      const reservasDelMes = todasReservas.filter(r => {
        const fechaReserva = new Date(r.fechaInicio);
        return fechaReserva >= inicioMes && fechaReserva <= finMes;
      });

      setReservas(reservasDelMes);
    } catch (error) {
      console.error('Error loading reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // Filtrar reservas según el filtro seleccionado
  const getFilteredReservas = () => {
    if (filter === 'TODOS') {
      return reservas;
    }
    return reservas.filter(r => {
      if (filter === 'ENSAYO') {
        return r.tipoEvento === 'ENSAYO';
      } else if (filter === 'SHOW') {
        return r.tipoEvento === 'SHOW' || r.tipoEvento === 'SHOW_PERSONAL';
      }
      return true;
    });
  };

  // Agrupar reservas por día
  const groupReservasByDay = () => {
    const filteredReservas = getFilteredReservas();
    const grupos = {};

    filteredReservas.forEach(reserva => {
      const fecha = format(new Date(reserva.fechaInicio), 'yyyy-MM-dd');
      if (!grupos[fecha]) {
        grupos[fecha] = [];
      }
      grupos[fecha].push(reserva);
    });

    // Ordenar por fecha
    return Object.keys(grupos)
      .sort()
      .map(fecha => ({
        fecha: new Date(fecha),
        reservas: grupos[fecha].sort((a, b) =>
          new Date(a.fechaInicio) - new Date(b.fechaInicio)
        )
      }));
  };

  const reservasAgrupadas = groupReservasByDay();
  const filteredReservas = getFilteredReservas();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header con navegación de mes */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-text-primary">Calendario</h1>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-hover rounded-lg transition-colors focus-ring"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5 text-text-primary" />
            </button>

            <h2 className="text-xl font-semibold text-text-primary min-w-[180px] text-center capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h2>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-hover rounded-lg transition-colors focus-ring"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5 text-text-primary" />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'TODOS' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleFilterChange('TODOS')}
          >
            Todos
          </Button>
          <Button
            variant={filter === 'ENSAYO' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleFilterChange('ENSAYO')}
          >
            Ensayos
          </Button>
          <Button
            variant={filter === 'SHOW' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleFilterChange('SHOW')}
          >
            Shows
          </Button>
        </div>
      </div>

      {/* Vista de lista agrupada por días */}
      {filteredReservas.length > 0 ? (
        <div className="space-y-8">
          {reservasAgrupadas.map(({ fecha, reservas }) => (
            <div key={format(fecha, 'yyyy-MM-dd')} className="space-y-3">
              {/* Encabezado del día */}
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">
                    {format(fecha, 'd')}
                  </div>
                  <div className="text-xs text-text-muted uppercase">
                    {format(fecha, 'MMM', { locale: es })}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-text-primary capitalize">
                    {format(fecha, 'EEEE', { locale: es })}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {reservas.length} {reservas.length === 1 ? 'evento' : 'eventos'}
                  </div>
                </div>
              </div>

              {/* Lista de eventos del día */}
              <div className="ml-16 space-y-3">
                {reservas.map((reserva) => (
                  <EventCard
                    key={reserva.id}
                    booking={reserva}
                    onClick={() => navigate(`/reservas/${reserva.id}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-16 px-4">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No hay eventos este mes
          </h3>
          <p className="text-text-secondary mb-6">
            {filter === 'TODOS'
              ? 'No tienes ningún ensayo o show programado para este mes.'
              : filter === 'ENSAYO'
                ? 'No tienes ensayos programados para este mes.'
                : 'No tienes shows programados para este mes.'
            }
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/nueva-reserva')}
          >
            Crear Reserva
          </Button>
        </div>
      )}
    </div>
  );
};

export default Calendario;