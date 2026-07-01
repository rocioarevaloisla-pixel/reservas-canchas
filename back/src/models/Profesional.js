const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Profesional = sequelize.define('Profesional', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  especialidad: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  telefono: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  emailContacto: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'Profesionales',
  timestamps: true,
});

module.exports = Profesional;
