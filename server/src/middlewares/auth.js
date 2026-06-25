const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inv�lido o expirado' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  }
  next();
}

function authOpcional(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.usuario = decoded;
    } catch (_) {}
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware, authOpcional };
