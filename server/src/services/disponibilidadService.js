const { Disponibilidad, Cancha } = require('../models');

async function listarPorCancha(canchaId) {
  return Disponibilidad.findAll({ where: { canchaId }, include: [{ model: Cancha, attributes: ['nombre'] }] });
}

async function configurar(dataArray) {
  const resultados = [];
  for (const item of dataArray) {
    const [registro] = await Disponibilidad.upsert({
      canchaId: item.canchaId,
      diaSemana: item.diaSemana,
      horaInicio: item.horaInicio,
      horaFin: item.horaFin,
    });
    resultados.push(registro);
  }
  return resultados;
}

async function eliminar(id) {
  const disp = await Disponibilidad.findByPk(id);
  if (!disp) throw { status: 404, message: 'Disponibilidad no encontrada' };
  return disp.destroy();
}

module.exports = { listarPorCancha, configurar, eliminar };
