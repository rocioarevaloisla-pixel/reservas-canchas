const servicioService = require('../services/servicioService');

async function listar(req, res, next) {
  try {
    const profesionalId = req.params.profesionalId;
    const servicios = await servicioService.listar(profesionalId);
    res.json(servicios);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const servicio = await servicioService.obtener(req.params.id);
    res.json(servicio);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const { nombre, descripcion, precio } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: true, message: 'El nombre es obligatorio' });
    }
    if (!precio || parseFloat(precio) <= 0) {
      return res.status(400).json({ error: true, message: 'El precio debe ser mayor a 0' });
    }
    const servicio = await servicioService.crear({
      profesionalId: req.params.profesionalId,
      nombre: nombre.trim(),
      descripcion,
      precio: parseFloat(precio),
    });
    res.status(201).json(servicio);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const servicio = await servicioService.actualizar(req.params.id, req.body);
    res.json(servicio);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await servicioService.eliminar(req.params.id);
    res.json({ mensaje: 'Servicio desactivado correctamente' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
