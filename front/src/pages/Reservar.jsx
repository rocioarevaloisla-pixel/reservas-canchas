import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { canchas as canchasApi, reservas as reservasApi } from '../api/client';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import Calendar from '../components/Calendar';

export default function Reservar() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [canchasList, setCanchasList] = useState([]);
  const [canchaId, setCanchaId] = useState(searchParams.get('cancha') || '');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [error, setError] = useState('');
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [misMarcas, setMisMarcas] = useState({});

  const hoy = new Date();
  const hoyStr = hoy.toISOString().split('T')[0];
  const ahoraMinutos = hoy.getHours() * 60 + hoy.getMinutes();

  const slotMuyCerca = (s) => {
    if (fecha !== hoyStr) return false;
    const [h, m] = s.horaInicio.split(':').map(Number);
    const minInicio = h * 60 + m;
    return minInicio - ahoraMinutos < 60;
  };

  const maxDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  })();

  const canchaSel = canchasList.find(c => c.id === parseInt(canchaId));
  const profesionalesCancha = canchaSel?.Profesionales || [];

  useEffect(() => {
    canchasApi.listar().then((lista) => {
      setCanchasList(lista);
      if (canchaId && lista.some(c => c.id === parseInt(canchaId))) {
        setPaso(2);
      }
    }).catch((err) => {
      const msg = err.data?.message || err.message || 'Error al cargar canchas';
      toast.error(msg);
    });
  }, []);

  useEffect(() => {
    if (!fecha || !user) return;
    const [y, m] = fecha.split('-').map(Number);
    reservasApi.resumenMesUsuario(y, m).then(setMisMarcas).catch(() => {});
  }, [fecha, user]);

  useEffect(() => {
    if (!user) return;
    const d = new Date();
    reservasApi.resumenMesUsuario(d.getFullYear(), d.getMonth() + 1).then(setMisMarcas).catch(() => {});
  }, [user]);

  const handleMonthChange = (y, m) => {
    if (!user) return;
    reservasApi.resumenMesUsuario(y, m).then(setMisMarcas).catch(() => {});
  };

  useEffect(() => {
    if (canchaId && fecha && paso >= 2) {
      setSlots([]);
      setSelectedSlots([]);
      setSelectedService(null);
      reservasApi.slots(canchaId, fecha).then((data) => {
        setSlots(data.slots || []);
      }).catch((err) => {
        const msg = err.data?.message || err.message || 'Error al cargar horarios';
        toast.error(msg);
      });
    }
  }, [canchaId, fecha, paso]);

  const slotToMin = (s) => {
    const [h, m] = s.horaInicio.split(':').map(Number);
    return h * 60 + m;
  };

  const esConsecutivo = (slot, grupo) => {
    if (grupo.length === 0) return true;
    const mins = grupo.map(slotToMin).sort((a, b) => a - b);
    const slotMin = slotToMin(slot);
    return slotMin === mins[mins.length - 1] + 60 || slotMin === mins[0] - 60;
  };

  const toggleSlot = (slot) => {
    setSelectedSlots(prev => {
      if (prev.includes(slot)) return prev.filter(s => s !== slot);
      if (esConsecutivo(slot, prev)) return [...prev, slot];
      return [slot];
    });
  };

  const horaInicioSel = selectedSlots.length > 0
    ? selectedSlots.reduce((a, b) => slotToMin(a) < slotToMin(b) ? a : b).horaInicio
    : '';
  const horaFinSel = selectedSlots.length > 0
    ? selectedSlots.reduce((a, b) => slotToMin(b) > slotToMin(a) ? b : a).horaFin
    : '';

  const handleReservar = async () => {
    if (selectedSlots.length === 0) return;
    setError('');
    setCargando(true);
    setShowInvoice(false);
    try {
      const reserva = await reservasApi.crear({
        canchaId: parseInt(canchaId),
        fecha,
        horaInicio: horaInicioSel,
        horaFin: horaFinSel,
        servicioId: selectedService?.id || null,
      });
      setConfirmacion({
        cancha: canchaSel?.nombre,
        fecha,
        horaInicio: horaInicioSel,
        horaFin: horaFinSel,
        precio: reserva.precioTotal,
        capacidad: canchaSel?.capacidad,
        profesionales: profesionalesCancha,
        servicio: selectedService,
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
            {confirmacion.profesionales?.length > 0 && (
              <div>
                <p><strong>👤 Profesional(es):</strong></p>
                {confirmacion.profesionales.map(p => (
                  <p key={p.id} style={{ marginLeft: '12px', fontSize: '0.9rem' }}>
                    {p.nombre}
                    {p.telefono && <span style={{ color: 'var(--text-light)' }}> — 📞 {p.telefono}</span>}
                    {p.emailContacto && <span style={{ color: 'var(--text-light)' }}> — ✉️ {p.emailContacto}</span>}
                  </p>
                ))}
              </div>
            )}
            {confirmacion.servicio && (
              <p><strong>🔧 Servicio:</strong> {confirmacion.servicio.nombre} (+${Number(confirmacion.servicio.precio).toLocaleString()})</p>
            )}
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
            onChange={(e) => { setCanchaId(e.target.value); setPaso(2); setSelectedSlots([]); }}
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
          <div className="cal-grid">
            <Calendar
              selected={fecha}
              onChange={(f) => { setFecha(f); setPaso(3); setSelectedSlots([]); }}
              minDate={new Date().toISOString().split('T')[0]}
              maxDate={maxDate}
              marcas={misMarcas}
              onMonthChange={handleMonthChange}
            />
            {canchaSel && (
              <div className="cal-sidebar">
                <div className="cal-sidebar-card">
                  <div className="cancha-card-image" style={canchaSel.imagen ? { padding: 0, overflow: 'hidden', height: '140px' } : { height: '140px' }}>
                    {canchaSel.imagen ? (
                      <img src={canchaSel.imagen} alt={canchaSel.nombre} className="cancha-card-img" />
                    ) : (
                      <span>⚽</span>
                    )}
                  </div>
                  <div className="cal-sidebar-info">
                    <p><strong>{canchaSel.nombre}</strong></p>
                    <p>{canchaSel.descripcion}</p>
                    <p>💰 ${Number(canchaSel.precioPorHora).toLocaleString()} / hr</p>
                    <p>👥 {canchaSel.capacidad} jugadores</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {paso >= 3 && (
        <div className="form-card">
          <h3>3. Elige el horario</h3>
          {(() => {
            const hayDisponible = slots.some(s => s.estado === 'disponible');
            return (
              <div className="slots-timeline">
                {slots.map((s, i) => {
                  const muyCerca = slotMuyCerca(s);
                  const deshabilitado = s.estado === 'reservado' || muyCerca;
                  const isSelected = selectedSlots.includes(s);
                  const slotLabel = s.esMiReserva ? 'Tu reserva' : s.estado === 'reservado' ? 'Reservado' : muyCerca ? 'Muy cerca' : isSelected ? 'Quitar' : 'Disponible';
                  const slotTitle = s.esMiReserva ? 'Ya tienes una reserva en este horario' : muyCerca ? 'Debes reservar con al menos 1 hora de anticipación' : s.estado === 'reservado' ? 'Ya reservado' : isSelected ? 'Quitar' : 'Seleccionar';
                  return (
                    <button
                      key={i}
                      className={`slot-bar${deshabilitado ? ' disabled' : ''}${isSelected ? ' selected' : ''}${s.estado === 'reservado' ? ' reserved' : ''}${s.esMiReserva ? ' mi-reserva' : ''}`}
                      onClick={() => { if (!deshabilitado) toggleSlot(s); }}
                      title={slotTitle}
                    >
                      <div className="slot-check">{isSelected ? '✓' : ''}</div>
                      <span className="slot-time-label">{s.horaInicio.slice(0, 5)}</span>
                      <span className="slot-connector">
                        <span className="slot-dot" />
                        <span className="slot-line" />
                        <span className="slot-dot" />
                      </span>
                      <span className="slot-time-label">{s.horaFin.slice(0, 5)}</span>
                      <span className="slot-sub">{slotLabel}</span>
                    </button>
                  );
                })}
                {slots.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">🕐</div>
                    <p>No hay horarios disponibles para esta fecha</p>
                  </div>
                )}
              </div>
            );
          })()}

          {selectedSlots.length > 0 && (
            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--success-light)', borderRadius: 'var(--radius-sm)', border: '1px solid #cde1d3', animation: 'fadeIn 0.3s ease' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                <strong>Resumen:</strong> {canchaSel?.nombre} — {fecha} — {horaInicioSel.slice(0, 5)} a {horaFinSel.slice(0, 5)}
                <span style={{ fontWeight: 400, color: 'var(--text-light)' }}> ({selectedSlots.length} hr{selectedSlots.length > 1 ? 's' : ''})</span>
              </p>
              <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                <strong>Cancha:</strong> ${Number(canchaSel?.precioPorHora * selectedSlots.length).toLocaleString()}
              </p>

              {profesionalesCancha.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Servicio adicional (opcional)</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {profesionalesCancha.map(prof =>
                      prof.Servicios?.length > 0 && prof.Servicios.map(s => (
                        <div
                          key={s.id}
                          onClick={() => setSelectedService(selectedService?.id === s.id ? null : s)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '14px 16px', borderRadius: 'var(--radius)',
                            border: selectedService?.id === s.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: selectedService?.id === s.id ? 'var(--primary-light)' : 'var(--card-bg)',
                            cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: selectedService?.id === s.id ? '0 0 0 3px rgba(37,99,235,0.15)' : 'none',
                          }}
                        >
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: selectedService?.id === s.id ? 'var(--primary)' : 'var(--bg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem', color: selectedService?.id === s.id ? 'white' : 'var(--text-light)',
                            flexShrink: 0,
                          }}>
                            🔧
                          </div>
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: '0.9rem' }}>{s.nombre}</strong>
                            {s.descripcion && <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '2px' }}>{s.descripcion}</p>}
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>por {prof.nombre}</span>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--grass)' }}>+${Number(s.precio).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {selectedService && (
                    <button
                      style={{ fontSize: '0.8rem', color: 'var(--text-light)', cursor: 'pointer', border: 'none', background: 'none', padding: '4px 0', textDecoration: 'underline' }}
                      onClick={() => setSelectedService(null)}
                    >
                      Quitar servicio
                    </button>
                  )}
                </div>
              )}

              <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
                Total: ${Number(
                  (canchaSel?.precioPorHora * selectedSlots.length) +
                  (selectedService ? parseFloat(selectedService.precio) : 0)
                ).toLocaleString()}
              </p>
              <button
                onClick={() => setShowInvoice(true)}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                Revisar y Confirmar
              </button>
            </div>
          )}
        </div>
      )}

      {showInvoice && (
        <div className="modal-overlay" onClick={() => setShowInvoice(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Confirmar Reserva</h3>
              <button className="modal-close" onClick={() => setShowInvoice(false)}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '2rem' }}>🏟️</span>
                <h2 style={{ margin: '8px 0', fontSize: '1.3rem' }}>Reserva de Cancha</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Boleta de Confirmación</p>
              </div>
              <div style={{ borderTop: '2px dashed var(--border)', borderBottom: '2px dashed var(--border)', padding: '16px 0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Cancha</span>
                  <span style={{ fontWeight: 600 }}>{canchaSel?.nombre}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Fecha</span>
                  <span>{fecha}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Horario</span>
                  <span>{horaInicioSel.slice(0, 5)} — {horaFinSel.slice(0, 5)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Duración</span>
                  <span>{selectedSlots.length} hr{selectedSlots.length > 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Precio cancha</span>
                  <span>${Number(canchaSel?.precioPorHora * selectedSlots.length).toLocaleString()}</span>
                </div>
                {selectedService && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-light)' }}>Servicio: {selectedService.nombre}</span>
                      <span style={{ color: 'var(--grass)' }}>+${Number(selectedService.precio).toLocaleString()}</span>
                    </div>
                    {(() => {
                      const prof = profesionalesCancha.find(p => p.Servicios?.some(s => s.id === selectedService.id));
                      return prof && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span>por {prof.nombre}</span>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', padding: '0 4px' }}>
                <span>Total a pagar</span>
                <span>${Number(
                  (canchaSel?.precioPorHora * selectedSlots.length) +
                  (selectedService ? parseFloat(selectedService.precio) : 0)
                ).toLocaleString()}</span>
              </div>
              <button
                onClick={handleReservar}
                disabled={cargando}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
              >
                {cargando ? (
                  <span className="btn-loading">Procesando…</span>
                ) : `Pagar y Reservar`}
              </button>
              <button
                onClick={() => setShowInvoice(false)}
                className="btn-secondary"
                style={{ width: '100%', marginTop: '8px' }}
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
