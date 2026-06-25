const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { jwtSecret, jwtExpiresIn } = require('../config/config');

async function registrar({ nombre, email, password, rol }) {
  const existe = await User.findOne({ where: { email } });
  if (existe) {
    throw { status: 409, message: 'El email ya está registrado' };
  }
  const hash = await bcrypt.hash(password, 10);
  const usuario = await User.create({ nombre, email, password: hash, rol: rol || 'cliente' });
  const token = generarToken(usuario);
  return { usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }, token };
}

async function login({ email, password }) {
  const usuario = await User.findOne({ where: { email } });
  if (!usuario) {
    throw { status: 401, message: 'Credenciales inv�lidas' };
  }
  const valida = await usuario.comparePassword(password);
  if (!valida) {
    throw { status: 401, message: 'Credenciales inv�lidas' };
  }
  const token = generarToken(usuario);
  return { usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }, token };
}

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
}

module.exports = { registrar, login };
