const disponibilidadService = require('../services/disponibilidadService');

async function listar(req, res, next) {
  try {
    const items = await disponibilidadService.listarPorCancha(req.params.canchaId);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function configurar(req, res, next) {
  try {
    const { horarios } = req.body;
    if (!Array.isArray(horarios) || horarios.length === 0) {
      return res.status(400).json({ error: true, message: 'horarios debe ser un array no vacío' });
    }
    const result = await disponibilidadService.configurar(horarios);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await disponibilidadService.eliminar(req.params.id);
    res.json({ mensaje: 'Disponibilidad eliminada' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, configurar, eliminar };
