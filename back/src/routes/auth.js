const { Router } = require('express');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/perfil', authMiddleware, authController.perfil);

module.exports = router;
