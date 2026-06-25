const User = require('./User');
const Cancha = require('./Cancha');
const Disponibilidad = require('./Disponibilidad');
const Reserva = require('./Reserva');

User.hasMany(Reserva, { foreignKey: 'usuarioId' });
Reserva.belongsTo(User, { foreignKey: 'usuarioId' });

Cancha.hasMany(Reserva, { foreignKey: 'canchaId' });
Reserva.belongsTo(Cancha, { foreignKey: 'canchaId' });

Cancha.hasMany(Disponibilidad, { foreignKey: 'canchaId' });
Disponibilidad.belongsTo(Cancha, { foreignKey: 'canchaId' });

module.exports = { User, Cancha, Disponibilidad, Reserva };
