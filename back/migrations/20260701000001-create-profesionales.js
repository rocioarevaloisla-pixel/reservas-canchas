'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Profesionales', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      especialidad: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      emailContacto: {
        type: Sequelize.STRING(150),
        allowNull: true,
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

    await queryInterface.createTable('CanchaProfesionales', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      canchaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Canchas', key: 'id' },
        onDelete: 'CASCADE',
      },
      profesionalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Profesionales', key: 'id' },
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('CanchaProfesionales');
    await queryInterface.dropTable('Profesionales');
  },
};
