const reservaService = require('../services/reservaService');

async function crear(req, res, next) {
  try {
    if (req.usuario.rol === 'admin') {
      return res.status(403).json({ error: true, message: 'Los administradores no pueden reservar canchas' });
    }
    const { canchaId, fecha, horaInicio, horaFin, servicioId } = req.body;
    if (!canchaId || !fecha || !horaInicio || !horaFin) {
      return res.status(400).json({ error: true, message: 'canchaId, fecha, horaInicio y horaFin son requeridos' });
    }
    const reserva = await reservaService.reservar({
      usuarioId: req.usuario.id,
      canchaId,
      fecha,
      horaInicio,
      horaFin,
      servicioId: servicioId || null,
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

async function confirmarProfesional(req, res, next) {
  try {
    const { estado } = req.body;
    if (!['pendiente', 'confirmado', 'rechazado'].includes(estado)) {
      return res.status(400).json({ error: true, message: 'Estado inválido' });
    }
    const reserva = await reservaService.actualizarConfirmacionProfesional(req.params.id, estado);
    res.json(reserva);
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
    const slots = await reservaService.obtenerTimeline(canchaId, fecha, req.usuario.id);
    res.json({ slots });
  } catch (err) {
    next(err);
  }
}

async function resumenMes(req, res, next) {
  try {
    const { ano, mes } = req.query;
    if (!ano || !mes) {
      return res.status(400).json({ error: true, message: 'ano y mes son requeridos' });
    }
    const conteo = await reservaService.resumenMes(parseInt(ano), parseInt(mes));
    res.json(conteo);
  } catch (err) {
    next(err);
  }
}

async function resumenMesUsuario(req, res, next) {
  try {
    const { ano, mes } = req.query;
    if (!ano || !mes) {
      return res.status(400).json({ error: true, message: 'ano y mes son requeridos' });
    }
    const conteo = await reservaService.resumenMesUsuario(parseInt(ano), parseInt(mes), req.usuario.id);
    res.json(conteo);
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, listar, cancelar, confirmarProfesional, slots, resumenMes, resumenMesUsuario };
