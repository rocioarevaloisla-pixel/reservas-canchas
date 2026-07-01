const { Reserva, Cancha, User, Disponibilidad, Servicio, Profesional } = require('../models');
const { Op } = require('sequelize');
const notificacionUsuarioService = require('./notificacionUsuarioService');

function normalizarHora(timeStr) {
  return timeStr.slice(0, 5);
}

function estaVencida(reserva) {
  const ahora = new Date();
  const hoy = ahora.toISOString().split('T')[0];
  if (reserva.fecha < hoy) return true;
  if (reserva.fecha === hoy) {
    const [h, m] = (reserva.horaFin || '00:00').split(':').map(Number);
    const minTotales = h * 60 + m;
    const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
    return ahoraMin >= minTotales;
  }
  return false;
}

async function reservar({ usuarioId, canchaId, fecha, horaInicio, horaFin, servicioId }) {
  const cancha = await Cancha.findByPk(canchaId);
  if (!cancha || !cancha.activo) {
    throw { status: 404, message: 'Cancha no disponible' };
  }

  const ahora = new Date();
  const hoy = ahora.toISOString().split('T')[0];
  if (fecha < hoy) {
    throw { status: 400, message: 'No puedes reservar en una fecha pasada' };
  }

  // La validación de 1 hora de anticipación se hace en el frontend
  // (el servidor usa UTC, el cliente usa su zona horaria local)

  const activas = await Reserva.count({
    where: {
      usuarioId,
      estado: 'activa',
      [Op.or]: [
        { fecha: { [Op.gt]: hoy } },
        { fecha: hoy, horaFin: { [Op.gt]: ahora.toTimeString().slice(0, 5) } },
      ],
    },
  });
  if (activas >= 10) {
    throw { status: 400, message: 'Has alcanzado el límite de 10 reservas activas' };
  }

  const diaSemana = new Date(fecha + 'T12:00:00').getDay();
  const disponibilidad = await Disponibilidad.findOne({
    where: { canchaId, diaSemana },
  });
  if (!disponibilidad) {
    throw { status: 400, message: 'No hay disponibilidad configurada para este d�a' };
  }
  if (normalizarHora(horaInicio) < normalizarHora(disponibilidad.horaInicio) || normalizarHora(horaFin) > normalizarHora(disponibilidad.horaFin)) {
    throw { status: 400, message: 'El horario solicitado no est� dentro de la disponibilidad' };
  }

  const conflicto = await Reserva.findOne({
    where: {
      canchaId,
      fecha,
      estado: 'activa',
      [Op.and]: [
        { horaInicio: { [Op.lt]: horaFin } },
        { horaFin: { [Op.gt]: horaInicio } },
      ],
    },
  });

  if (conflicto) {
    throw { status: 409, message: 'El horario ya est� reservado' };
  }

  const horas = (new Date(`2000-01-01T${horaFin}`) - new Date(`2000-01-01T${horaInicio}`)) / 3600000;
  let precioTotal = parseFloat(cancha.precioPorHora) * horas;

  if (servicioId) {
    const servicio = await Servicio.findByPk(servicioId);
    if (servicio) {
      precioTotal += parseFloat(servicio.precio);
    }
  }

  const reserva = await Reserva.create({ usuarioId, canchaId, fecha, horaInicio, horaFin, precioTotal, servicioId });

  try {
    const mensaje = `Reserva creada en "${cancha.nombre}" el ${fecha} de ${horaInicio.slice(0,5)} a ${horaFin.slice(0,5)}`;
    await notificacionUsuarioService.crearParaReserva(reserva.id, usuarioId, mensaje);
  } catch (e) { console.error('Error al crear notificación:', e); }

  return reserva;
}

function serializar(reservas) {
  return reservas.map(r => {
    const data = r.toJSON();
    data.vencida = data.estado === 'activa' ? estaVencida(data) : false;
    return data;
  });
}

async function listarTodas() {
  const reservas = await Reserva.findAll({
    include: [
      { model: Cancha, attributes: ['nombre', 'precioPorHora'], include: [{ model: Profesional, as: 'Profesionales', attributes: ['id', 'nombre', 'telefono', 'emailContacto'], through: { attributes: [] } }] },
      { model: User, attributes: ['nombre', 'email'] },
      { model: Servicio, attributes: ['id', 'nombre', 'precio'] },
    ],
    order: [['fecha', 'DESC'], ['horaInicio', 'ASC']],
  });
  return serializar(reservas);
}

async function listarPorFecha(fecha) {
  const reservas = await Reserva.findAll({
    where: { fecha, estado: 'activa' },
    include: [
      { model: Cancha, attributes: ['nombre', 'precioPorHora'], include: [{ model: Profesional, as: 'Profesionales', attributes: ['id', 'nombre', 'telefono', 'emailContacto'], through: { attributes: [] } }] },
      { model: User, attributes: ['nombre', 'email'] },
      { model: Servicio, attributes: ['id', 'nombre', 'precio'] },
    ],
    order: [['horaInicio', 'ASC']],
  });
  return serializar(reservas);
}

async function listarPorUsuario(usuarioId, fecha) {
  const where = { usuarioId };
  if (fecha) where.fecha = fecha;
  const reservas = await Reserva.findAll({
    where,
    include: [
      { model: Cancha, attributes: ['nombre', 'precioPorHora'] },
      { model: Servicio, attributes: ['id', 'nombre', 'precio'], include: [{ model: Profesional, attributes: ['nombre', 'telefono', 'emailContacto'] }] },
    ],
    order: [['fecha', 'DESC'], ['horaInicio', 'ASC']],
  });
  return serializar(reservas);
}

async function cancelar(id, usuarioId) {
  const reserva = await Reserva.findByPk(id);
  if (!reserva) throw { status: 404, message: 'Reserva no encontrada' };
  if (reserva.usuarioId !== usuarioId) {
    const user = await User.findByPk(usuarioId);
    if (!user || user.rol !== 'admin') {
      throw { status: 403, message: 'No puedes cancelar esta reserva' };
    }
  }
  if (reserva.estado === 'cancelada') {
    throw { status: 400, message: 'La reserva ya está cancelada' };
  }
  await reserva.update({ estado: 'cancelada' });

  try {
    const cancha = await Cancha.findByPk(reserva.canchaId);
    await notificacionUsuarioService.crearParaReserva(reserva.id, reserva.usuarioId, `Reserva cancelada en "${cancha?.nombre || reserva.canchaId}" el ${reserva.fecha}`);
  } catch (e) { console.error('Error al crear notificación:', e); }

  return reserva;
}

const DURACION_SLOT_HORAS = 1;

function sumarSlot(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return `${String(h + DURACION_SLOT_HORAS).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function obtenerDiaSemana(fechaStr) {
  const [y, m, d] = fechaStr.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

async function slotsDisponibles(canchaId, fecha) {
  const diaSemana = obtenerDiaSemana(fecha);
  const disponibilidades = await Disponibilidad.findAll({ where: { canchaId, diaSemana } });
  if (disponibilidades.length === 0) return [];

  const reservas = await Reserva.findAll({
    where: { canchaId, fecha, estado: 'activa' },
    attributes: ['horaInicio', 'horaFin'],
  });

  const slots = [];
  for (const disp of disponibilidades) {
    let inicio = normalizarHora(disp.horaInicio);
    const fin = normalizarHora(disp.horaFin);
    while (inicio < fin) {
      const horaFinSlot = sumarSlot(inicio);
      const ocupado = reservas.some(r =>
        normalizarHora(r.horaInicio) < horaFinSlot && normalizarHora(r.horaFin) > inicio
      );
      if (!ocupado) {
        slots.push({ horaInicio: inicio, horaFin: horaFinSlot });
      }
      inicio = horaFinSlot;
    }
  }
  return slots;
}

async function bloquesReservados(canchaId, fecha) {
  const reservas = await Reserva.findAll({
    where: { canchaId, fecha, estado: 'activa' },
    attributes: ['horaInicio', 'horaFin'],
    order: [['horaInicio', 'ASC']],
  });
  return reservas.map(r => ({
    horaInicio: normalizarHora(r.horaInicio),
    horaFin: normalizarHora(r.horaFin),
  }));
}

async function obtenerTimeline(canchaId, fecha, usuarioId) {
  const diaSemana = obtenerDiaSemana(fecha);
  const disponibilidades = await Disponibilidad.findAll({ where: { canchaId, diaSemana } });
  if (disponibilidades.length === 0) return [];

  const reservas = await Reserva.findAll({
    where: { canchaId, fecha, estado: 'activa' },
    attributes: ['horaInicio', 'horaFin', 'usuarioId'],
  });

  const slots = [];
  for (const disp of disponibilidades) {
    let inicio = normalizarHora(disp.horaInicio);
    const fin = normalizarHora(disp.horaFin);
    while (inicio < fin) {
      const horaFinSlot = sumarSlot(inicio);
      const reservaEncontrada = reservas.find(r =>
        normalizarHora(r.horaInicio) < horaFinSlot && normalizarHora(r.horaFin) > inicio
      );
      let estado = 'disponible';
      let esMiReserva = false;
      if (reservaEncontrada) {
        estado = 'reservado';
        esMiReserva = reservaEncontrada.usuarioId === usuarioId;
      }
      slots.push({
        horaInicio: inicio,
        horaFin: horaFinSlot,
        estado,
        esMiReserva,
      });
      inicio = horaFinSlot;
    }
  }
  return slots;
}

async function resumenMes(ano, mes) {
  const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const fin = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
  const reservas = await Reserva.findAll({
    where: {
      fecha: { [Op.between]: [inicio, fin] },
      estado: 'activa',
    },
    attributes: ['fecha'],
  });
  const conteo = {};
  for (const r of reservas) {
    conteo[r.fecha] = (conteo[r.fecha] || 0) + 1;
  }
  return conteo;
}

async function actualizarConfirmacionProfesional(id, estado) {
  const reserva = await Reserva.findByPk(id);
  if (!reserva) throw { status: 404, message: 'Reserva no encontrada' };

  const estadoAnterior = reserva.confirmacionProfesional;
  reserva.confirmacionProfesional = estado;
  await reserva.save();

  if (estado !== estadoAnterior && estado !== 'pendiente') {
    try {
      const fecha = reserva.fecha;
      const mensaje = estado === 'confirmado'
        ? `El profesional confirmó asistencia para tu reserva del día ${fecha}`
        : `El profesional no podrá asistir a tu reserva del día ${fecha}`;
      await notificacionUsuarioService.crearParaReserva(reserva.id, reserva.usuarioId, mensaje);
    } catch (e) {
      console.error('Error al crear notificación:', e);
    }
  }

  return reserva;
}

async function resumenMesUsuario(ano, mes, usuarioId) {
  const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const fin = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
  const reservas = await Reserva.findAll({
    where: {
      fecha: { [Op.between]: [inicio, fin] },
      usuarioId,
      estado: 'activa',
    },
    attributes: ['fecha'],
  });
  const conteo = {};
  for (const r of reservas) {
    conteo[r.fecha] = (conteo[r.fecha] || 0) + 1;
  }
  return conteo;
}

module.exports = { reservar, listarTodas, listarPorFecha, listarPorUsuario, cancelar, slotsDisponibles, bloquesReservados, obtenerTimeline, resumenMes, resumenMesUsuario, actualizarConfirmacionProfesional, DURACION_SLOT_HORAS };
