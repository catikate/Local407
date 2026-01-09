import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import reservaService from '../services/reservaService';
import { Button, Card, Badge } from '../components/ui';
import { CheckCircle, XCircle, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ApprovalRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (user) {
      loadApprovalRequests();
    }
  }, [user]);

  const loadApprovalRequests = async () => {
    try {
      setLoading(true);
      // Obtener solicitudes de aprobación pendientes
      const response = await reservaService.getAprobacionesPendientes(user.id);
      setApprovalRequests(response || []);
    } catch (error) {
      console.error('Error loading approval requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (aprobacionId) => {
    try {
      setProcessingId(aprobacionId);
      await reservaService.responderAprobacion(aprobacionId, true);
      // Recargar la lista
      await loadApprovalRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error al aprobar la reserva. Inténtalo de nuevo.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (aprobacionId) => {
    try {
      setProcessingId(aprobacionId);
      await reservaService.responderAprobacion(aprobacionId, false);
      // Recargar la lista
      await loadApprovalRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error al rechazar la reserva. Inténtalo de nuevo.');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  };

  const formatTime = (dateString) => {
    return format(new Date(dateString), 'HH:mm', { locale: es });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Solicitudes de Aprobación
        </h1>
        <p className="text-gray-600">
          Revisa y aprueba las reservas de día completo pendientes
        </p>
      </div>

      {/* Stats */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-semibold text-gray-900">
              {approvalRequests.length} solicitud{approvalRequests.length !== 1 ? 'es' : ''} pendiente{approvalRequests.length !== 1 ? 's' : ''}
            </div>
            <div className="text-sm text-gray-600">
              Estas reservas necesitan tu aprobación para confirmarse
            </div>
          </div>
        </div>
      </div>

      {/* Approval Requests List */}
      {approvalRequests.length > 0 ? (
        <div className="space-y-4">
          {approvalRequests.map((aprobacion) => (
            <Card key={aprobacion.id} className="border-l-4 border-l-yellow-500">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="warning">Pendiente de Aprobación</Badge>
                      {aprobacion.reserva?.esReservaDiaCompleto && (
                        <Badge variant="accent">Día Completo</Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {aprobacion.reserva?.banda?.nombre || 'Sin banda'}
                    </h3>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Local */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Local</div>
                      <div className="font-medium text-gray-900">
                        {aprobacion.reserva?.local?.nombre || 'Sin local'}
                      </div>
                    </div>
                  </div>

                  {/* Fecha */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Fecha</div>
                      <div className="font-medium text-gray-900">
                        {aprobacion.reserva?.fechaInicio && formatDate(aprobacion.reserva.fechaInicio)}
                      </div>
                    </div>
                  </div>

                  {/* Horario */}
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Horario</div>
                      <div className="font-medium text-gray-900">
                        {aprobacion.reserva?.esReservaDiaCompleto ? (
                          <span className="text-yellow-600">Todo el día</span>
                        ) : (
                          <>
                            {aprobacion.reserva?.fechaInicio && formatTime(aprobacion.reserva.fechaInicio)}
                            {' - '}
                            {aprobacion.reserva?.fechaFin && formatTime(aprobacion.reserva.fechaFin)}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Solicitante */}
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Solicitado por</div>
                      <div className="font-medium text-gray-900">
                        {aprobacion.reserva?.usuario?.nombre} {aprobacion.reserva?.usuario?.apellido}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notas */}
                {aprobacion.reserva?.notas && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Notas</div>
                    <div className="text-sm text-gray-700">{aprobacion.reserva.notas}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-gray-200">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                    onClick={() => handleReject(aprobacion.id)}
                    disabled={processingId === aprobacion.id}
                    className="flex-1"
                  >
                    Rechazar
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    icon={CheckCircle}
                    onClick={() => handleApprove(aprobacion.id)}
                    disabled={processingId === aprobacion.id}
                    loading={processingId === aprobacion.id}
                    className="flex-1"
                  >
                    Aprobar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="text-center py-16 px-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Todo al día!
          </h3>
          <p className="text-gray-600 mb-6">
            No tienes solicitudes de aprobación pendientes
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/calendario')}
          >
            Ver Calendario
          </Button>
        </div>
      )}
    </div>
  );
};

export default ApprovalRequests;