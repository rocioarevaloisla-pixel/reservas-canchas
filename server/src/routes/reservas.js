const { Router } = require('express');
const reservaController = require('../controllers/reservaController');
const { authMiddleware } = require('../middlewares/auth');

const router = Router();

router.get('/slots', reservaController.slots);
router.post('/', authMiddleware, reservaController.crear);
router.get('/', authMiddleware, reservaController.listar);
router.put('/:id/cancelar', authMiddleware, reservaController.cancelar);

module.exports = router;
