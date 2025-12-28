import { useState, useEffect } from 'react';
import localService from '../services/localService';
import bandaService from '../services/bandaService';
import usuarioService from '../services/usuarioService';
import { useAuth } from '../hooks/useAuth';

function Locales() {
  const { user } = useAuth();
  const [locales, setLocales] = useState([]);
  const [bandas, setBandas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingLocal, setEditingLocal] = useState(null);
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState('');
  const [formData, setFormData] = useState({
    nombre: ''
  });

  useEffect(() => {
    fetchLocales();
    fetchBandas();
    fetchUsuarios();
  }, []);

  const fetchLocales = async () => {
    try {
      setLoading(true);
      const response = await localService.getAll();
      const todosLocales = response.data || [];

      // Filtrar solo los locales donde el usuario es admin o miembro
      const misLocales = todosLocales.filter(local => {
        // Si es admin del local
        if (local.admin?.id === user?.id) return true;

        // Si es miembro del local (a través de usuarioLocales)
        if (local.usuarioLocales && local.usuarioLocales.some(ul => ul.usuario?.id === user?.id)) {
          return true;
        }

        return false;
      });

      setLocales(misLocales);
      setError(null);
    } catch (err) {
      setError('Error al cargar los locales');
      console.error('Error al cargar locales:', err);
      setLocales([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBandas = async () => {
    try {
      const response = await bandaService.getAll();
      setBandas(response.data);
    } catch (err) {
      console.error('Error al cargar bandas:', err);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await usuarioService.getAll();
      setUsuarios(response.data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const localData = {
        ...formData,
        admin: { id: user.id }
      };

      if (editingLocal) {
        await localService.update(editingLocal.id, localData);
      } else {
        await localService.create(localData);
      }
      fetchLocales();
      resetForm();
    } catch (err) {
      setError('Error al guardar el local');
      console.error(err);
    }
  };

  const handleEdit = (local) => {
    setEditingLocal(local);
    setFormData({
      nombre: local.nombre
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este local?')) {
      try {
        await localService.delete(id);
        fetchLocales();
      } catch (err) {
        setError('Error al eliminar el local');
        console.error(err);
      }
    }
  };

  const handleShowDetails = async (local) => {
    try {
      const response = await localService.getById(local.id);
      setSelectedLocal(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      setError('Error al cargar los detalles');
      console.error(err);
    }
  };

  const handleAddUsuario = async () => {
    if (!selectedUsuarioId) {
      alert('Por favor selecciona un usuario');
      return;
    }

    try {
      await localService.addUsuario(selectedLocal.id, selectedUsuarioId);
      const response = await localService.getById(selectedLocal.id);
      setSelectedLocal(response.data);
      setSelectedUsuarioId('');
      fetchLocales();
    } catch (err) {
      setError('Error al agregar usuario');
      console.error(err);
    }
  };

  const handleRemoveUsuario = async (usuarioId) => {
    if (window.confirm('¿Estás seguro de quitar este usuario del local?')) {
      try {
        await localService.removeUsuario(selectedLocal.id, usuarioId);
        const response = await localService.getById(selectedLocal.id);
        setSelectedLocal(response.data);
        fetchLocales();
      } catch (err) {
        setError('Error al quitar usuario');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: ''
    });
    setEditingLocal(null);
    setShowForm(false);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedLocal(null);
    setSelectedUsuarioId('');
  };

  // Obtener usuarios del local seleccionado
  const getLocalUsuarios = () => {
    if (!selectedLocal || !selectedLocal.usuarioLocales) return [];
    return selectedLocal.usuarioLocales.map(ul => ul.usuario);
  };

  // Obtener bandas del local seleccionado
  const getLocalBandas = () => {
    if (!selectedLocal) return [];
    return bandas.filter(b => b.local && b.local.id === selectedLocal.id);
  };

  // Filtrar usuarios que NO están en el local
  const getAvailableUsuarios = () => {
    const localUsuarios = getLocalUsuarios();
    const localUsuariosIds = localUsuarios.map(u => u.id);
    return usuarios.filter(u => !localUsuariosIds.includes(u.id));
  };

  if (loading) return <div className="loading">Cargando locales...</div>;

  return (
    <div className="locales-page">
      <div className="header">
        <h1>Gestión de Locales</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Nuevo Local
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingLocal ? 'Editar Local' : 'Nuevo Local'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingLocal ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedLocal && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>Detalles de "{selectedLocal.nombre}"</h2>

            <div className="details-section">
              <h3>Bandas del Local</h3>
              {getLocalBandas().length > 0 ? (
                <div className="bandas-list">
                  {getLocalBandas().map((banda) => (
                    <div key={banda.id} className="list-item">
                      <span className="item-name">{banda.nombre}</span>
                      <span className="item-description">{banda.descripcion || 'Sin descripción'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No hay bandas en este local</p>
              )}
            </div>

            <div className="details-section">
              <h3>Usuarios del Local</h3>
              {getLocalUsuarios().length > 0 ? (
                <div className="usuarios-list">
                  {getLocalUsuarios().map((usuario) => (
                    <div key={usuario.id} className="list-item">
                      <span className="item-name">{usuario.nombre} {usuario.apellido}</span>
                      <span className="item-email">{usuario.email}</span>
                      <button
                        onClick={() => handleRemoveUsuario(usuario.id)}
                        className="btn-delete-small"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No hay usuarios en este local</p>
              )}
            </div>

            <div className="add-section">
              <h3>Agregar Usuario</h3>
              <div className="add-form">
                <select
                  value={selectedUsuarioId}
                  onChange={(e) => setSelectedUsuarioId(e.target.value)}
                  className="select-usuario"
                >
                  <option value="">Seleccionar usuario...</option>
                  {getAvailableUsuarios().map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} {usuario.apellido} ({usuario.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddUsuario}
                  className="btn-primary"
                  disabled={!selectedUsuarioId}
                >
                  Agregar
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={closeDetailsModal} className="btn-secondary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="locales-grid">
        {locales.map((local) => (
          <div key={local.id} className="local-card">
            <h3>{local.nombre}</h3>
            <p className="local-admin">
              <strong>Admin:</strong> {local.admin?.nombre} {local.admin?.apellido}
            </p>
            <div className="card-actions">
              <button onClick={() => handleShowDetails(local)} className="btn-info">
                Ver Detalles
              </button>
              <button onClick={() => handleEdit(local)} className="btn-edit">
                Editar
              </button>
              <button onClick={() => handleDelete(local.id)} className="btn-delete">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {locales.length === 0 && !loading && (
        <div className="empty-state">
          <p>No hay locales registrados</p>
        </div>
      )}
    </div>
  );
}

export default Locales;