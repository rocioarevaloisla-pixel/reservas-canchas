import { useState, useEffect } from 'react';
import { reservas as reservasApi } from '../api/client';
import { useToast } from '../components/Toast';

const estadoLabel = { pendiente: 'Pendiente', confirmado: 'Asistirá', rechazado: 'No asiste' };
const estadoColor = { pendiente: '#fef3c7', confirmado: '#d1fae5', rechazado: '#fee2e2' };
const estadoTextColor = { pendiente: '#92400e', confirmado: '#065f46', rechazado: '#991b1b' };

export default function AdminReservas() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    reservasApi.listar()
      .then(setList)
      .catch((err) => {
        const msg = err.data?.message || err.message || 'Error al cargar';
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleConfirmacion = async (id, estado) => {
    try {
      await reservasApi.actualizarConfirmacionProfesional(id, estado);
      toast.success('Estado actualizado');
      setList(prev => prev.map(r => r.id === id ? { ...r, confirmacionProfesional: estado } : r));
      if (selected?.id === id) setSelected({ ...selected, confirmacionProfesional: estado });
    } catch (err) {
      toast.error(err.data?.message || 'Error al actualizar');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 style={{ margin: 0 }}>Todas las Reservas</h1>
        <span className="badge activa">{list.length} reservas</span>
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
                <th>Cancha</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Servicio</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Profesional</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} onClick={() => setSelected(r)} style={{ cursor: 'pointer' }}>
                  <td><strong>{r.Cancha?.nombre}</strong></td>
                  <td>{r.User?.nombre}<br /><small>{r.User?.email}</small></td>
                  <td>{r.fecha}</td>
                  <td>{r.horaInicio.slice(0, 5)} - {r.horaFin.slice(0, 5)}</td>
                  <td>{r.Servicio?.nombre || '—'}</td>
                  <td>${Number(r.precioTotal).toLocaleString()}</td>
                  <td><span className={`badge ${r.vencida ? 'vencida' : r.estado}`}>{r.vencida ? 'Vencida' : r.estado === 'activa' ? 'Activa' : 'Cancelada'}</span></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {r.Servicio ? (
                      <select
                        value={r.confirmacionProfesional || 'pendiente'}
                        onChange={(e) => handleConfirmacion(r.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          background: estadoColor[r.confirmacionProfesional || 'pendiente'],
                          color: estadoTextColor[r.confirmacionProfesional || 'pendiente'],
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmado">Asistirá</option>
                        <option value="rechazado">No asiste</option>
                      </select>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr className="table-empty"><td colSpan="8">
                  <div className="empty-state" style={{ padding: '20px' }}>
                    <div className="empty-icon">📋</div>
                    <p>No hay reservas registradas</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">📋</div>
            <h2>Detalle de Reserva</h2>
            <div className="confirm-detalle">
              <p><strong>⚽ Cancha:</strong> {selected.Cancha?.nombre}</p>
              <p><strong>👤 Cliente:</strong> {selected.User?.nombre} ({selected.User?.email})</p>
              <p><strong>📅 Fecha:</strong> {selected.fecha}</p>
              <p><strong>⏰ Horario:</strong> {selected.horaInicio.slice(0, 5)} - {selected.horaFin.slice(0, 5)}</p>
              {selected.Servicio && (
                <p><strong>🔧 Servicio:</strong> {selected.Servicio.nombre} (+${Number(selected.Servicio.precio).toLocaleString()})</p>
              )}
              {selected.Servicio && selected.Cancha?.Profesionales?.length > 0 && (
                <div>
                  <p><strong>👤 Profesional(es):</strong></p>
                  {selected.Cancha.Profesionales.map(p => (
                    <p key={p.id} style={{ marginLeft: '12px', fontSize: '0.9rem' }}>
                      {p.nombre}
                      {p.telefono && <span style={{ color: 'var(--text-light)' }}> — 📞 {p.telefono}</span>}
                      {p.emailContacto && <span style={{ color: 'var(--text-light)' }}> — ✉️ {p.emailContacto}</span>}
                    </p>
                  ))}
                </div>
              )}
              <p className="precio"><strong>💰 Total:</strong> ${Number(selected.precioTotal).toLocaleString()}</p>
              <p><strong>📌 Estado:</strong> {selected.vencida ? 'Vencida' : selected.estado === 'activa' ? 'Activa' : 'Cancelada'}</p>
              {selected.Servicio && (
                <p>
                  <strong>👤 Confirmación profesional:</strong>{' '}
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: estadoColor[selected.confirmacionProfesional || 'pendiente'],
                    color: estadoTextColor[selected.confirmacionProfesional || 'pendiente'],
                    fontWeight: 600,
                  }}>
                    {estadoLabel[selected.confirmacionProfesional || 'pendiente']}
                  </span>
                </p>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="btn-primary">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
