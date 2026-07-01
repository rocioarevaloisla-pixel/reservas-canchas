const { NotificacionUsuario } = require('../models');

async function crearParaReserva(reservaId, usuarioId, mensaje) {
  return NotificacionUsuario.create({ reservaId, usuarioId, mensaje });
}

async function misNotificaciones(usuarioId) {
  return NotificacionUsuario.findAll({
    where: { usuarioId },
    order: [['createdAt', 'DESC']],
  });
}

async function marcarLeida(id, usuarioId) {
  const notif = await NotificacionUsuario.findOne({ where: { id, usuarioId } });
  if (!notif) throw { status: 404, message: 'Notificación no encontrada' };
  notif.leido = true;
  await notif.save();
  return notif;
}

async function contarNoLeidas(usuarioId) {
  return NotificacionUsuario.count({ where: { usuarioId, leido: false } });
}

module.exports = { crearParaReserva, misNotificaciones, marcarLeida, contarNoLeidas };
