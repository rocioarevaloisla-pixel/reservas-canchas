import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { canchas as canchasApi, reservas as reservasApi } from '../api/client';
import { useToast } from '../components/Toast';

export default function Reservar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [canchasList, setCanchasList] = useState([]);
  const [canchaId, setCanchaId] = useState(searchParams.get('cancha') || '');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);
  const [error, setError] = useState('');
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);

  const canchaSel = canchasList.find(c => c.id === parseInt(canchaId));

  useEffect(() => {
    canchasApi.listar().then(setCanchasList).catch((err) => {
      const msg = err.data?.message || err.message || 'Error al cargar canchas';
      toast.error(msg);
    });
  }, []);

  useEffect(() => {
    if (canchaId && fecha) {
      setSlots([]);
      setSelectedSlot(null);
      reservasApi.slots(canchaId, fecha).then(setSlots).catch((err) => {
        const msg = err.data?.message || err.message || 'Error al cargar horarios';
        toast.error(msg);
      });
    }
  }, [canchaId, fecha]);

  const handleReservar = async () => {
    if (!selectedSlot) return;
    setError('');
    setCargando(true);
    try {
      const reserva = await reservasApi.crear({
        canchaId: parseInt(canchaId),
        fecha,
        horaInicio: selectedSlot.horaInicio,
        horaFin: selectedSlot.horaFin,
      });
      setConfirmacion({
        cancha: canchaSel?.nombre,
        fecha,
        horaInicio: selectedSlot.horaInicio,
        horaFin: selectedSlot.horaFin,
        precio: reserva.precioTotal,
        capacidad: canchaSel?.capacidad,
      });
      toast.success('Reserva creada exitosamente');
    } catch (err) {
      const msg = err.data?.message || err.message || 'Error al reservar';
      setError(msg);
      toast.error(msg);
    } finally {
      setCargando(false);
    }
  };

  if (confirmacion) {
    return (
      <div className="confirmacion animate-fade-in">
        <div className="confirm-card">
          <div className="confirm-icon">✅</div>
          <h2>Reserva Confirmada</h2>
          <p>Tu reserva se ha creado exitosamente</p>
          <div className="confirm-detalle">
            <p><strong>⚽ Cancha:</strong> {confirmacion.cancha}</p>
            <p><strong>📅 Fecha:</strong> {confirmacion.fecha}</p>
            <p><strong>⏰ Horario:</strong> {confirmacion.horaInicio.slice(0, 5)} - {confirmacion.horaFin.slice(0, 5)}</p>
            <p><strong>👥 Capacidad:</strong> {confirmacion.capacidad} jugadores</p>
            <p className="precio"><strong>💰 Total:</strong> ${Number(confirmacion.precio).toLocaleString()}</p>
          </div>
          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button onClick={() => navigate('/mis-reservas')} className="btn-primary">
              Ver Mis Reservas
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Reservar Cancha</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="stepper">
        <div className={`step ${paso >= 1 ? paso > 1 ? 'done' : 'active' : ''}`}>
          <span className="step-num">{paso > 1 ? '✓' : 1}</span>
          Cancha
        </div>
        <div className={`step ${paso >= 2 ? paso > 2 ? 'done' : 'active' : ''}`}>
          <span className="step-num">{paso > 2 ? '✓' : 2}</span>
          Fecha
        </div>
        <div className={`step ${paso >= 3 ? 'active' : ''}`}>
          <span className="step-num">3</span>
          Horario
        </div>
      </div>

      <div className="form-card">
        <h3>1. Selecciona una cancha</h3>
        <div className="form-row">
          <select
            value={canchaId}
            onChange={(e) => { setCanchaId(e.target.value); setPaso(2); setSelectedSlot(null); }}
          >
            <option value="">— Seleccionar cancha —</option>
            {canchasList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} — ${Number(c.precioPorHora).toLocaleString()}/hr ({c.capacidad} jug.)
              </option>
            ))}
          </select>
        </div>
        {canchaSel && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
            {canchaSel.descripcion} — Capacidad: {canchaSel.capacidad} jugadores
          </div>
        )}
      </div>

      {paso >= 2 && (
        <div className="form-card">
          <h3>2. Elige la fecha</h3>
          <div className="form-row">
            <input
              type="date"
              value={fecha}
              onChange={(e) => { setFecha(e.target.value); setPaso(3); setSelectedSlot(null); }}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      )}

      {paso >= 3 && (
        <div className="form-card">
          <h3>3. Elige el horario</h3>
          {slots.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🕐</div>
              <p>No hay horarios disponibles para esta fecha</p>
            </div>
          ) : (
            <div className="slots-timeline">
              {slots.map((s, i) => (
                <button
                  key={i}
                  className={`slot-bar ${selectedSlot === s ? 'selected' : ''}`}
                  onClick={() => setSelectedSlot(s)}
                >
                  <span className="slot-time-label">{s.horaInicio.slice(0, 5)}</span>
                  <span className="slot-connector">
                    <span className="slot-dot" />
                    <span className="slot-line" />
                    <span className="slot-dot" />
                  </span>
                  <span className="slot-time-label">{s.horaFin.slice(0, 5)}</span>
                </button>
              ))}
            </div>
          )}

          {selectedSlot && (
            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--success-light)', borderRadius: 'var(--radius-sm)', border: '1px solid #cde1d3', animation: 'fadeIn 0.3s ease' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                <strong>Resumen:</strong> {canchaSel?.nombre} — {fecha} — {selectedSlot.horaInicio.slice(0, 5)} a {selectedSlot.horaFin.slice(0, 5)}
              </p>
              <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                <strong>Total:</strong> ${Number(canchaSel?.precioPorHora * 2).toLocaleString()} (2 horas)
              </p>
              <button
                onClick={handleReservar}
                className="btn-primary"
                disabled={cargando}
                style={{ width: '100%' }}
              >
                {cargando ? 'Reservando...' : 'Confirmar Reserva'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
