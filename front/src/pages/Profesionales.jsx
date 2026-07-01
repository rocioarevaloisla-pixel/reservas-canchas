import { useState, useEffect } from 'react';
import { profesionales as profesionalesApi, canchas as canchasApi, servicios as serviciosApi } from '../api/client';
import { useToast } from '../components/Toast';

export default function Profesionales() {
  const [list, setList] = useState([]);
  const [canchasList, setCanchasList] = useState([]);
  const [form, setForm] = useState({ nombre: '', especialidad: '', telefono: '', emailContacto: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [asignando, setAsignando] = useState(null);
  const [selectedCanchas, setSelectedCanchas] = useState([]);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([
      profesionalesApi.listar('todas=true'),
      canchasApi.listar('todas=true'),
    ])
      .then(([profs, canchas]) => {
        setList(profs);
        setCanchasList(canchas);
      })
      .catch((err) => toast.error(err.data?.message || 'Error al cargar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    try {
      if (editId) {
        await profesionalesApi.actualizar(editId, { nombre: form.nombre.trim(), especialidad: form.especialidad.trim(), telefono: form.telefono.trim() || undefined, emailContacto: form.emailContacto.trim() || undefined });
        toast.success('Profesional actualizado correctamente');
      } else {
        await profesionalesApi.crear({ nombre: form.nombre.trim(), especialidad: form.especialidad.trim(), telefono: form.telefono.trim() || undefined, emailContacto: form.emailContacto.trim() || undefined });
        toast.success('Profesional creado correctamente');
      }
      setForm({ nombre: '', especialidad: '', telefono: '', emailContacto: '' });
      setEditId(null);
      load();
    } catch (err) {
      const msg = err.data?.message || err.message || 'Error al guardar';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleEdit = (p) => {
    setForm({ nombre: p.nombre, especialidad: p.especialidad || '', telefono: p.telefono || '', emailContacto: p.emailContacto || '' });
    setEditId(p.id);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este profesional?')) return;
    setError('');
    try {
      await profesionalesApi.eliminar(id);
      toast.success('Profesional desactivado');
      load();
    } catch (err) {
      const msg = err.data?.message || err.message || 'Error al desactivar';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReactivar = async (id) => {
    try {
      await profesionalesApi.actualizar(id, { activo: true });
      toast.success('Profesional reactivado');
      load();
    } catch (err) {
      toast.error(err.data?.message || 'Error al reactivar');
    }
  };

  const handleEliminarPermanente = async (id) => {
    if (!confirm('¿Eliminar permanentemente este profesional? Esta acción no se puede deshacer.')) return;
    try {
      await profesionalesApi.eliminarPermanente(id);
      toast.success('Profesional eliminado permanentemente');
      load();
    } catch (err) {
      toast.error(err.data?.message || 'Error al eliminar');
    }
  };

  const openAsignar = (p) => {
    setAsignando(p);
    setSelectedCanchas(p.Canchas?.map(c => c.id) || []);
  };

  const handleAsignar = async () => {
    if (!asignando) return;
    try {
      await profesionalesApi.asignarCanchas(asignando.id, selectedCanchas);
      toast.success('Canchas asignadas correctamente');
      setAsignando(null);
      load();
    } catch (err) {
      toast.error(err.data?.message || 'Error al asignar');
    }
  };

  const toggleCancha = (id) => {
    setSelectedCanchas(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const [serviciosModal, setServiciosModal] = useState(null);
  const [serviciosList, setServiciosList] = useState([]);
  const [servForm, setServForm] = useState({ nombre: '', descripcion: '', precio: '' });
  const [servEditId, setServEditId] = useState(null);

  const loadServicios = async (profesionalId) => {
    try {
      const data = await serviciosApi.listar(profesionalId);
      setServiciosList(data);
    } catch {
      setServiciosList([]);
    }
  };

  const openServicios = (p) => {
    setServiciosModal(p);
    setServForm({ nombre: '', descripcion: '', precio: '' });
    setServEditId(null);
    loadServicios(p.id);
  };

  const handleServSubmit = async (e) => {
    e.preventDefault();
    if (!servForm.nombre.trim() || !servForm.precio || parseFloat(servForm.precio) <= 0) return;
    try {
      if (servEditId) {
        await serviciosApi.actualizar(servEditId, {
          nombre: servForm.nombre.trim(),
          descripcion: servForm.descripcion.trim(),
          precio: parseFloat(servForm.precio),
        });
        toast.success('Servicio actualizado');
      } else {
        await serviciosApi.crear(serviciosModal.id, {
          nombre: servForm.nombre.trim(),
          descripcion: servForm.descripcion.trim(),
          precio: parseFloat(servForm.precio),
        });
        toast.success('Servicio creado');
      }
      setServForm({ nombre: '', descripcion: '', precio: '' });
      setServEditId(null);
      loadServicios(serviciosModal.id);
    } catch (err) {
      toast.error(err.data?.message || 'Error al guardar servicio');
    }
  };

  const handleServEdit = (s) => {
    setServForm({ nombre: s.nombre, descripcion: s.descripcion || '', precio: s.precio });
    setServEditId(s.id);
  };

  const handleServDelete = async (id) => {
    if (!confirm('¿Desactivar este servicio?')) return;
    try {
      await serviciosApi.eliminar(id);
      toast.success('Servicio desactivado');
      loadServicios(serviciosModal.id);
    } catch (err) {
      toast.error(err.data?.message || 'Error al eliminar');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 style={{ margin: 0 }}>Gestión de Profesionales</h1>
        <span className="badge activa">{list.filter(p => p.activo).length} activos</span>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="form-card">
        <h3>{editId ? 'Editar Profesional' : 'Nuevo Profesional'}</h3>
        <form onSubmit={handleSubmit} className="form">
          <input
            placeholder="Nombre del profesional"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
          <input
            placeholder="Especialidad (ej. Árbitro, Instructor, Entrenador)"
            value={form.especialidad}
            onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
          />
          <div className="form-row">
            <input
              placeholder="Teléfono de contacto"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              style={{ flex: 1 }}
            />
            <input
              placeholder="Email de contacto"
              type="email"
              value={form.emailContacto}
              onChange={(e) => setForm({ ...form, emailContacto: e.target.value })}
              style={{ flex: 1 }}
            />
          </div>
          <button type="submit" className="btn-primary">
            {editId ? 'Actualizar' : 'Crear Profesional'}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditId(null);
                setForm({ nombre: '', especialidad: '' });
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
            {[1, 2, 3].map(i => <div key={i} className="skeleton-row" />)}
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Especialidad</th>
                <th>Contacto</th>
                <th>Canchas asignadas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.nombre}</strong></td>
                  <td>{p.especialidad || '—'}</td>
                  <td>
                    {p.telefono || p.emailContacto ? (
                      <div style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                        {p.telefono && <div>📞 {p.telefono}</div>}
                        {p.emailContacto && <div>✉️ {p.emailContacto}</div>}
                      </div>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>}
                  </td>
                  <td>{p.Canchas?.map(c => c.nombre).join(', ') || '—'}</td>
                  <td>
                    <span className={`badge ${p.activo ? 'activa' : 'cancelada'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group">
                      <button onClick={() => openServicios(p)} className="btn-sm">Servicios</button>
                      <button onClick={() => openAsignar(p)} className="btn-sm">Asignar</button>
                      <button onClick={() => handleEdit(p)} className="btn-sm">Editar</button>
                      {p.activo ? (
                        <button onClick={() => handleDelete(p.id)} className="btn-sm btn-danger">Desactivar</button>
                      ) : (
                        <>
                          <button onClick={() => handleReactivar(p.id)} className="btn-sm btn-success">Reactivar</button>
                          <button onClick={() => handleEliminarPermanente(p.id)} className="btn-sm btn-danger" style={{ opacity: 0.7 }}>Eliminar</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr className="table-empty"><td colSpan="6">
                  <div className="empty-state" style={{ padding: '20px' }}>
                    <div className="empty-icon">👤</div>
                    <p>No hay profesionales registrados</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {serviciosModal && (
        <div className="modal-overlay" onClick={() => { setServiciosModal(null); setServEditId(null); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3>Servicios de {serviciosModal.nombre}</h3>
            <p style={{ marginBottom: '16px', color: 'var(--text-light)', fontSize: '0.85rem' }}>
              {serviciosModal.especialidad && `(${serviciosModal.especialidad}) `}
              Agrega servicios adicionales que este profesional puede ofrecer al reservar.
            </p>

            <form onSubmit={handleServSubmit} className="form" style={{ marginBottom: '20px', padding: '14px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
              <input
                placeholder="Nombre del servicio"
                value={servForm.nombre}
                onChange={(e) => setServForm({ ...servForm, nombre: e.target.value })}
                required
              />
              <input
                placeholder="Descripción (opcional)"
                value={servForm.descripcion}
                onChange={(e) => setServForm({ ...servForm, descripcion: e.target.value })}
              />
              <input
                type="number"
                placeholder="Precio adicional"
                value={servForm.precio}
                onChange={(e) => setServForm({ ...servForm, precio: e.target.value })}
                required
                min="1"
                step="0.01"
              />
              <div className="btn-group">
                <button type="submit" className="btn-primary">
                  {servEditId ? 'Actualizar' : 'Agregar Servicio'}
                </button>
                {servEditId && (
                  <button type="button" className="btn-secondary" onClick={() => { setServForm({ nombre: '', descripcion: '', precio: '' }); setServEditId(null); }}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {serviciosList.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No hay servicios registrados</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {serviciosList.map(s => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)', background: 'var(--card-bg)',
                  }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.9rem' }}>{s.nombre}</strong>
                      {s.descripcion && <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{s.descripcion}</p>}
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.9rem' }}>${Number(s.precio).toLocaleString()}</span>
                    <button onClick={() => handleServEdit(s)} className="btn-sm">Editar</button>
                    {s.activo && <button onClick={() => handleServDelete(s.id)} className="btn-sm btn-danger">Desactivar</button>}
                  </div>
                ))}
              </div>
            )}

            <div className="btn-group" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => { setServiciosModal(null); setServEditId(null); }} className="btn-secondary">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {asignando && (
        <div className="modal-overlay" onClick={() => setAsignando(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Asignar canchas a {asignando.nombre}</h3>
            <p style={{ marginBottom: '16px', color: 'var(--text-light)', fontSize: '0.85rem' }}>
              Selecciona las canchas donde este profesional puede trabajar
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {canchasList.filter(c => c.activo).map(c => (
                <label key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  border: selectedCanchas.includes(c.id) ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedCanchas.includes(c.id) ? 'var(--primary-light)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <input
                    type="checkbox"
                    checked={selectedCanchas.includes(c.id)}
                    onChange={() => toggleCancha(c.id)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <div>
                    <strong>{c.nombre}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginLeft: '8px' }}>
                      ${Number(c.precioPorHora).toLocaleString()}/hr
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
              <button onClick={() => setAsignando(null)} className="btn-secondary">Cancelar</button>
              <button onClick={handleAsignar} className="btn-primary">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
