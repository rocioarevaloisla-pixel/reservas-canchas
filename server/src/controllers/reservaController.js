const reservaService = require('../services/reservaService');

async function crear(req, res, next) {
  try {
    if (req.usuario.rol === 'admin') {
      return res.status(403).json({ error: true, message: 'Los administradores no pueden reservar canchas' });
    }
    const { canchaId, fecha, horaInicio, horaFin } = req.body;
    if (!canchaId || !fecha || !horaInicio || !horaFin) {
      return res.status(400).json({ error: true, message: 'canchaId, fecha, horaInicio y horaFin son requeridos' });
    }
    const reserva = await reservaService.reservar({
      usuarioId: req.usuario.id,
      canchaId,
      fecha,
      horaInicio,
      horaFin,
    });
    res.status(201).json(reserva);
  } catch (err) {
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const { fecha } = req.query;
    if (req.usuario.rol === 'admin') {
      if (fecha) {
        const reservas = await reservaService.listarPorFecha(fecha);
        return res.json(reservas);
      }
      const reservas = await reservaService.listarTodas();
      return res.json(reservas);
    }
    if (fecha) {
      const reservas = await reservaService.listarPorUsuario(req.usuario.id, fecha);
      return res.json(reservas);
    }
    const reservas = await reservaService.listarPorUsuario(req.usuario.id);
    res.json(reservas);
  } catch (err) {
    next(err);
  }
}

async function cancelar(req, res, next) {
  try {
    const result = await reservaService.cancelar(req.params.id, req.usuario.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function slots(req, res, next) {
  try {
    const { canchaId, fecha } = req.query;
    if (!canchaId || !fecha) {
      return res.status(400).json({ error: true, message: 'canchaId y fecha son requeridos' });
    }
    const slots = await reservaService.slotsDisponibles(canchaId, fecha);
    res.json(slots);
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, listar, cancelar, slots };
