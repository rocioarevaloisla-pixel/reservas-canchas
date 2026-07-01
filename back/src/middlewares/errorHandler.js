const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  if (status === 500) {
    console.error('[ERROR]', err);
  }
  res.status(status).json({
    error: true,
    message: status === 500 ? 'Error interno del servidor' : err.message,
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: true,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
  });
};

module.exports = { errorHandler, notFoundHandler };
