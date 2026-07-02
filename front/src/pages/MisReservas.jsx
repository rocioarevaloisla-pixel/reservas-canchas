import { useState, useEffect } from 'react';
import { reservas as reservasApi } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import Calendar from '../components/Calendar';
import ConfirmModal from '../components/ConfirmModal';

function estadoReserva(r) {
  if (r.estado === 'cancelada') return { label: 'Cancelada', cls: 'cancelada' };
  if (r.vencida) return { label: 'Vencida', cls: 'vencida' };
  return { label: 'Activa', cls: 'activa' };
}

export default function MisReservas() {
  const { user } = useAuth();
  const [reservasList, setReservasList] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [showInvoice, setShowInvoice] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [misMarcas, setMisMarcas] = useState({});
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    reservasApi.listar()
      .then(setReservasList)
      .catch((err) => {
        const msg = err.data?.message || err.message || 'Error al cargar';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    const d = new Date();
    reservasApi.resumenMesUsuario(d.getFullYear(), d.getMonth() + 1).then(setMisMarcas).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user || !fecha) return;
    const [y, m] = fecha.split('-').map(Number);
    reservasApi.resumenMesUsuario(y, m).then(setMisMarcas).catch(() => {});
  }, [fecha, user]);

  const handleFechaChange = (f) => {
    setFecha(f);
    setShowInvoice(null);
  };

  const handleMonthChange = (y, m) => {
    if (!user) return;
    reservasApi.resumenMesUsuario(y, m).then(setMisMarcas).catch(() => {});
  };

  const handleConfirmCancel = async () => {
    setError('');
    try {
      await reservasApi.cancelar(confirmCancelId);
      toast.success('Reserva cancelada correctamente');
      setReservasList((prev) => prev.map(r => r.id === confirmCancelId ? { ...r, estado: 'cancelada', vencida: false } : r));
      setShowInvoice(null);
    } catch (err) {
      const msg = err.data?.message || err.message || 'Error al cancelar';
      setError(msg);
      toast.error(msg);
    } finally {
      setConfirmCancelId(null);
    }
  };

  const handleCancel = (id) => {
    setConfirmCancelId(id);
  };

  const maxDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  })();

  const reservasFiltradas = reservasList.filter(r => r.fecha === fecha);

  return (
    <div className="container">
      <div className="page-header">
        <h1 style={{ margin: 0 }}>Mis Reservas</h1>
        <button onClick={() => navigate('/reservar')} className="btn-primary">
          + Nueva Reserva
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="table-wrapper" style={{ marginTop: '20px' }}>
          <div className="skeleton-table">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-row" />)}
          </div>
        </div>
      ) : (
        <div className="table-wrapper" style={{ marginTop: '20px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Cancha</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Total</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reservasList.map((r) => {
                const est = estadoReserva(r);
                return (
                  <tr key={r.id} onClick={() => setShowInvoice(r)} style={{ cursor: 'pointer' }}>
                    <td><strong>{r.Cancha?.nombre}</strong></td>
                    <td>{r.fecha}</td>
                    <td>{r.horaInicio.slice(0, 5)} - {r.horaFin.slice(0, 5)}</td>
                    <td>${Number(r.precioTotal).toLocaleString()}</td>
                    <td><span className={`badge ${est.cls}`}>{est.label}</span></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {r.estado === 'activa' && !r.vencida && (
                        <button onClick={() => handleCancel(r.id)} className="btn-sm btn-danger">
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {reservasList.length === 0 && (
                <tr className="table-empty"><td colSpan="6">
                  <div className="empty-state" style={{ padding: '20px' }}>
                    <div className="empty-icon">📋</div>
                    <p>No hay reservas</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>¡Reserva una cancha!</p>
                    <button onClick={() => navigate('/reservar')} className="btn-primary" style={{ marginTop: '12px' }}>
                      Reservar Ahora
                    </button>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="cal-grid" style={{ marginTop: '24px' }}>
        <Calendar
          selected={fecha}
          onChange={handleFechaChange}
          minDate={new Date().toISOString().split('T')[0]}
          maxDate={maxDate}
          marcas={misMarcas}
          onMonthChange={handleMonthChange}
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>
            Reservas del {fecha}
          </h3>
          {reservasFiltradas.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-icon">📅</div>
              <p>No hay reservas para esta fecha</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {reservasFiltradas.map((r) => {
                const e = estadoReserva(r);
                return (
                  <div
                    key={r.id}
                    onClick={() => setShowInvoice(r)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '14px 18px', borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)', background: 'var(--card-bg)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: e.cls === 'cancelada' ? 'var(--danger-light)' : e.cls === 'vencida' ? '#fff3e0' : 'var(--success-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.3rem', flexShrink: 0,
                    }}>
                      {e.cls === 'cancelada' ? '❌' : e.cls === 'vencida' ? '⏰' : '⚽'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: '0.95rem' }}>{r.Cancha?.nombre}</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '2px' }}>
                        {r.horaInicio.slice(0, 5)} — {r.horaFin.slice(0, 5)}
                        {r.Servicio && <span> · 🔧 {r.Servicio.nombre}</span>}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700 }}>${Number(r.precioTotal).toLocaleString()}</span>
                      <p><span className={`badge ${e.cls}`} style={{ fontSize: '0.65rem' }}>{e.label}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showInvoice && (
        <div className="modal-overlay" onClick={() => setShowInvoice(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Detalle de Reserva</h3>
              <button className="modal-close" onClick={() => setShowInvoice(null)}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '2rem' }}>
                  {showInvoice.estado === 'cancelada' ? '❌' : showInvoice.vencida ? '⏰' : '🏟️'}
                </span>
                <h2 style={{ margin: '8px 0', fontSize: '1.2rem' }}>Reserva de Cancha</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Boleta de Confirmación</p>
                <span className={`badge ${estadoReserva(showInvoice).cls}`} style={{ marginTop: '6px', fontSize: '0.7rem' }}>
                  {estadoReserva(showInvoice).label}
                </span>
              </div>
              <div style={{ borderTop: '2px dashed var(--border)', borderBottom: '2px dashed var(--border)', padding: '16px 0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Cancha</span>
                  <span style={{ fontWeight: 600 }}>{showInvoice.Cancha?.nombre}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Fecha</span>
                  <span>{showInvoice.fecha}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Horario</span>
                  <span>{showInvoice.horaInicio.slice(0, 5)} — {showInvoice.horaFin.slice(0, 5)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Precio cancha</span>
                  <span>${Number(showInvoice.precioTotal).toLocaleString()}</span>
                </div>
                {showInvoice.Servicio && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-light)' }}>Servicio: {showInvoice.Servicio.nombre}</span>
                    <span style={{ color: 'var(--green)' }}>+${Number(showInvoice.Servicio.precio).toLocaleString()}</span>
                  </div>
                )}
                {showInvoice.Servicio?.Profesional && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    👤 {showInvoice.Servicio.Profesional.nombre}
                    {showInvoice.Servicio.Profesional.telefono && <span> — 📞 {showInvoice.Servicio.Profesional.telefono}</span>}
                    {showInvoice.Servicio.Profesional.emailContacto && <span> — ✉️ {showInvoice.Servicio.Profesional.emailContacto}</span>}
                  </div>
                )}
                {showInvoice.confirmacionProfesional && showInvoice.confirmacionProfesional !== 'pendiente' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-light)' }}>Profesional</span>
                    <span className={`badge ${showInvoice.confirmacionProfesional === 'confirmado' ? 'activa' : 'cancelada'}`}>
                      {showInvoice.confirmacionProfesional === 'confirmado' ? 'Confirmado' : 'Rechazado'}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', padding: '0 4px' }}>
                <span>Total</span>
                <span>${Number(showInvoice.precioTotal).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {showInvoice.estado === 'activa' && !showInvoice.vencida && (
                  <button onClick={() => handleCancel(showInvoice.id)} className="btn-danger" style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: '0.9rem' }}>
                    Cancelar Reserva
                  </button>
                )}
                <button onClick={() => setShowInvoice(null)} className="btn-primary" style={{ flex: 1 }}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmCancelId}
        title="Cancelar Reserva"
        message="¿Cancelar esta reserva? El horario quedará disponible para otros usuarios."
        confirmText="Sí, cancelar"
        cancelText="Volver"
        variant="danger"
        onConfirm={handleConfirmCancel}
        onCancel={() => setConfirmCancelId(null)}
      />
    </div>
  );
}