const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: true, message: 'nombre, email y password son requeridos' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: true, message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: true, message: 'Ingresa un email v�lido' });
    }
    const result = await authService.registrar({ nombre, email, password, rol });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'email y password son requeridos' });
    }
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function perfil(req, res, next) {
  try {
    const { User } = require('../models');
    const usuario = await User.findByPk(req.usuario.id, { attributes: { exclude: ['password'] } });
    if (!usuario) {
      return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, perfil };
