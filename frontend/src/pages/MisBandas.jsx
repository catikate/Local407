import { useState, useEffect } from 'react';
import bandaService from '../services/bandaService';
import localService from '../services/localService';
import { useAuth } from '../hooks/useAuth';

function MisBandas() {
  const { user } = useAuth();
  const [todasBandas, setTodasBandas] = useState([]);
  const [misBandas, setMisBandas] = useState([]);
  const [locales, setLocales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    local: { id: '' }
  });

  useEffect(() => {
    fetchBandas();
    fetchLocales();
  }, []);

  const fetchBandas = async () => {
    try {
      setLoading(true);
      const response = await bandaService.getAll();
      const todasLasBandas = response.data;
      setTodasBandas(todasLasBandas);

      // Filtrar bandas del usuario
      const bandasDelUsuario = todasLasBandas.filter(banda =>
        banda.miembros && banda.miembros.some(m => m.id === user.id)
      );
      setMisBandas(bandasDelUsuario);
      setError(null);
    } catch (err) {
      setError('Error al cargar las bandas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocales = async () => {
    try {
      const response = await localService.getAll();
      setLocales(response.data);
    } catch (err) {
      console.error('Error al cargar locales:', err);
    }
  };

  const handleCreateBanda = async (e) => {
    e.preventDefault();
    try {
      const nuevaBanda = await bandaService.create(formData);
      // Unirse automáticamente a la banda creada
      await bandaService.unirseABanda(nuevaBanda.data.id, user.id);
      fetchBandas();
      resetForm();
    } catch (err) {
      setError('Error al crear la banda');
      console.error(err);
    }
  };

  const handleUnirseABanda = async (bandaId) => {
    try {
      await bandaService.unirseABanda(bandaId, user.id);
      fetchBandas();
      setShowJoinModal(false);
    } catch (err) {
      setError('Error al unirse a la banda');
      console.error(err);
    }
  };

  const handleSalirDeBanda = async (bandaId) => {
    if (window.confirm('¿Estás seguro de salir de esta banda?')) {
      try {
        await bandaService.removeMiembro(bandaId, user.id);
        fetchBandas();
      } catch (err) {
        setError('Error al salir de la banda');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      local: { id: '' }
    });
    setShowCreateModal(false);
  };

  // Bandas disponibles para unirse (que no estoy ya dentro)
  const getBandasDisponibles = () => {
    const misBandasIds = misBandas.map(b => b.id);
    return todasBandas.filter(b => !misBandasIds.includes(b.id));
  };

  if (loading) return <div className="loading">Cargando bandas...</div>;

  return (
    <div className="mis-bandas-page">
      <div className="header">
        <h1>Mis Bandas</h1>
        <div className="header-actions">
          <button onClick={() => setShowJoinModal(true)} className="btn-secondary">
            Unirme a Banda
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            + Crear Banda
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Modal para crear banda */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Crear Nueva Banda</h2>
            <form onSubmit={handleCreateBanda}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Local *</label>
                <select
                  value={formData.local.id}
                  onChange={(e) => setFormData({ ...formData, local: { id: e.target.value } })}
                  required
                >
                  <option value="">Seleccionar local</option>
                  {locales.map((local) => (
                    <option key={local.id} value={local.id}>
                      {local.nombre}
                    </option>
                  ))}
                </select>
                <small className="form-hint">Te unirás automáticamente a este local</small>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear y Unirme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para unirse a banda */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Unirme a una Banda</h2>
            {getBandasDisponibles().length > 0 ? (
              <div className="bandas-disponibles">
                {getBandasDisponibles().map((banda) => (
                  <div key={banda.id} className="banda-disponible-item">
                    <div className="banda-info">
                      <h4>{banda.nombre}</h4>
                      <p>{banda.descripcion || 'Sin descripción'}</p>
                      <span className="banda-local">Local: {banda.local?.nombre}</span>
                    </div>
                    <button
                      onClick={() => handleUnirseABanda(banda.id)}
                      className="btn-primary"
                    >
                      Unirme
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">Ya estás en todas las bandas disponibles</p>
            )}
            <div className="modal-actions">
              <button onClick={() => setShowJoinModal(false)} className="btn-secondary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mis bandas */}
      <div className="mis-bandas-grid">
        {misBandas.map((banda) => (
          <div key={banda.id} className="banda-card">
            <h3>{banda.nombre}</h3>
            <p className="banda-descripcion">{banda.descripcion || 'Sin descripción'}</p>
            <p className="banda-local">
              <strong>Local:</strong> {banda.local?.nombre || 'N/A'}
            </p>
            <p className="banda-miembros">
              <strong>Miembros:</strong> {banda.miembros?.length || 0}
            </p>
            <div className="card-actions">
              <button onClick={() => handleSalirDeBanda(banda.id)} className="btn-delete">
                Salir de Banda
              </button>
            </div>
          </div>
        ))}
      </div>

      {misBandas.length === 0 && !loading && (
        <div className="empty-state">
          <p>No estás en ninguna banda</p>
          <p>Crea una nueva banda o únete a una existente</p>
        </div>
      )}
    </div>
  );
}

export default MisBandas;