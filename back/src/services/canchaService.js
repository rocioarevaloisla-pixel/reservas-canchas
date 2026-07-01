const { Cancha, Profesional, Servicio } = require('../models');

async function listar(mostrarTodas = false) {
  const where = mostrarTodas ? {} : { activo: true };
  return Cancha.findAll({
    where,
    include: [{ model: Profesional, as: 'Profesionales', attributes: ['id', 'nombre', 'especialidad', 'telefono', 'emailContacto'], through: { attributes: [] }, include: [{ model: Servicio, where: { activo: true }, required: false, attributes: ['id', 'nombre', 'descripcion', 'precio'] }] }],
    order: [['nombre', 'ASC']],
  });
}

async function obtener(id) {
  const cancha = await Cancha.findByPk(id, {
    include: [{ model: Profesional, as: 'Profesionales', attributes: ['id', 'nombre', 'especialidad', 'telefono', 'emailContacto'], through: { attributes: [] }, include: [{ model: Servicio, where: { activo: true }, required: false, attributes: ['id', 'nombre', 'descripcion', 'precio'] }] }],
  });
  if (!cancha) throw { status: 404, message: 'Cancha no encontrada' };
  return cancha;
}

async function crear(data) {
  return Cancha.create(data);
}

async function actualizar(id, data) {
  const cancha = await obtener(id);
  return cancha.update(data);
}

async function eliminar(id) {
  const cancha = await obtener(id);
  const { Reserva } = require('../models');
  const reservasActivas = await Reserva.count({
    where: { canchaId: id, estado: 'activa' },
  });
  if (reservasActivas > 0) {
    throw { status: 409, message: 'No se puede eliminar: la cancha tiene reservas activas' };
  }
  return cancha.update({ activo: false });
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
