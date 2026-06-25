const { Router } = require('express');
const dispController = require('../controllers/disponibilidadController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

const router = Router();

router.get('/cancha/:canchaId', dispController.listar);
router.post('/', authMiddleware, adminMiddleware, dispController.configurar);
router.delete('/:id', authMiddleware, adminMiddleware, dispController.eliminar);

module.exports = router;
