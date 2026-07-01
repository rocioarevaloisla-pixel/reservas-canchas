import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificacionesUsuario } from '../api/client';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!user) { setNotifCount(0); return; }
    const fetch = () => {
      notificacionesUsuario.contarNoLeidas()
        .then((data) => setNotifCount(data.count))
        .catch(() => {});
    };
    fetch();
    const interval = setInterval(fetch, 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    notificacionesUsuario.contarNoLeidas()
      .then((data) => setNotifCount(data.count))
      .catch(() => {});
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-active' : '';

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to={user ? (user.rol === 'admin' ? '/dashboard' : '/inicio') : '/'} className="nav-brand" onClick={closeMenu}>
          <span className="nav-icon">⚽</span>
          Reserva<span className="brand-accent">Canchas</span>
        </Link>
        <button
          className="nav-toggle"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Menú de navegación"
        >
          <span></span><span></span><span></span>
        </button>
        <div className={`nav-section${menuOpen ? ' open' : ''}`}>
          {user ? (
            <>
              <div className="nav-links">
                <Link to={user.rol === 'admin' ? '/dashboard' : '/inicio'} className={isActive(user.rol === 'admin' ? '/dashboard' : '/inicio')} onClick={closeMenu}>Inicio</Link>
                {user.rol === 'cliente' && (
                  <>
                    <Link to="/reservar" className={isActive('/reservar')} onClick={closeMenu}>Reservar</Link>
                    <Link to="/mis-reservas" className={isActive('/mis-reservas')} onClick={closeMenu}>Mis Reservas</Link>
                  </>
                )}
                {user.rol === 'admin' && (
                  <>
                    <Link to="/canchas" className={isActive('/canchas')} onClick={closeMenu}>Canchas</Link>
                    <Link to="/horarios" className={isActive('/horarios')} onClick={closeMenu}>Horarios</Link>
                    <Link to="/agenda" className={isActive('/agenda')} onClick={closeMenu}>Agenda</Link>
                    <Link to="/admin/reservas" className={isActive('/admin/reservas')} onClick={closeMenu}>Reservas</Link>
                    <Link to="/profesionales" className={isActive('/profesionales')} onClick={closeMenu}>Profesionales</Link>
                  </>
                )}
              </div>
              <div className="nav-user-area">
                {user.rol === 'cliente' && (
                  <Link to="/notificaciones" className="nav-notif-bell" onClick={closeMenu} title="Notificaciones">
                    🔔
                    {notifCount > 0 && <span className="notif-badge">{notifCount > 9 ? '9+' : notifCount}</span>}
                  </Link>
                )}
                <span className="nav-user">
                  <span className="nav-avatar">{user.nombre.charAt(0).toUpperCase()}</span>
                  {user.nombre}
                </span>
                <button onClick={handleLogout} className="btn-logout">
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="nav-links">
                <Link to="/" className={isActive('/')} onClick={closeMenu}>Inicio</Link>
                <Link to="/login" className={isActive('/login')} onClick={closeMenu}>Reservar</Link>
              </div>
              <div className="nav-user-area">
                <Link to="/login" className="nav-login-link" onClick={closeMenu}>Iniciar Sesión</Link>
                <Link to="/register" className="nav-register-link" onClick={closeMenu}>Registrarse</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
