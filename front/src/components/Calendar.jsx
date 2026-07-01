import { useState, useMemo } from 'react';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

export default function Calendar({ selected, onChange, minDate, maxDate, marcas, onMonthChange }) {
  const hoy = new Date();
  const [mes, setMes] = useState(selected ? new Date(selected + 'T12:00:00') : new Date());
  const [ano, setAno] = useState(mes.getFullYear());

  const min = minDate ? new Date(minDate + 'T12:00:00') : new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const max = maxDate ? new Date(maxDate + 'T23:59:59') : null;

  const navMes = (delta) => {
    const nuevaFecha = new Date(ano, mes.getMonth() + delta, 1);
    setMes(nuevaFecha);
    setAno(nuevaFecha.getFullYear());
    if (onMonthChange) {
      onMonthChange(nuevaFecha.getFullYear(), nuevaFecha.getMonth() + 1);
    }
  };

  const dias = useMemo(() => {
    const primerDia = new Date(ano, mes.getMonth(), 1);
    const ultimoDia = new Date(ano, mes.getMonth() + 1, 0);
    const inicioSemana = primerDia.getDay();
    const totalDias = ultimoDia.getDate();
    const celdas = [];
    for (let i = 0; i < inicioSemana; i++) celdas.push(null);
    for (let d = 1; d <= totalDias; d++) celdas.push(d);
    return celdas;
  }, [ano, mes]);

  const selectedDate = selected ? new Date(selected + 'T12:00:00') : null;

  const esHoy = (d) => {
    return d === hoy.getDate() && mes.getMonth() === hoy.getMonth() && ano === hoy.getFullYear();
  };

  const esSeleccionado = (d) => {
    if (!selectedDate) return false;
    return d === selectedDate.getDate() && mes.getMonth() === selectedDate.getMonth() && ano === selectedDate.getFullYear();
  };

  const esPasado = (d) => {
    if (!d) return false;
    const fecha = new Date(ano, mes.getMonth(), d);
    fecha.setHours(12, 0, 0, 0);
    return fecha < min;
  };

  const esFuturo = (d) => {
    if (!d || !max) return false;
    const fecha = new Date(ano, mes.getMonth(), d);
    fecha.setHours(23, 59, 59, 0);
    return fecha > max;
  };

  const noDisponible = (d) => {
    return esPasado(d) || esFuturo(d);
  };

  const tieneReservas = (d) => {
    if (!marcas || !d) return false;
    const key = `${ano}-${String(mes.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return marcas[key] > 0;
  };

  const mesAnteriorDisabled = (() => {
    const primerDia = new Date(ano, mes.getMonth(), 1);
    const minMonth = new Date(min.getFullYear(), min.getMonth(), 1);
    return primerDia <= minMonth;
  })();

  const mesSiguienteDisabled = (() => {
    if (!max) return false;
    const ultimoDia = new Date(ano, mes.getMonth() + 1, 0);
    return ultimoDia >= max;
  })();

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button
          onClick={() => navMes(-1)}
          className="cal-nav"
          disabled={mesAnteriorDisabled}
          style={mesAnteriorDisabled ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <span className="cal-month-year">{MESES[mes.getMonth()]} {ano}</span>
        <button
          onClick={() => navMes(1)}
          className="cal-nav"
          disabled={mesSiguienteDisabled}
          style={mesSiguienteDisabled ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>
      <div className="calendar-grid">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
        {dias.map((d, i) => {
          const conReservas = tieneReservas(d);
          return (
            <div
              key={i}
              className={`cal-day${!d ? ' cal-empty' : ''}${d && esHoy(d) ? ' cal-today' : ''}${d && esSeleccionado(d) ? ' cal-selected' : ''}${d && noDisponible(d) ? ' cal-past' : ''}${conReservas ? ' cal-has-reservas' : ''}`}
              onClick={() => {
                if (d && !noDisponible(d)) {
                  const fechaStr = `${ano}-${String(mes.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  onChange(fechaStr);
                }
              }}
            >
              {d || ''}
              {conReservas && <span className="cal-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
