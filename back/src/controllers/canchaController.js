const canchaService = require('../services/canchaService');

async function listar(req, res, next) {
  try {
    const mostrarTodas = req.query.todas === 'true' && req.usuario?.rol === 'admin';
    const canchas = await canchaService.listar(mostrarTodas);
    res.json(canchas);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const cancha = await canchaService.obtener(req.params.id);
    res.json(cancha);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const { nombre, descripcion, precioPorHora, capacidad } = req.body;
    if (!nombre || !precioPorHora || !capacidad) {
      return res.status(400).json({ error: true, message: 'nombre, precioPorHora y capacidad son requeridos' });
    }
    if (parseFloat(precioPorHora) <= 0) {
      return res.status(400).json({ error: true, message: 'El precio por hora debe ser mayor a 0' });
    }
    if (parseInt(capacidad) <= 0) {
      return res.status(400).json({ error: true, message: 'La capacidad debe ser mayor a 0' });
    }
    const cancha = await canchaService.crear(req.body);
    res.status(201).json(cancha);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const cancha = await canchaService.actualizar(req.params.id, req.body);
    res.json(cancha);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await canchaService.eliminar(req.params.id);
    res.json({ mensaje: 'Cancha desactivada correctamente' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
