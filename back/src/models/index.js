const User = require('./User');
const Cancha = require('./Cancha');
const Disponibilidad = require('./Disponibilidad');
const Reserva = require('./Reserva');
const Profesional = require('./Profesional');
const Servicio = require('./Servicio');
const Notificacion = require('./Notificacion');
const NotificacionUsuario = require('./NotificacionUsuario');

User.hasMany(Reserva, { foreignKey: 'usuarioId' });
Reserva.belongsTo(User, { foreignKey: 'usuarioId' });

Cancha.hasMany(Reserva, { foreignKey: 'canchaId' });
Reserva.belongsTo(Cancha, { foreignKey: 'canchaId' });

Cancha.hasMany(Disponibilidad, { foreignKey: 'canchaId' });
Disponibilidad.belongsTo(Cancha, { foreignKey: 'canchaId' });

Cancha.belongsToMany(Profesional, { through: 'CanchaProfesionales', foreignKey: 'canchaId', as: 'Profesionales' });
Profesional.belongsToMany(Cancha, { through: 'CanchaProfesionales', foreignKey: 'profesionalId', as: 'Canchas' });

Profesional.hasMany(Servicio, { foreignKey: 'profesionalId' });
Servicio.belongsTo(Profesional, { foreignKey: 'profesionalId' });

Reserva.belongsTo(Servicio, { foreignKey: 'servicioId' });

Notificacion.belongsTo(Profesional, { foreignKey: 'profesionalId' });
Notificacion.belongsTo(Reserva, { foreignKey: 'reservaId' });
Notificacion.belongsTo(Servicio, { foreignKey: 'servicioId' });

NotificacionUsuario.belongsTo(User, { foreignKey: 'usuarioId' });
User.hasMany(NotificacionUsuario, { foreignKey: 'usuarioId' });

module.exports = { User, Cancha, Disponibilidad, Reserva, Profesional, Servicio, Notificacion, NotificacionUsuario };
