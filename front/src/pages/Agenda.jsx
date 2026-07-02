import { useState, useEffect, useCallback } from 'react';
import { reservas as reservasApi } from '../api/client';
import { useToast } from '../components/Toast';
import Calendar from '../components/Calendar';

export default function Agenda() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [reservasList, setReservasList] = useState([]);
  const [marcas, setMarcas] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [mesCal, setMesCal] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const loadResumen = useCallback(async (ano, mes) => {
    try {
      const data = await reservasApi.resumenMes(ano, mes);
      setMarcas(data);
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => {
    const [ano, mes] = mesCal.split('-').map(Number);
    loadResumen(ano, mes);
  }, [mesCal, loadResumen]);

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

  const hoy = new Date().toISOString().split('T')[0];

  const handleChangeFecha = (f) => {
    setFecha(f);
    const [ano, mes] = f.split('-').slice(0, 2).map(Number);
    setMesCal(`${ano}-${String(mes).padStart(2, '0')}`);
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 style={{ margin: 0 }}>Agenda del Día</h1>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="agenda-layout">
        <div className="agenda-cal-sidebar">
          <Calendar
            selected={fecha}
            onChange={handleChangeFecha}
            marcas={marcas}
          />
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-light)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--grass)', display: 'inline-block' }} />
              Con reservas
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border)', display: 'inline-block' }} />
              Sin reservas
            </span>
          </div>
        </div>

        <div className="agenda-main">
          <div className="agenda-date-nav">
            <button onClick={() => {
              const d = new Date(fecha);
              d.setDate(d.getDate() - 1);
              handleChangeFecha(d.toISOString().split('T')[0]);
            }} className="btn-sm">←</button>
            <span className="agenda-date-label">
              {new Date(fecha + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => {
              const d = new Date(fecha);
              d.setDate(d.getDate() + 1);
              handleChangeFecha(d.toISOString().split('T')[0]);
            }} className="btn-sm">→</button>
            {fecha !== hoy && (
              <button onClick={() => handleChangeFecha(hoy)} className="btn-link">Hoy</button>
            )}
          </div>

          {loading ? (
            <div className="loading" style={{ padding: '40px 0' }}>Cargando agenda...</div>
          ) : (
            <>
              {reservasList.length > 0 && (
                <p style={{ marginBottom: '14px', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                  {reservasList.length} reserva{reservasList.length !== 1 ? 's' : ''}
                </p>
              )}

              <div className="agenda-timeline">
                {reservasList.length === 0 ? (
                  <div className="empty-state" style={{ padding: '40px 20px' }}>
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
                        {r.Cancha?.Profesionales?.length > 0 && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                            👤 {r.Cancha.Profesionales.map(p => (
                              <span key={p.id}>
                                {p.nombre}
                                {p.telefono && <span style={{ color: 'var(--text-light)' }}> 📞{p.telefono}</span>}
                                {p.emailContacto && <span style={{ color: 'var(--text-light)' }}> ✉️{p.emailContacto}</span>}
                                {' '}
                              </span>
                            ))}
                          </span>
                        )}
                        {r.Servicio && (
                          <span style={{
                            display: 'inline-block',
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: r.confirmacionProfesional === 'confirmado' ? '#d1fae5' : r.confirmacionProfesional === 'rechazado' ? '#fee2e2' : '#fef3c7',
                            color: r.confirmacionProfesional === 'confirmado' ? '#065f46' : r.confirmacionProfesional === 'rechazado' ? '#991b1b' : '#92400e',
                            fontWeight: 600,
                          }}>
                            {r.Servicio.nombre}: {r.confirmacionProfesional === 'confirmado' ? 'Asistirá' : r.confirmacionProfesional === 'rechazado' ? 'No asiste' : 'Pendiente'}
                          </span>
                        )}
                        {r.vencida && (
                          <span className="badge vencida" style={{ display: 'inline-block', width: 'auto' }}>Vencida</span>
                        )}
                        <span className="precio">${Number(r.precioTotal).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
