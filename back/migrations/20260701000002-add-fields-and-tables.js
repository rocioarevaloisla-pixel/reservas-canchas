'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear tabla Servicios
    await queryInterface.createTable('Servicios', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      profesionalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Profesionales', key: 'id' },
        onDelete: 'CASCADE',
      },
      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      precio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Agregar servicioId y confirmacionProfesional a Reservas
    await queryInterface.addColumn('Reservas', 'servicioId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Servicios', key: 'id' },
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('Reservas', 'confirmacionProfesional', {
      type: Sequelize.ENUM('pendiente', 'confirmado', 'rechazado'),
      defaultValue: 'pendiente',
    });

    // Crear tabla NotificacionesUsuario
    await queryInterface.createTable('NotificacionesUsuario', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      reservaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Reservas', key: 'id' },
        onDelete: 'CASCADE',
      },
      mensaje: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      leido: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('NotificacionesUsuario');
    await queryInterface.removeColumn('Reservas', 'confirmacionProfesional');
    await queryInterface.removeColumn('Reservas', 'servicioId');
    await queryInterface.dropTable('Servicios');

  },
};
