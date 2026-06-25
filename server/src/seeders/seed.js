const sequelize = require('../config/database');
const { User, Cancha, Disponibilidad, Reserva } = require('../models');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Base de datos reiniciada');

    const admin = await User.create({
      nombre: 'Administrador',
      email: 'admin@canchas.cl',
      password: 'admin123',
      rol: 'admin',
    });
    console.log('Admin creado');

    const cliente = await User.create({
      nombre: 'Juan Pérez',
      email: 'juan@correo.cl',
      password: '123456',
      rol: 'cliente',
    });
    console.log('Cliente creado');

    const cancha1 = await Cancha.create({
      nombre: 'Cancha 1 - Fútbol 5',
      descripcion: 'Cancha de pasto sintético para fútbol 5',
      precioPorHora: 25000,
      capacidad: 5,
    });

    const cancha2 = await Cancha.create({
      nombre: 'Cancha 2 - Fútbol 7',
      descripcion: 'Cancha de pasto sintético para fútbol 7',
      precioPorHora: 35000,
      capacidad: 7,
    });

    const cancha3 = await Cancha.create({
      nombre: 'Cancha 3 - Fútbol 11',
      descripcion: 'Cancha profesional de pasto natural',
      precioPorHora: 50000,
      capacidad: 11,
    });
    console.log('Canchas creadas');

    const horarios = [];
    for (let dia = 1; dia <= 6; dia++) {
      for (const cancha of [cancha1, cancha2, cancha3]) {
        horarios.push({
          canchaId: cancha.id,
          diaSemana: dia,
          horaInicio: '09:00',
          horaFin: '23:00',
        });
      }
    }
    await Disponibilidad.bulkCreate(horarios);
    console.log('Horarios creados');

    await Reserva.create({
      usuarioId: cliente.id,
      canchaId: cancha1.id,
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '10:00',
      horaFin: '11:00',
      precioTotal: 25000,
    });

    console.log('Seed completado exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('Error en seed:', err);
    process.exit(1);
  }
}

seed();
