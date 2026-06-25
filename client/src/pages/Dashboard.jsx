import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canchas as canchasApi, reservas as reservasApi } from '../api/client';

export default function Dashboard() {
  const { user } = useAuth();
  const [canchasList, setCanchasList] = useState([]);
  const [reservasHoy, setReservasHoy] = useState([]);
  const [stats, setStats] = useState({ canchas: 0, hoy: 0, disponibles: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      canchasApi.listar(),
      reservasApi.listar(new Date().toISOString().split('T')[0]),
    ]).then(([c, r]) => {
      setCanchasList(c);
      setReservasHoy(r);
      setStats({
        canchas: c.length,
        hoy: r.length,
        disponibles: c.filter(ca => ca.activo).length,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="skeleton-hero" />
        <div className="container">
          <div className="cards">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="hero animate-slide-up" style={{ animationDelay: '0s' }}>
        <div className="hero-content">
          <h1>
            Bienvenido, <span>{user?.nombre}</span>
          </h1>
          <p>
            Gestiona tus reservas, consulta la agenda y administra las canchas.
          </p>
          <div className="hero-buttons">
            {user?.rol === 'cliente' && (
              <>
                <button className="btn-primary" onClick={() => navigate('/reservar')}>
                  Reservar Ahora
                </button>
                <button className="btn-secondary" onClick={() => navigate('/mis-reservas')}>
                  Mis Reservas
                </button>
              </>
            )}
            {user?.rol === 'admin' && (
              <>
                <button className="btn-primary" onClick={() => navigate('/canchas')}>
                  Administrar Canchas
                </button>
                <button className="btn-secondary" onClick={() => navigate('/agenda')}>
                  Ver Agenda
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="container">
        <div className="cards animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {user?.rol === 'admin' && (
            <div className="card" onClick={() => navigate('/canchas')}>
              <div className="card-icon">⚽</div>
              <div className="card-count">{stats.canchas}</div>
              <h3>Canchas</h3>
              <p>Canchas registradas en el sistema</p>
            </div>
          )}
          {user?.rol === 'admin' && (
            <div className="card" onClick={() => navigate('/agenda')}>
              <div className="card-icon">📅</div>
              <div className="card-count">{stats.hoy}</div>
              <h3>Reservas Hoy</h3>
              <p>Reservas programadas para hoy</p>
            </div>
          )}
          {user?.rol === 'cliente' && (
            <div className="card" onClick={() => navigate('/reservar')}>
              <div className="card-icon">✅</div>
              <div className="card-count">{stats.disponibles}</div>
              <h3>Disponibles</h3>
              <p>Canchas activas listas para usar</p>
            </div>
          )}
        </div>

        {user?.rol === 'cliente' && (
          <>
            <h2 className="animate-slide-up" style={{ animationDelay: '0.15s' }}>Canchas Disponibles</h2>
            <div className="canchas-grid animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {canchasList.filter(c => c.activo).slice(0, 3).map((c) => (
                <div key={c.id} className="cancha-card" onClick={() => navigate(`/reservar?cancha=${c.id}`)}>
                  <div className="cancha-card-image">
                    ⚽
                    <span className="cancha-card-badge">{c.capacidad}v{c.capacidad}</span>
                  </div>
                  <div className="cancha-card-body">
                    <h3>{c.nombre}</h3>
                    <p>{c.descripcion}</p>
                    <p className="precio">${Number(c.precioPorHora).toLocaleString()} / hora</p>
                    <span className="cancha-badge">{c.capacidad} jugadores</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      <section className="features-section animate-slide-up" style={{ animationDelay: '0.25s' }}>
        <h2>Accesos Rápidos</h2>
        <div className="features-grid">
          {user?.rol === 'cliente' && (
            <>
              <div className="feature-card" onClick={() => navigate('/reservar')} style={{ cursor: 'pointer' }}>
                <div className="feature-icon green">📅</div>
                <h3>Nueva Reserva</h3>
                <p>Reserva una cancha en segundos. Elige fecha, horario y confirma.</p>
              </div>
              <div className="feature-card" onClick={() => navigate('/mis-reservas')} style={{ cursor: 'pointer' }}>
                <div className="feature-icon teal">📋</div>
                <h3>Mis Reservas</h3>
                <p>Revisa y cancela tus reservas activas desde un solo lugar.</p>
              </div>
            </>
          )}
          {user?.rol === 'admin' && (
            <>
              <div className="feature-card" onClick={() => navigate('/canchas')} style={{ cursor: 'pointer' }}>
                <div className="feature-icon sage">⚙️</div>
                <h3>Administrar Canchas</h3>
                <p>Gestiona las canchas: crea, edita y desactiva.</p>
              </div>
              <div className="feature-card" onClick={() => navigate('/horarios')} style={{ cursor: 'pointer' }}>
                <div className="feature-icon teal">🕐</div>
                <h3>Horarios</h3>
                <p>Configura la disponibilidad horaria de cada cancha.</p>
              </div>
              <div className="feature-card" onClick={() => navigate('/agenda')} style={{ cursor: 'pointer' }}>
                <div className="feature-icon purple">📊</div>
                <h3>Agenda del Día</h3>
                <p>Vista general de todas las reservas del día.</p>
              </div>
            </>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}
