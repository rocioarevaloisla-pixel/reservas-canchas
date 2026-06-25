'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      rol: {
        type: Sequelize.ENUM('admin', 'cliente'),
        defaultValue: 'cliente',
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

    await queryInterface.createTable('Canchas', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      precioPorHora: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      capacidad: {
        type: Sequelize.INTEGER,
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

    await queryInterface.createTable('Disponibilidads', {
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
      diaSemana: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '0=Domingo, 1=Lunes ... 6=Sábado',
      },
      horaInicio: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      horaFin: {
        type: Sequelize.TIME,
        allowNull: false,
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

    await queryInterface.createTable('Reservas', {
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
      canchaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Canchas', key: 'id' },
        onDelete: 'CASCADE',
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      horaInicio: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      horaFin: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM('activa', 'cancelada'),
        defaultValue: 'activa',
      },
      precioTotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
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
    await queryInterface.dropTable('Reservas');
    await queryInterface.dropTable('Disponibilidads');
    await queryInterface.dropTable('Canchas');
    await queryInterface.dropTable('Users');
  },
};
