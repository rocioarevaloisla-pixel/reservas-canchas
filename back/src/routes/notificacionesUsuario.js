const { Router } = require('express');
const notificacionUsuarioController = require('../controllers/notificacionUsuarioController');
const { authMiddleware } = require('../middlewares/auth');

const router = Router();

router.get('/', authMiddleware, notificacionUsuarioController.misNotificaciones);
router.get('/contar', authMiddleware, notificacionUsuarioController.contarNoLeidas);
router.put('/:id/leer', authMiddleware, notificacionUsuarioController.marcarLeida);

module.exports = router;
