const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cancha = sequelize.define('Cancha', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  precioPorHora: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  capacidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'Canchas',
  timestamps: true,
});

module.exports = Cancha;
