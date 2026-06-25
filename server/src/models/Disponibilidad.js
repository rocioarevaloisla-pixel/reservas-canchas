const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Disponibilidad = sequelize.define('Disponibilidad', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  canchaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  diaSemana: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '0=Domingo, 1=Lunes ... 6=S�bado',
  },
  horaInicio: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  horaFin: {
    type: DataTypes.TIME,
    allowNull: false,
  },
}, {
  tableName: 'Disponibilidads',
  timestamps: true,
});

module.exports = Disponibilidad;
