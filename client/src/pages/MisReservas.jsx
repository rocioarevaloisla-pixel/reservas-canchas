import { useState, useEffect } from 'react';
import { reservas as reservasApi } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export default function MisReservas() {
  const [reservasList, setReservasList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
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

  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar esta reserva? El horario quedará disponible para otros usuarios.')) return;
    setError('');
    try {
      await reservasApi.cancelar(id);
      toast.success('Reserva cancelada correctamente');
      setReservasList((prev) => prev.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r));
      setSelected(null);
    } catch (err) {
      const msg = err.data?.message || err.message || 'Error al cancelar';
      setError(msg);
      toast.error(msg);
    }
  };

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
                <th>Fecha</th>
                <th>Hora</th>
                <th>Total</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reservasList.map((r) => (
                <tr key={r.id} onClick={() => setSelected(r)} style={{ cursor: 'pointer' }}>
                  <td><strong>{r.Cancha?.nombre}</strong></td>
                  <td>{r.fecha}</td>
                  <td>{r.horaInicio.slice(0, 5)} - {r.horaFin.slice(0, 5)}</td>
                  <td>${Number(r.precioTotal).toLocaleString()}</td>
                  <td><span className={`badge ${r.estado}`}>{r.estado === 'activa' ? 'Activa' : 'Cancelada'}</span></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {r.estado === 'activa' && (
                      <button onClick={() => handleCancel(r.id)} className="btn-sm btn-danger">
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
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

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">✅</div>
            <h2>Detalle de Reserva</h2>
            <div className="confirm-detalle">
              <p><strong>⚽ Cancha:</strong> {selected.Cancha?.nombre}</p>
              <p><strong>📅 Fecha:</strong> {selected.fecha}</p>
              <p><strong>⏰ Horario:</strong> {selected.horaInicio.slice(0, 5)} - {selected.horaFin.slice(0, 5)}</p>
              <p className="precio"><strong>💰 Total:</strong> ${Number(selected.precioTotal).toLocaleString()}</p>
              <p><strong>📌 Estado:</strong> {selected.estado === 'activa' ? 'Activa' : 'Cancelada'}</p>
            </div>
            <div className="btn-group" style={{ justifyContent: 'center' }}>
              {selected.estado === 'activa' && (
                <button onClick={() => handleCancel(selected.id)} className="btn-danger" style={{ padding: '12px 24px', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: '0.9rem' }}>
                  Cancelar Reserva
                </button>
              )}
              <button onClick={() => setSelected(null)} className="btn-primary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
