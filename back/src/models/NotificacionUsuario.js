const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificacionUsuario = sequelize.define('NotificacionUsuario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reservaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  leido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'NotificacionesUsuario',
  timestamps: true,
});

module.exports = NotificacionUsuario;
