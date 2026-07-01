import { useState, useEffect, useCallback } from 'react';
import { notificacionesUsuario } from '../api/client';

function icono(mensaje) {
  if (mensaje?.startsWith('Reserva creada')) return '✅';
  if (mensaje?.startsWith('Reserva cancelada')) return '❌';
  if (mensaje?.includes('confirmó')) return '👤';
  if (mensaje?.includes('no podrá')) return '😔';
  return '🔔';
}

function tiempoRelativo(fecha) {
  const ahora = new Date();
  const f = new Date(fecha);
  const diffMs = ahora - f;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} hr${hrs > 1 ? 's' : ''}`;
  const dias = Math.floor(hrs / 24);
  if (dias === 1) return 'Ayer';
  if (dias < 7) return `Hace ${dias} días`;
  return f.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
}

export default function Notificaciones() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    notificacionesUsuario.misNotificaciones()
      .then(setList)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const handleLeer = async (id) => {
    try {
      await notificacionesUsuario.marcarLeida(id);
      setList(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
    } catch { }
  };

  const marcarTodasLeidas = async () => {
    const ids = list.filter(n => !n.leido).map(n => n.id);
    for (const id of ids) {
      try {
        await notificacionesUsuario.marcarLeida(id);
        setList(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
      } catch { }
    }
  };

  const noLeidas = list.filter(n => !n.leido);
  const grupos = {};
  for (const n of list) {
    const f = new Date(n.createdAt);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    let clave;
    if (f.toDateString() === hoy.toDateString()) clave = 'Hoy';
    else if (f.toDateString() === ayer.toDateString()) clave = 'Ayer';
    else clave = f.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!grupos[clave]) grupos[clave] = [];
    grupos[clave].push(n);
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 style={{ margin: 0 }}>Notificaciones</h1>
        {noLeidas.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="badge activa" style={{ fontSize: '0.75rem' }}>{noLeidas.length} sin leer</span>
            <button onClick={marcarTodasLeidas} className="btn-sm btn-primary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
              Marcar todas leídas
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : list.length === 0 ? (
        <div className="empty-state" style={{ padding: '80px 20px' }}>
          <div className="empty-icon" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔔</div>
          <h3 style={{ color: 'var(--text)', marginBottom: '6px' }}>No tienes notificaciones</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Aquí aparecerán las notificaciones de tus reservas</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(grupos).map(([grupo, notificaciones]) => (
            <div key={grupo}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{grupo}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notificaciones.map(n => (
                  <div
                    key={n.id}
                    onClick={() => { if (!n.leido) handleLeer(n.id); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius)',
                      border: `1px solid ${!n.leido ? 'var(--primary)' : 'var(--border)'}`,
                      background: !n.leido ? 'var(--primary-light)' : 'var(--card-bg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: n.leido ? 0.7 : 1,
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: !n.leido ? 'var(--primary)' : 'var(--bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', flexShrink: 0,
                    }}>
                      {icono(n.mensaje)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: !n.leido ? 600 : 400, fontSize: '0.9rem', marginBottom: '4px' }}>
                        {n.mensaje}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {tiempoRelativo(n.createdAt)}
                      </span>
                    </div>
                    {!n.leido && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}