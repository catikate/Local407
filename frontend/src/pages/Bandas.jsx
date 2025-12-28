import { useState, useEffect } from 'react';
import bandaService from '../services/bandaService';
import localService from '../services/localService';
import usuarioService from '../services/usuarioService';

function Bandas() {
  const [bandas, setBandas] = useState([]);
  const [locales, setLocales] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [editingBanda, setEditingBanda] = useState(null);
  const [selectedBanda, setSelectedBanda] = useState(null);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    local: { id: '' }
  });

  useEffect(() => {
    fetchBandas();
    fetchLocales();
    fetchUsuarios();
  }, []);

  const fetchBandas = async () => {
    try {
      setLoading(true);
      const response = await bandaService.getAll();
      setBandas(response.data);
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
      if (editingBanda) {
        await bandaService.update(editingBanda.id, formData);
      } else {
        await bandaService.create(formData);
      }
      fetchBandas();
      resetForm();
    } catch (err) {
      setError('Error al guardar la banda');
      console.error(err);
    }
  };

  const handleEdit = (banda) => {
    setEditingBanda(banda);
    setFormData({
      nombre: banda.nombre,
      descripcion: banda.descripcion || '',
      local: { id: banda.local.id }
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta banda?')) {
      try {
        await bandaService.delete(id);
        fetchBandas();
      } catch (err) {
        setError('Error al eliminar la banda');
        console.error(err);
      }
    }
  };

  const handleManageMembers = async (banda) => {
    try {
      const response = await bandaService.getById(banda.id);
      setSelectedBanda(response.data);
      setShowMembersModal(true);
    } catch (err) {
      setError('Error al cargar los miembros');
      console.error(err);
    }
  };

  const handleAddMiembro = async () => {
    if (!selectedUsuarioId) {
      alert('Por favor selecciona un usuario');
      return;
    }

    try {
      await bandaService.addMiembro(selectedBanda.id, selectedUsuarioId);
      const response = await bandaService.getById(selectedBanda.id);
      setSelectedBanda(response.data);
      setSelectedUsuarioId('');
      fetchBandas();
    } catch (err) {
      setError('Error al agregar miembro');
      console.error(err);
    }
  };

  const handleRemoveMiembro = async (usuarioId) => {
    if (window.confirm('¿Estás seguro de quitar este miembro de la banda?')) {
      try {
        await bandaService.removeMiembro(selectedBanda.id, usuarioId);
        const response = await bandaService.getById(selectedBanda.id);
        setSelectedBanda(response.data);
        fetchBandas();
      } catch (err) {
        setError('Error al quitar miembro');
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
    setEditingBanda(null);
    setShowForm(false);
  };

  const closeMembersModal = () => {
    setShowMembersModal(false);
    setSelectedBanda(null);
    setSelectedUsuarioId('');
  };

  // Filtrar usuarios que NO están en la banda
  const getAvailableUsuarios = () => {
    if (!selectedBanda) return usuarios;
    const miembrosIds = selectedBanda.miembros?.map(m => m.id) || [];
    return usuarios.filter(u => !miembrosIds.includes(u.id));
  };

  if (loading) return <div className="loading">Cargando bandas...</div>;

  return (
    <div className="bandas-page">
      <div className="header">
        <h1>Gestión de Bandas</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Nueva Banda
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingBanda ? 'Editar Banda' : 'Nueva Banda'}</h2>
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
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingBanda ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMembersModal && selectedBanda && (
        <div className="modal-overlay" onClick={closeMembersModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>Miembros de "{selectedBanda.nombre}"</h2>

            <div className="members-section">
              <h3>Miembros Actuales</h3>
              {selectedBanda.miembros && selectedBanda.miembros.length > 0 ? (
                <div className="members-list">
                  {selectedBanda.miembros.map((miembro) => (
                    <div key={miembro.id} className="member-item">
                      <span>{miembro.nombre} {miembro.apellido}</span>
                      <span className="member-email">{miembro.email}</span>
                      <button
                        onClick={() => handleRemoveMiembro(miembro.id)}
                        className="btn-delete-small"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No hay miembros en esta banda</p>
              )}
            </div>

            <div className="add-member-section">
              <h3>Agregar Miembro</h3>
              <div className="add-member-form">
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
                  onClick={handleAddMiembro}
                  className="btn-primary"
                  disabled={!selectedUsuarioId}
                >
                  Agregar
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={closeMembersModal} className="btn-secondary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bandas-grid">
        {bandas.map((banda) => (
          <div key={banda.id} className="banda-card">
            <h3>{banda.nombre}</h3>
            <p className="banda-descripcion">{banda.descripcion || 'Sin descripción'}</p>
            <p className="banda-local">
              <strong>Local:</strong> {banda.local?.nombre || 'N/A'}
            </p>
            <div className="card-actions">
              <button onClick={() => handleManageMembers(banda)} className="btn-info">
                Miembros
              </button>
              <button onClick={() => handleEdit(banda)} className="btn-edit">
                Editar
              </button>
              <button onClick={() => handleDelete(banda.id)} className="btn-delete">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {bandas.length === 0 && !loading && (
        <div className="empty-state">
          <p>No hay bandas registradas</p>
        </div>
      )}
    </div>
  );
}

export default Bandas;