const profesionalService = require('../services/profesionalService');

async function listar(req, res, next) {
  try {
    const mostrarTodos = req.query.todas === 'true' && req.usuario?.rol === 'admin';
    const profesionales = await profesionalService.listar(mostrarTodos);
    res.json(profesionales);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const profesional = await profesionalService.obtener(req.params.id);
    res.json(profesional);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const { nombre, especialidad, telefono, emailContacto } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: true, message: 'El nombre es obligatorio' });
    }
    const profesional = await profesionalService.crear({ nombre: nombre.trim(), especialidad, telefono, emailContacto });
    res.status(201).json(profesional);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const profesional = await profesionalService.actualizar(req.params.id, req.body);
    res.json(profesional);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await profesionalService.eliminar(req.params.id);
    res.json({ mensaje: 'Profesional desactivado correctamente' });
  } catch (err) {
    next(err);
  }
}

async function eliminarPermanente(req, res, next) {
  try {
    await profesionalService.eliminarPermanente(req.params.id);
    res.json({ mensaje: 'Profesional eliminado permanentemente' });
  } catch (err) {
    next(err);
  }
}

async function asignarCanchas(req, res, next) {
  try {
    const { canchaIds } = req.body;
    if (!Array.isArray(canchaIds)) {
      return res.status(400).json({ error: true, message: 'canchaIds debe ser un arreglo' });
    }
    const profesional = await profesionalService.asignarCanchas(req.params.id, canchaIds);
    res.json(profesional);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, eliminarPermanente, asignarCanchas };
