'use strict';

module.exports = {
  up: async (queryInterface) => {
    const canchas = await queryInterface.sequelize.query(
      'SELECT id FROM Canchas ORDER BY id ASC',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const horarios = [];
    for (let dia = 1; dia <= 6; dia++) {
      for (const c of canchas) {
        horarios.push({
          canchaId: c.id,
          diaSemana: dia,
          horaInicio: '09:00',
          horaFin: '23:00',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
    await queryInterface.bulkInsert('Disponibilidads', horarios);

    const users = await queryInterface.sequelize.query(
      "SELECT id FROM Users WHERE email = 'juan@correo.cl' LIMIT 1",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (users.length > 0 && canchas.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      await queryInterface.bulkInsert('Reservas', [
        {
          usuarioId: users[0].id,
          canchaId: canchas[0].id,
          fecha: today,
          horaInicio: '10:00',
          horaFin: '11:00',
          estado: 'activa',
          precioTotal: 25000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Reservas', null, {});
    await queryInterface.bulkDelete('Disponibilidads', null, {});
  },
};
