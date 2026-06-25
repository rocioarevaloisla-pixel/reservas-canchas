const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { port } = require('./config/config');
const sequelize = require('./config/database');

const authRoutes = require('./routes/auth');
const canchaRoutes = require('./routes/canchas');
const dispRoutes = require('./routes/disponibilidad');
const reservaRoutes = require('./routes/reservas');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/canchas', canchaRoutes);
app.use('/api/v1/disponibilidad', dispRoutes);
app.use('/api/v1/reservas', reservaRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida');

    await sequelize.sync();
    console.log('Base de datos sincronizada');

    app.listen(port, () => {
      console.log(`API corriendo en http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error al iniciar:', err);
    process.exit(1);
  }
}

start();
