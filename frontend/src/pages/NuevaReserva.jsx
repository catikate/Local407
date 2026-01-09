import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import reservaService from '../services/reservaService';
import bandaService from '../services/bandaService';
import localService from '../services/localService';
import { Button, Input } from '../components/ui';

const NuevaReserva = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [bandas, setBandas] = useState([]);
  const [locales, setLocales] = useState([]);
  const [formData, setFormData] = useState({
    bandaId: '',
    localId: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    tipo: 'ENSAYO', // ENSAYO o SHOW
    esReservaDiaCompleto: false, // Reserva de día completo (requiere aprobación de todos)
    notas: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadFormData();
  }, [user]);

  const loadFormData = async () => {
    try {
      setLoadingData(true);

      // Cargar bandas del usuario
      const bandasResponse = await bandaService.getAll();
      const todasBandas = bandasResponse.data || [];
      const misBandas = todasBandas.filter(banda =>
        banda.miembros && banda.miembros.some(m => m.id === user.id)
      );

      // Cargar todos los locales
      const localesResponse = await localService.getAll();
      const todosLocales = localesResponse.data || [];

      setBandas(misBandas);
      setLocales(todosLocales);

      // Pre-seleccionar la primera banda y local si existen
      if (misBandas.length > 0) {
        setFormData(prev => ({ ...prev, bandaId: misBandas[0].id }));
      }
      if (todosLocales.length > 0) {
        setFormData(prev => ({ ...prev, localId: todosLocales[0].id }));
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTipoChange = (tipo) => {
    setFormData(prev => ({ ...prev, tipo }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bandaId) {
      newErrors.bandaId = 'Selecciona una banda';
    }
    if (!formData.localId) {
      newErrors.localId = 'Selecciona un local';
    }
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }

    // Si NO es reserva de día completo, validar horas
    if (!formData.esReservaDiaCompleto) {
      if (!formData.horaInicio) {
        newErrors.horaInicio = 'La hora de inicio es requerida';
      }
      if (!formData.horaFin) {
        newErrors.horaFin = 'La hora de fin es requerida';
      }

      // Validar que la hora de fin sea después de la hora de inicio
      if (formData.horaInicio && formData.horaFin) {
        const inicio = new Date(`2000-01-01T${formData.horaInicio}`);
        const fin = new Date(`2000-01-01T${formData.horaFin}`);
        if (fin <= inicio) {
          newErrors.horaFin = 'La hora de fin debe ser después de la hora de inicio';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      let fechaInicio, fechaFin;

      // Si es reserva de día completo, usar horario completo (00:00 a 23:59)
      if (formData.esReservaDiaCompleto) {
        fechaInicio = new Date(`${formData.fecha}T00:00:00`);
        fechaFin = new Date(`${formData.fecha}T23:59:59`);
      } else {
        // Construir las fechas completas con las horas especificadas
        fechaInicio = new Date(`${formData.fecha}T${formData.horaInicio}`);
        fechaFin = new Date(`${formData.fecha}T${formData.horaFin}`);
      }

      const reservaData = {
        usuarioId: user.id,
        bandaId: parseInt(formData.bandaId),
        localId: parseInt(formData.localId),
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        tipoEvento: formData.tipo,
        esReservaDiaCompleto: formData.esReservaDiaCompleto,
        estado: 'PENDIENTE',
        notas: formData.notas || null
      };

      await reservaService.create(reservaData);

      // Redirigir al calendario o dashboard
      navigate('/calendario');
    } catch (error) {
      console.error('Error creating reserva:', error);
      setErrors({ submit: 'Error al crear la reserva. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Volver atrás
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Nueva Reserva</h1>
        <p className="text-text-secondary">
          Crea una reserva de ensayo o show para tu banda
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banda */}
        <div>
          <Input
            label="Banda"
            name="bandaId"
            type="select"
            value={formData.bandaId}
            onChange={handleChange}
            error={errors.bandaId}
            required
            options={[
              { value: '', label: 'Selecciona una banda' },
              ...bandas.map(banda => ({ value: banda.id, label: banda.nombre }))
            ]}
          />
          {bandas.length === 0 && (
            <p className="text-sm text-warning mt-1">
              No tienes bandas. <button type="button" onClick={() => navigate('/mis-bandas')} className="text-accent hover:underline">Crea una banda</button> primero.
            </p>
          )}
        </div>

        {/* Local */}
        <div>
          <Input
            label="Local"
            name="localId"
            type="select"
            value={formData.localId}
            onChange={handleChange}
            error={errors.localId}
            required
            options={[
              { value: '', label: 'Selecciona un local' },
              ...locales.map(local => ({ value: local.id, label: local.nombre }))
            ]}
          />
        </div>

        {/* Fecha */}
        <div>
          <Input
            label="Fecha"
            name="fecha"
            type="date"
            value={formData.fecha}
            onChange={handleChange}
            error={errors.fecha}
            required
          />
        </div>

        {/* Checkbox: Reserva de día completo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.esReservaDiaCompleto}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  esReservaDiaCompleto: e.target.checked,
                  // Si es día completo, limpiar las horas
                  horaInicio: e.target.checked ? '' : prev.horaInicio,
                  horaFin: e.target.checked ? '' : prev.horaFin
                }));
              }}
              className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                📅 Reserva de día completo
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Esta opción reserva el local por todo el día y requiere la aprobación de todos los miembros del local.
              </div>
            </div>
          </label>
        </div>

        {/* Horas (solo si NO es reserva de día completo) */}
        {!formData.esReservaDiaCompleto && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hora de inicio"
              name="horaInicio"
              type="time"
              value={formData.horaInicio}
              onChange={handleChange}
              error={errors.horaInicio}
              required
            />
            <Input
              label="Hora de fin"
              name="horaFin"
              type="time"
              value={formData.horaFin}
              onChange={handleChange}
              error={errors.horaFin}
              required
            />
          </div>
        )}

        {/* Tipo (toggle buttons) */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Tipo de evento
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleTipoChange('ENSAYO')}
              className={`
                flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium
                ${formData.tipo === 'ENSAYO'
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-card-bg text-text-secondary hover:border-accent/50'
                }
              `}
            >
              🎸 Ensayo
            </button>
            <button
              type="button"
              onClick={() => handleTipoChange('SHOW')}
              className={`
                flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium
                ${formData.tipo === 'SHOW'
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-card-bg text-text-secondary hover:border-accent/50'
                }
              `}
            >
              🎤 Show
            </button>
          </div>
        </div>

        {/* Notas (opcional) */}
        <div>
          <Input
            label="Notas (opcional)"
            name="notas"
            type="textarea"
            value={formData.notas}
            onChange={handleChange}
            placeholder="Agrega cualquier información adicional sobre la reserva..."
            rows={4}
          />
        </div>

        {/* Error de submit */}
        {errors.submit && (
          <div className="p-4 bg-error/10 border border-error rounded-lg">
            <p className="text-sm text-error">{errors.submit}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            fullWidth
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading || bandas.length === 0}
          >
            {loading ? 'Creando...' : 'Crear Reserva'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NuevaReserva;