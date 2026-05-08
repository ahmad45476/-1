const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const artworkController = require('../controllers/artwork.controller')
// تسجيل مستخدم جديد
router.post('/register', authController.register);

// تسجيل الدخول
router.post('/login', authController.login);

// الحصول على بيانات المستخدم الحالي
router.get('/me', authenticate, authController.getMe);


module.exports = router;