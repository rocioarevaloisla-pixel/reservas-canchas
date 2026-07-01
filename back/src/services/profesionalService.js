const { Profesional, Cancha } = require('../models');

async function listar(mostrarTodos = false) {
  const where = mostrarTodos ? {} : { activo: true };
  return Profesional.findAll({
    where,
    include: [{ model: Cancha, as: 'Canchas', attributes: ['id', 'nombre'], through: { attributes: [] } }],
    order: [['nombre', 'ASC']],
  });
}

async function obtener(id) {
  const profesional = await Profesional.findByPk(id, {
    include: [{ model: Cancha, as: 'Canchas', attributes: ['id', 'nombre'], through: { attributes: [] } }],
  });
  if (!profesional) throw { status: 404, message: 'Profesional no encontrado' };
  return profesional;
}

async function crear(data) {
  return Profesional.create(data);
}

async function actualizar(id, data) {
  const profesional = await obtener(id);
  return profesional.update(data);
}

async function eliminar(id) {
  const profesional = await obtener(id);
  return profesional.update({ activo: false });
}

async function eliminarPermanente(id) {
  const profesional = await Profesional.findByPk(id);
  if (!profesional) throw { status: 404, message: 'Profesional no encontrado' };
  await profesional.destroy();
}

async function asignarCanchas(profesionalId, canchaIds) {
  const profesional = await Profesional.findByPk(profesionalId);
  if (!profesional) throw { status: 404, message: 'Profesional no encontrado' };
  await profesional.setCanchas(canchaIds);
  return profesional.reload({ include: [{ model: Cancha, as: 'Canchas', attributes: ['id', 'nombre'], through: { attributes: [] } }] });
}

module.exports = { listar, obtener, crear, actualizar, eliminar, eliminarPermanente, asignarCanchas };
