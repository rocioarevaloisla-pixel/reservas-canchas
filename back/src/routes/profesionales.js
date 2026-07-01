const { Router } = require('express');
const profesionalController = require('../controllers/profesionalController');
const { authMiddleware, adminMiddleware, authOpcional } = require('../middlewares/auth');

const router = Router();

router.get('/', authOpcional, profesionalController.listar);
router.get('/:id', profesionalController.obtener);
router.post('/', authMiddleware, adminMiddleware, profesionalController.crear);
router.put('/:id', authMiddleware, adminMiddleware, profesionalController.actualizar);
router.put('/:id/canchas', authMiddleware, adminMiddleware, profesionalController.asignarCanchas);
router.delete('/:id', authMiddleware, adminMiddleware, profesionalController.eliminar);
router.delete('/:id/permanente', authMiddleware, adminMiddleware, profesionalController.eliminarPermanente);

module.exports = router;
