const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const auth = require('../middlewares/auth');

// Public routes
router.post('/register', controller.register);
router.post('/login', controller.login);

// Protected routes
router.get('/me', auth, controller.getUser);
router.put('/update', auth, controller.updateUser);
router.patch('/status', auth, controller.setStatus);
router.delete('/delete', auth, controller.softDelete);

module.exports = router;
