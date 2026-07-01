const { Servicio, Profesional } = require('../models');

async function listar(profesionalId) {
  const where = { profesionalId };
  return Servicio.findAll({ where, order: [['nombre', 'ASC']] });
}

async function obtener(id) {
  const servicio = await Servicio.findByPk(id);
  if (!servicio) throw { status: 404, message: 'Servicio no encontrado' };
  return servicio;
}

async function crear(data) {
  return Servicio.create(data);
}

async function actualizar(id, data) {
  const servicio = await obtener(id);
  return servicio.update(data);
}

async function eliminar(id) {
  const servicio = await obtener(id);
  return servicio.update({ activo: false });
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
