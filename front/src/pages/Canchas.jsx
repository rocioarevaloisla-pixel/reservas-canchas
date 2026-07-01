import { useState, useEffect } from 'react';
import { canchas as canchasApi } from '../api/client';
import { useToast } from '../components/Toast';

export default function Canchas() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precioPorHora: '', capacidad: '', imagen: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = () => canchasApi.listar('todas=true').then(setList).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const validate = () => {
    if (!form.nombre.trim()) return 'El nombre es obligatorio';
    if (!form.precioPorHora || parseFloat(form.precioPorHora) <= 0) return 'El precio debe ser mayor a 0';
    if (!form.capacidad || parseInt(form.capacidad) <= 0) return 'La capacidad debe ser mayor a 0';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }
    try {
      const data = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precioPorHora: parseFloat(form.precioPorHora),
        capacidad: parseInt(form.capacidad),
        imagen: form.imagen.trim() || null,
      };
      if (editId) {
        await canchasApi.actualizar(editId, data);
        toast.success('Cancha actualizada correctamente');
      } else {
        await canchasApi.crear(data);
        toast.success('Cancha creada correctamente');
      }
      setForm({ nombre: '', descripcion: '', precioPorHora: '', capacidad: '', imagen: '' });
      setEditId(null);
      load();
    } catch (err) {
      const msg = err.data?.message || err.message || 'Error al guardar';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleActivar = async (id) => {
    setError('');
    try {
      await canchasApi.actualizar(id, { activo: true });
      toast.success('Cancha reactivada correctamente');
      load();
    } catch (err) {
      const msg = err.data?.message || err.message || 'Error al reactivar';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleEdit = (c) => {
    setForm({
      nombre: c.nombre,
      descripcion: c.descripcion || '',
      precioPorHora: c.precioPorHora,
      capacidad: c.capacidad,
      imagen: c.imagen || '',
    });
    setEditId(c.id);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar esta cancha? Las reservas activas no se verán afectadas.')) return;
    setError('');
    try {
      await canchasApi.eliminar(id);
      toast.success('Cancha desactivada correctamente');
      load();
    } catch (err) {
      const msg = err.data?.message || err.message || 'Error al eliminar';
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 style={{ margin: 0 }}>Gestión de Canchas</h1>
        <span className="badge activa">{list.filter(c => c.activo).length} activas</span>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="form-card">
        <h3>{editId ? 'Editar Cancha' : 'Nueva Cancha'}</h3>
        <form onSubmit={handleSubmit} className="form">
          <input
            placeholder="Nombre de la cancha"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
          <input
            placeholder="Descripción (opcional)"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
          <input
            type="number"
            placeholder="Precio por hora"
            value={form.precioPorHora}
            onChange={(e) => setForm({ ...form, precioPorHora: e.target.value })}
            required
            min="1"
            step="0.01"
          />
          <input
            type="number"
            placeholder="Capacidad (jugadores)"
            value={form.capacidad}
            onChange={(e) => setForm({ ...form, capacidad: e.target.value })}
            required
            min="1"
          />
          <input
            placeholder="URL de imagen (opcional)"
            value={form.imagen}
            onChange={(e) => setForm({ ...form, imagen: e.target.value })}
          />
          <button type="submit" className="btn-primary">
            {editId ? 'Actualizar' : 'Crear Cancha'}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditId(null);
                setForm({ nombre: '', descripcion: '', precioPorHora: '', capacidad: '', imagen: '' });
                setError('');
              }}
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="table-wrapper">
          <div className="skeleton-table">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-row" />)}
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Imagen</th>
                <th>Precio/hr</th>
                <th>Capacidad</th>
                <th>Profesionales</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.nombre}</strong></td>
                  <td>
                    {c.imagen ? (
                      <img src={c.imagen} alt={c.nombre} className="cancha-thumb" />
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                  <td>${Number(c.precioPorHora).toLocaleString()}</td>
                  <td>{c.capacidad} jug.</td>
                  <td style={{ fontSize: '0.85rem' }}>{c.Profesionales?.map(p => p.nombre).join(', ') || '—'}</td>
                  <td>
                    <span className={`badge ${c.activo ? 'activa' : 'cancelada'}`}>
                      {c.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group">
                      <button onClick={() => handleEdit(c)} className="btn-sm">Editar</button>
                      {c.activo ? (
                        <button onClick={() => handleDelete(c.id)} className="btn-sm btn-danger">Desactivar</button>
                      ) : (
                        <button onClick={() => handleActivar(c.id)} className="btn-sm btn-success">Reactivar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr className="table-empty"><td colSpan="6">
                  <div className="empty-state" style={{ padding: '20px' }}>
                    <div className="empty-icon">⚽</div>
                    <p>No hay canchas registradas</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>Crea tu primera cancha usando el formulario de arriba.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
