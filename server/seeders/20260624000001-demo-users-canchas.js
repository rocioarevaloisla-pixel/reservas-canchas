'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const hash = await bcrypt.hash('admin123', 10);
    const hashCliente = await bcrypt.hash('123456', 10);

    await queryInterface.bulkInsert('Users', [
      {
        nombre: 'Administrador',
        email: 'admin@canchas.cl',
        password: hash,
        rol: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Juan Pérez',
        email: 'juan@correo.cl',
        password: hashCliente,
        rol: 'cliente',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('Canchas', [
      {
        nombre: 'Cancha 1 - Fútbol 5',
        descripcion: 'Cancha de pasto sintético para fútbol 5',
        precioPorHora: 25000,
        capacidad: 5,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Cancha 2 - Fútbol 7',
        descripcion: 'Cancha de pasto sintético para fútbol 7',
        precioPorHora: 35000,
        capacidad: 7,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Cancha 3 - Fútbol 11',
        descripcion: 'Cancha profesional de pasto natural',
        precioPorHora: 50000,
        capacidad: 11,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Canchas', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  },
};
