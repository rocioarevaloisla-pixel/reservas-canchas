import { useState, useEffect } from 'react';
import { canchas as canchasApi, disponibilidad as dispApi } from '../api/client';
import { useToast } from '../components/Toast';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function Horarios() {
  const [canchasList, setCanchasList] = useState([]);
  const [canchaId, setCanchaId] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [form, setForm] = useState({ diaSemana: '1', horaInicio: '09:00', horaFin: '22:00' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [btnExito, setBtnExito] = useState(false);
  const toast = useToast();

  useEffect(() => {
    canchasApi.listar().then(setCanchasList).finally(() => setLoading(false));
  }, []);

  const loadHorarios = async (id) => {
    if (!id) return;
    try {
      const data = await dispApi.listar(id);
      setHorarios(data);
    } catch {
      setHorarios([]);
    }
  };

  useEffect(() => { loadHorarios(canchaId); }, [canchaId]);

  const addHorario = async () => {
    if (!canchaId) { setError('Selecciona una cancha primero'); return; }
    setError('');
    if (form.horaInicio >= form.horaFin) {
      const msg = 'La hora de inicio debe ser menor que la hora de fin';
      setError(msg);
      toast.error(msg);
      return;
    }
    setGuardando(true);
    setBtnExito(false);
    try {
      await dispApi.configurar([{
        canchaId: parseInt(canchaId),
        diaSemana: parseInt(form.diaSemana),
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
      }]);
      setBtnExito(true);
      toast.success('Horario agregado correctamente');
      loadHorarios(canchaId);
      setTimeout(() => setBtnExito(false), 1500);
    } catch (err) {
      setBtnExito(false);
      const msg = err.data?.message || err.message || 'Error al agregar';
      setError(msg);
      toast.error(msg);
    } finally {
      setGuardando(false);
    }
  };

  const removeHorario = async (id) => {
    if (!confirm('¿Eliminar este horario?')) return;
    setError('');
    try {
      await dispApi.eliminar(id);
      toast.success('Horario eliminado');
      loadHorarios(canchaId);
    } catch (err) {
      const msg = err.data?.message || err.message || 'Error al eliminar';
      setError(msg);
      toast.error(msg);
    }
  };

  const canchaSel = canchasList.find(c => c.id === parseInt(canchaId));

  return (
    <div className="container">
      <div className="page-header">
        <h1 style={{ margin: 0 }}>Configurar Horarios</h1>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="form-card">
        <div className="form-row">
          <select value={canchaId} onChange={(e) => setCanchaId(e.target.value)}>
            <option value="">— Seleccionar cancha —</option>
            {canchasList.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {canchaId && (
        <>
          <div className="form-card">
            <h3>Agregar Horario — {canchaSel?.nombre}</h3>
            <div className="form-row">
              <select value={form.diaSemana} onChange={(e) => setForm({ ...form, diaSemana: e.target.value })}>
                {DIAS.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
              <input
                type="time"
                value={form.horaInicio}
                onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
              />
              <input
                type="time"
                value={form.horaFin}
                onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
              />
              <button
                onClick={addHorario}
                className={`btn-primary${btnExito ? ' btn-success' : ''}`}
                disabled={guardando}
                style={{ whiteSpace: 'nowrap', minWidth: '100px' }}
              >
                {guardando ? 'Guardando...' : btnExito ? '✓ Agregado' : 'Agregar'}
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {horarios.map((h) => (
                  <tr key={h.id}>
                    <td><strong>{DIAS[h.diaSemana]}</strong></td>
                    <td>{h.horaInicio.slice(0, 5)}</td>
                    <td>{h.horaFin.slice(0, 5)}</td>
                    <td>
                      <button onClick={() => removeHorario(h.id)} className="btn-sm btn-danger">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {horarios.length === 0 && (
                  <tr className="table-empty"><td colSpan="4">
                    <div className="empty-state" style={{ padding: '20px' }}>
                      <div className="empty-icon">🕐</div>
                      <p>Sin horarios configurados</p>
                      <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>Agrega horarios usando el formulario de arriba.</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!canchaId && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>Selecciona una cancha para configurar sus horarios</p>
        </div>
      )}
    </div>
  );
}
