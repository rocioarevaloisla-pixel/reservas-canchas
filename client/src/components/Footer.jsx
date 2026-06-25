import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-icon">⚽</span>
          <span>Reserva<span className="brand-accent">Canchas</span></span>
        </div>
        <div className="footer-links">
          {!user && <Link to="/">Inicio</Link>}
          {!user && <Link to="/reservar">Reservar</Link>}
          {!user && <Link to="/login">Iniciar Sesi&oacute;n</Link>}
          {!user && <Link to="/register">Registrarse</Link>}
        </div>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} ReservaCanchas. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
