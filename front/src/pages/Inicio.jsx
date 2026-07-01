import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canchas as canchasApi, reservas as reservasApi } from '../api/client';

export default function Inicio() {
  const { user } = useAuth();
  const [canchasList, setCanchasList] = useState([]);
  const [stats, setStats] = useState({ disponibles: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    canchasApi.listar().then((c) => {
      setCanchasList(c);
      setStats({ disponibles: c.filter(ca => ca.activo).length });
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
            Reserva tu cancha favorita y disfruta del deporte.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/reservar')}>
              Reservar Ahora
            </button>
            <button className="btn-secondary" onClick={() => navigate('/mis-reservas')}>
              Mis Reservas
            </button>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="cards animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="card" onClick={() => navigate('/reservar')}>
            <div className="card-icon">✅</div>
            <div className="card-count">{stats.disponibles}</div>
            <h3>Disponibles</h3>
            <p>Canchas activas listas para usar</p>
          </div>
        </div>

        <h2 className="animate-slide-up" style={{ animationDelay: '0.15s' }}>Canchas Disponibles</h2>
        <div className="canchas-grid animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {canchasList.filter(c => c.activo).slice(0, 3).map((c) => (
            <div key={c.id} className="cancha-card" onClick={() => navigate(`/reservar?cancha=${c.id}`)}>
              <div className="cancha-card-image" style={c.imagen ? { padding: 0, overflow: 'hidden' } : {}}>
                {c.imagen ? (
                  <img src={c.imagen} alt={c.nombre} className="cancha-card-img" />
                ) : (
                  <span>⚽</span>
                )}
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

        <section className="features-section animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <h2>Accesos Rápidos</h2>
          <div className="features-grid">
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
          </div>
        </section>
      </div>
    </div>
  );
}
