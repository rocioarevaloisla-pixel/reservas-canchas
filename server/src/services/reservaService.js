const { Reserva, Cancha, User, Disponibilidad } = require('../models');
const { Op } = require('sequelize');

function normalizarHora(timeStr) {
  return timeStr.slice(0, 5);
}

async function reservar({ usuarioId, canchaId, fecha, horaInicio, horaFin }) {
  const cancha = await Cancha.findByPk(canchaId);
  if (!cancha || !cancha.activo) {
    throw { status: 404, message: 'Cancha no disponible' };
  }

  const hoy = new Date().toISOString().split('T')[0];
  if (fecha < hoy) {
    throw { status: 400, message: 'No puedes reservar en una fecha pasada' };
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
  const precioTotal = parseFloat(cancha.precioPorHora) * horas;

  return Reserva.create({ usuarioId, canchaId, fecha, horaInicio, horaFin, precioTotal });
}

async function listarTodas() {
  return Reserva.findAll({
    include: [
      { model: Cancha, attributes: ['nombre', 'precioPorHora'] },
      { model: User, attributes: ['nombre', 'email'] },
    ],
    order: [['fecha', 'DESC'], ['horaInicio', 'ASC']],
  });
}

async function listarPorFecha(fecha) {
  return Reserva.findAll({
    where: { fecha, estado: 'activa' },
    include: [
      { model: Cancha, attributes: ['nombre', 'precioPorHora'] },
      { model: User, attributes: ['nombre', 'email'] },
    ],
    order: [['horaInicio', 'ASC']],
  });
}

async function listarPorUsuario(usuarioId, fecha) {
  const where = { usuarioId };
  if (fecha) where.fecha = fecha;
  return Reserva.findAll({
    where,
    include: [{ model: Cancha, attributes: ['nombre', 'precioPorHora'] }],
    order: [['fecha', 'DESC'], ['horaInicio', 'ASC']],
  });
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
    throw { status: 400, message: 'La reserva ya est� cancelada' };
  }
  return reserva.update({ estado: 'cancelada' });
}

function sumarHora(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return `${String(h + 2).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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
      const horaFinSlot = sumarHora(inicio);
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

module.exports = { reservar, listarTodas, listarPorFecha, listarPorUsuario, cancelar, slotsDisponibles };
