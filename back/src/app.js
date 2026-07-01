const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { port } = require('./config/config');
const sequelize = require('./config/database');

const authRoutes = require('./routes/auth');
const canchaRoutes = require('./routes/canchas');
const dispRoutes = require('./routes/disponibilidad');
const reservaRoutes = require('./routes/reservas');
const profesionalRoutes = require('./routes/profesionales');
const servicioRoutes = require('./routes/servicios');
const notificacionUsuarioRoutes = require('./routes/notificacionesUsuario');
const { User, Cancha, Disponibilidad, Reserva } = require('./models');
const bcrypt = require('bcryptjs');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : '*');
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/canchas', canchaRoutes);
app.use('/api/v1/disponibilidad', dispRoutes);
app.use('/api/v1/reservas', reservaRoutes);
app.use('/api/v1/profesionales', profesionalRoutes);
app.use('/api/v1/servicios', servicioRoutes);
app.use('/api/v1/notificaciones-usuario', notificacionUsuarioRoutes);

const clientDist = path.join(__dirname, '../../front/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDist, 'index.html'));
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida');

    await sequelize.sync();
    console.log('Base de datos sincronizada');

    const userCount = await User.count();
    if (userCount === 0) {
      console.log('Sembrando datos iniciales...');
      const hash = await bcrypt.hash('admin123', 10);
      const hashCliente = await bcrypt.hash('123456', 10);
      await User.bulkCreate([
        { nombre: 'Administrador', email: 'admin@canchas.cl', password: hash, rol: 'admin' },
        { nombre: 'Pepe', email: 'pepe@gmail.com', password: hashCliente, rol: 'cliente' },
      ]);
      const canchas = await Cancha.bulkCreate([
        { nombre: 'Cancha 1 - Fútbol 5', descripcion: 'Cancha de pasto sintético para fútbol 5', precioPorHora: 25000, capacidad: 5 },
        { nombre: 'Cancha 2 - Fútbol 7', descripcion: 'Cancha de pasto sintético para fútbol 7', precioPorHora: 35000, capacidad: 7 },
        { nombre: 'Cancha 3 - Fútbol 11', descripcion: 'Cancha profesional de pasto natural', precioPorHora: 50000, capacidad: 11 },
      ]);
      const horarios = [];
      for (let dia = 1; dia <= 6; dia++) {
        for (const c of canchas) {
          horarios.push({ canchaId: c.id, diaSemana: dia, horaInicio: '09:00', horaFin: '23:00' });
        }
      }
      await Disponibilidad.bulkCreate(horarios);
      console.log('Datos iniciales sembrados');
    }

    app.listen(port, () => {
      console.log(`API corriendo en http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error al iniciar:', err);
    process.exit(1);
  }
}

start();
