const notificacionUsuarioService = require('../services/notificacionUsuarioService');

async function misNotificaciones(req, res, next) {
  try {
    const notificaciones = await notificacionUsuarioService.misNotificaciones(req.usuario.id);
    res.json(notificaciones);
  } catch (err) {
    next(err);
  }
}

async function contarNoLeidas(req, res, next) {
  try {
    const count = await notificacionUsuarioService.contarNoLeidas(req.usuario.id);
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

async function marcarLeida(req, res, next) {
  try {
    const notif = await notificacionUsuarioService.marcarLeida(req.params.id, req.usuario.id);
    res.json(notif);
  } catch (err) {
    next(err);
  }
}

module.exports = { misNotificaciones, contarNoLeidas, marcarLeida };
