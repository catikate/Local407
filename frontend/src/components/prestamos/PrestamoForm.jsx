import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import itemService from '../../services/itemService';
import localService from '../../services/localService';
import bandaService from '../../services/bandaService';
import usuarioService from '../../services/usuarioService';
import prestamoService from '../../services/prestamoService';
import { Button } from '../ui';
import { X, Package, User, Users, MapPin, Calendar, FileText } from 'lucide-react';

const PrestamoForm = ({ open, onClose }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [locales, setLocales] = useState([]);
  const [bandas, setBandas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    itemId: '',
    receptorTipo: 'usuario',
    receptorId: '',
    localDestinoId: '',
    fechaDevolucionEsperada: '',
    notas: '',
  });

  const [errors, setErrors] = useState({});

  // Load data when form opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Auto-fill destination when item is selected
  useEffect(() => {
    if (formData.itemId && items.length > 0) {
      const selectedItem = items.find(i => i.id === parseInt(formData.itemId));
      if (selectedItem?.localActual?.id) {
        setFormData(prev => ({ ...prev, localDestinoId: selectedItem.localActual.id.toString() }));
      }
    }
  }, [formData.itemId, items]);

  // Reset receptor when type changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, receptorId: '' }));
  }, [formData.receptorTipo]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      setError('');

      // Load user's items that are not currently loaned
      const allItems = await itemService.getByUsuario(user.id);
      const availableItems = allItems.filter(item => {
        return item.localActual?.id === item.localOriginal?.id;
      });
      setItems(availableItems);

      // Load locales
      const localesData = await localService.getAll();
      setLocales(localesData.data || []);

      // Load bandas
      const bandasData = await bandaService.getAll();
      setBandas(bandasData.data || []);

      // Load usuarios (exclude current user)
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.itemId) {
      newErrors.itemId = 'Debes seleccionar un item';
    }

    if (!formData.receptorId) {
      newErrors.receptorId = 'Debes seleccionar un receptor';
    }

    if (!formData.localDestinoId) {
      newErrors.localDestinoId = 'Debes seleccionar un local destino';
    }

    if (!formData.fechaDevolucionEsperada) {
      newErrors.fechaDevolucionEsperada = 'Debes especificar la fecha de devolución';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const selectedItem = items.find(i => i.id === parseInt(formData.itemId));

      const prestamoData = {
        item: { id: parseInt(formData.itemId) },
        prestadoPor: { id: user.id },
        localOrigen: { id: selectedItem.localOriginal.id },
        localDestino: { id: parseInt(formData.localDestinoId) },
        fechaDevolucionEsperada: formData.fechaDevolucionEsperada,
        notas: formData.notas || null,
      };

      if (formData.receptorTipo === 'usuario') {
        prestamoData.prestadoAUsuario = { id: parseInt(formData.receptorId) };
        prestamoData.prestadoABanda = null;
      } else {
        prestamoData.prestadoABanda = { id: parseInt(formData.receptorId) };
        prestamoData.prestadoAUsuario = null;
      }

      await prestamoService.create(prestamoData);
      onClose(true);
    } catch (err) {
      setError(err.response?.data || 'Error al crear el préstamo');
      console.error('Error creating prestamo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      itemId: '',
      receptorTipo: 'usuario',
      receptorId: '',
      localDestinoId: '',
      fechaDevolucionEsperada: '',
      notas: '',
    });
    setErrors({});
    setError('');
    onClose(false);
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getLocalOrigen = () => {
    if (!formData.itemId || items.length === 0) return null;
    const selectedItem = items.find(i => i.id === parseInt(formData.itemId));
    return selectedItem?.localOriginal;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-card-bg rounded-xl shadow-xl transform transition-all animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-text-primary">Nuevo Préstamo</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Content */}
          {loadingData ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                {error && (
                  <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                    {error}
                  </div>
                )}

                {/* Item selector */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                    <Package className="w-4 h-4" />
                    Item a Prestar *
                  </label>
                  <select
                    value={formData.itemId}
                    onChange={handleChange('itemId')}
                    className={`w-full px-3 py-2 border rounded-lg bg-card-bg text-text-primary transition-colors focus-ring ${errors.itemId ? 'border-error' : 'border-border'}`}
                  >
                    <option value="">Selecciona un item</option>
                    {items.length === 0 ? (
                      <option disabled>No tienes items disponibles</option>
                    ) : (
                      items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.descripcion} - {item.localActual?.nombre}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.itemId && (
                    <p className="mt-1 text-sm text-error">{errors.itemId}</p>
                  )}
                </div>

                {/* Receptor type */}
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    Prestar a *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="receptorTipo"
                        value="usuario"
                        checked={formData.receptorTipo === 'usuario'}
                        onChange={handleChange('receptorTipo')}
                        className="w-4 h-4 text-accent focus:ring-accent"
                      />
                      <User className="w-4 h-4 text-text-secondary" />
                      <span className="text-text-primary">Usuario</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="receptorTipo"
                        value="banda"
                        checked={formData.receptorTipo === 'banda'}
                        onChange={handleChange('receptorTipo')}
                        className="w-4 h-4 text-accent focus:ring-accent"
                      />
                      <Users className="w-4 h-4 text-text-secondary" />
                      <span className="text-text-primary">Banda</span>
                    </label>
                  </div>
                </div>

                {/* Receptor selector */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                    {formData.receptorTipo === 'usuario' ? (
                      <><User className="w-4 h-4" /> Usuario *</>
                    ) : (
                      <><Users className="w-4 h-4" /> Banda *</>
                    )}
                  </label>
                  <select
                    value={formData.receptorId}
                    onChange={handleChange('receptorId')}
                    className={`w-full px-3 py-2 border rounded-lg bg-card-bg text-text-primary transition-colors focus-ring ${errors.receptorId ? 'border-error' : 'border-border'}`}
                  >
                    <option value="">
                      Selecciona {formData.receptorTipo === 'usuario' ? 'un usuario' : 'una banda'}
                    </option>
                    {formData.receptorTipo === 'usuario' ? (
                      usuarios.length === 0 ? (
                        <option disabled>No hay usuarios disponibles</option>
                      ) : (
                        usuarios.map((usuario) => (
                          <option key={usuario.id} value={usuario.id}>
                            {usuario.nombre} {usuario.apellido} ({usuario.email})
                          </option>
                        ))
                      )
                    ) : (
                      bandas.length === 0 ? (
                        <option disabled>No hay bandas disponibles</option>
                      ) : (
                        bandas.map((banda) => (
                          <option key={banda.id} value={banda.id}>
                            {banda.nombre} - {banda.local?.nombre}
                          </option>
                        ))
                      )
                    )}
                  </select>
                  {errors.receptorId && (
                    <p className="mt-1 text-sm text-error">{errors.receptorId}</p>
                  )}
                </div>

                {/* Locales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Local origen (read-only) */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                      <MapPin className="w-4 h-4" />
                      Local Origen
                    </label>
                    <input
                      type="text"
                      value={getLocalOrigen()?.nombre || 'Selecciona un item'}
                      disabled
                      className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-text-secondary cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-text-muted">Automático según el item</p>
                  </div>

                  {/* Local destino */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                      <MapPin className="w-4 h-4" />
                      Local Destino *
                    </label>
                    <select
                      value={formData.localDestinoId}
                      onChange={handleChange('localDestinoId')}
                      className={`w-full px-3 py-2 border rounded-lg bg-card-bg text-text-primary transition-colors focus-ring ${errors.localDestinoId ? 'border-error' : 'border-border'}`}
                    >
                      <option value="">Selecciona un local</option>
                      {locales.map((local) => (
                        <option key={local.id} value={local.id}>
                          {local.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.localDestinoId && (
                      <p className="mt-1 text-sm text-error">{errors.localDestinoId}</p>
                    )}
                  </div>
                </div>

                {/* Expected return date */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                    <Calendar className="w-4 h-4" />
                    Fecha Devolución Esperada *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.fechaDevolucionEsperada}
                    onChange={handleChange('fechaDevolucionEsperada')}
                    className={`w-full px-3 py-2 border rounded-lg bg-card-bg text-text-primary transition-colors focus-ring ${errors.fechaDevolucionEsperada ? 'border-error' : 'border-border'}`}
                  />
                  {errors.fechaDevolucionEsperada && (
                    <p className="mt-1 text-sm text-error">{errors.fechaDevolucionEsperada}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                    <FileText className="w-4 h-4" />
                    Notas (opcional)
                  </label>
                  <textarea
                    value={formData.notas}
                    onChange={handleChange('notas')}
                    placeholder="Notas adicionales sobre el préstamo..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card-bg text-text-primary placeholder-text-muted transition-colors focus-ring resize-none"
                  />
                  <p className="mt-1 text-xs text-text-muted text-right">
                    {formData.notas.length}/500
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={items.length === 0}
                >
                  Crear Préstamo
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrestamoForm;