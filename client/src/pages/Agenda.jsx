import { useState, useEffect } from 'react';
import { reservas as reservasApi } from '../api/client';
import { useToast } from '../components/Toast';

export default function Agenda() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [reservasList, setReservasList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = (f) => {
    setLoading(true);
    setError('');
    reservasApi.listar(f || fecha)
      .then(setReservasList)
      .catch((err) => {
        const msg = err.data?.message || err.message || 'Error al cargar';
        setError(msg);
        toast.error(msg);
        setReservasList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [fecha]);

  const cambiarFecha = (dias) => {
    const d = new Date(fecha);
    d.setDate(d.getDate() + dias);
    setFecha(d.toISOString().split('T')[0]);
  };

  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className="container">
      <div className="page-header">
        <h1 style={{ margin: 0 }}>Agenda del Día</h1>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="form-card">
        <div className="form-row" style={{ alignItems: 'center' }}>
          <button onClick={() => cambiarFecha(-1)} className="btn-sm">← Día anterior</button>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={{ flex: '0 0 auto', width: 'auto', minWidth: '180px' }}
          />
          <button onClick={() => cambiarFecha(1)} className="btn-sm">Día siguiente →</button>
          {fecha !== hoy && (
            <button onClick={() => setFecha(hoy)} className="btn-link">Hoy</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando agenda...</div>
      ) : (
        <>
          {reservasList.length > 0 && (
            <p style={{ marginBottom: '16px', color: 'var(--text-light)', fontSize: '0.85rem' }}>
              {reservasList.length} reserva{reservasList.length !== 1 ? 's' : ''} para {fecha}
            </p>
          )}

          <div className="agenda-timeline">
            {reservasList.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <p>No hay reservas para esta fecha</p>
              </div>
            ) : (
              reservasList.map((r) => (
                <div key={r.id} className="agenda-item">
                  <div className="agenda-hora">
                    {r.horaInicio.slice(0, 5)} — {r.horaFin.slice(0, 5)}
                  </div>
                  <div className="agenda-info">
                    <strong>{r.Cancha?.nombre}</strong>
                    <span>
                      {r.User?.nombre} ({r.User?.email})
                    </span>
                    <span className="precio">${Number(r.precioTotal).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
