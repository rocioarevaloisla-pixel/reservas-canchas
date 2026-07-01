const { Router } = require('express');
const reservaController = require('../controllers/reservaController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

const router = Router();

router.get('/slots', authMiddleware, reservaController.slots);
router.get('/resumen-mes', reservaController.resumenMes);
router.get('/resumen-mes-usuario', authMiddleware, reservaController.resumenMesUsuario);
router.post('/', authMiddleware, reservaController.crear);
router.get('/', authMiddleware, reservaController.listar);
router.put('/:id/cancelar', authMiddleware, reservaController.cancelar);
router.put('/:id/confirmar-profesional', authMiddleware, adminMiddleware, reservaController.confirmarProfesional);

module.exports = router;
