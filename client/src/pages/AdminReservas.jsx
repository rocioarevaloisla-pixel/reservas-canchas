import { useState, useEffect } from 'react';
import { reservas as reservasApi } from '../api/client';
import { useToast } from '../components/Toast';

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
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} onClick={() => setSelected(r)} style={{ cursor: 'pointer' }}>
                  <td><strong>{r.Cancha?.nombre}</strong></td>
                  <td>{r.User?.nombre}<br /><small>{r.User?.email}</small></td>
                  <td>{r.fecha}</td>
                  <td>{r.horaInicio.slice(0, 5)} - {r.horaFin.slice(0, 5)}</td>
                  <td>${Number(r.precioTotal).toLocaleString()}</td>
                  <td><span className={`badge ${r.estado}`}>{r.estado === 'activa' ? 'Activa' : 'Cancelada'}</span></td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr className="table-empty"><td colSpan="6">
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
              <p className="precio"><strong>💰 Total:</strong> ${Number(selected.precioTotal).toLocaleString()}</p>
              <p><strong>📌 Estado:</strong> {selected.estado === 'activa' ? 'Activa' : 'Cancelada'}</p>
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
