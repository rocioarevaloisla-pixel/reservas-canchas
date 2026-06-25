const { Router } = require('express');
const canchaController = require('../controllers/canchaController');
const { authMiddleware, adminMiddleware, authOpcional } = require('../middlewares/auth');

const router = Router();

router.get('/', authOpcional, canchaController.listar);
router.get('/:id', canchaController.obtener);
router.post('/', authMiddleware, adminMiddleware, canchaController.crear);
router.put('/:id', authMiddleware, adminMiddleware, canchaController.actualizar);
router.delete('/:id', authMiddleware, adminMiddleware, canchaController.eliminar);

module.exports = router;
