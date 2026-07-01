const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notificacion = sequelize.define('Notificacion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  profesionalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reservaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  servicioId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'rechazada'),
    defaultValue: 'pendiente',
  },
  leido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'Notificaciones',
  timestamps: true,
});

module.exports = Notificacion;
