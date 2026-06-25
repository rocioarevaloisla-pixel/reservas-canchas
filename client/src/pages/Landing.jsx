import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export default function Landing() {
  const [canchasList, setCanchasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/canchas`)
      .then(r => r.json())
      .then(setCanchasList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <div className="animate-slide-up" style={{ animationDelay: '0s' }}>
            <h1>
              Reserva tu <span>Cancha</span>
              <br />en segundos
            </h1>
            <p>
              El sistema más fácil para reservar canchas de fútbol.
              Elige tu cancha, selecciona el horario y juega.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate('/register')}>
                Registrarme Gratis
              </button>
              <button className="btn-secondary" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="cards animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="card" onClick={() => navigate('/register')}>
          <div className="card-icon">⚽</div>
          <div className="card-count">{canchasList.length}</div>
          <h3>Canchas</h3>
          <p>Canchas disponibles para reservar</p>
        </div>
        <div className="card" onClick={() => navigate('/register')}>
          <div className="card-icon">🕒</div>
          <div className="card-count">Disponibles</div>
          <h3>Horarios Flexibles</h3>
          <p>Reserva en el horario que más te acomode</p>
        </div>
        <div className="card" onClick={() => navigate('/register')}>
          <div className="card-icon">🔒</div>
          <div className="card-count">Seguro</div>
          <h3>Reserva Segura</h3>
          <p>Tus reservas siempre protegidas</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : (
        <>
          <h2 className="animate-slide-up" style={{ animationDelay: '0.2s' }}>Canchas Disponibles</h2>
          <div className="canchas-grid animate-slide-up" style={{ animationDelay: '0.25s' }}>
            {canchasList.filter(c => c.activo).slice(0, 6).map((c) => (
              <div key={c.id} className="cancha-card" onClick={() => navigate('/register')}>
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

      <section className="features-section animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <h2>¿Por qué usar ReservaCanchas?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon green">📅</div>
            <h3>Reserva Rápida</h3>
            <p>Elige cancha, fecha y horario en pocos clics. Sin complicaciones.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon teal">💰</div>
            <h3>Precios Claros</h3>
            <p>Precio por hora transparente. Sin costos ocultos ni sorpresas.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon sage">⚡</div>
            <h3>Confirmación al Instante</h3>
            <p>Recibe confirmación inmediata de tu reserva con todos los detalles.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon purple">🔄</div>
            <h3>Cancelación Fácil</h3>
            <p>Cancelá tu reserva desde Mis Reservas y liberá el horario al instante.</p>
          </div>
        </div>
      </section>

      <section className="testimonials animate-slide-up" style={{ animationDelay: '0.35s' }}>
        <h2>Lo que dicen nuestros usuarios</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p className="testimonial-text">
              "Excelente sistema, reservé mi cancha en menos de un minuto.
              Muy recomendable para quienes organizamos partidos semanales."
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">P</div>
              <div>
                <div className="testimonial-name">Pedro Martínez</div>
                <div className="testimonial-role">Cliente frecuente</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-text">
              "Como administrador del club, me facilita mucho la gestión
              de horarios y reservas. La agenda del día es mi herramienta favorita."
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">C</div>
              <div>
                <div className="testimonial-name">Club Deportivo Central</div>
                <div className="testimonial-role">Administrador</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-text">
              "Poder cancelar y que el horario quede disponible al instante
              es genial. Me ha salvado más de una vez."
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">L</div>
              <div>
                <div className="testimonial-name">Laura Gutiérrez</div>
                <div className="testimonial-role">Jugadora amateur</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      </div>
      <section className="cta-section animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="cta-inner">
          <h2>¿Listo para jugar?</h2>
          <p>Regístrate gratis y reserva tu cancha en segundos.</p>
          <button className="btn-primary btn-lg" onClick={() => navigate('/register')} style={{ maxWidth: '320px', margin: '0 auto' }}>
            Crear Cuenta Gratis
          </button>
        </div>
      </section>
    </div>
  );
}
