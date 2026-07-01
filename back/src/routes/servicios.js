const { Router } = require('express');
const servicioController = require('../controllers/servicioController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

const router = Router();

router.get('/profesional/:profesionalId', servicioController.listar);
router.get('/:id', servicioController.obtener);
router.post('/profesional/:profesionalId', authMiddleware, adminMiddleware, servicioController.crear);
router.put('/:id', authMiddleware, adminMiddleware, servicioController.actualizar);
router.delete('/:id', authMiddleware, adminMiddleware, servicioController.eliminar);

module.exports = router;
