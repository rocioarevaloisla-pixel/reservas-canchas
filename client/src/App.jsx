import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Canchas = lazy(() => import('./pages/Canchas'));
const Horarios = lazy(() => import('./pages/Horarios'));
const Reservar = lazy(() => import('./pages/Reservar'));
const MisReservas = lazy(() => import('./pages/MisReservas'));
const Agenda = lazy(() => import('./pages/Agenda'));
const AdminReservas = lazy(() => import('./pages/AdminReservas'));

function Spinner() {
  return <div className="page-spinner"><div className="spinner" /></div>;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Cargando...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Cargando...</div>;
  return user && user.rol === 'admin' ? children : <Navigate to="/dashboard" />;
}

function ClientRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Cargando...</div>;
  return user && user.rol === 'cliente' ? children : <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <ToastProvider>
      <div className="app">
        <Navbar />
        <main>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/canchas" element={<AdminRoute><Canchas /></AdminRoute>} />
              <Route path="/horarios" element={<AdminRoute><Horarios /></AdminRoute>} />
              <Route path="/reservar" element={<ClientRoute><Reservar /></ClientRoute>} />
              <Route path="/mis-reservas" element={<ClientRoute><MisReservas /></ClientRoute>} />
              <Route path="/agenda" element={<AdminRoute><Agenda /></AdminRoute>} />
              <Route path="/admin/reservas" element={<AdminRoute><AdminReservas /></AdminRoute>} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
