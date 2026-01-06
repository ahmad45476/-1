const express = require('express');
const router = express.Router();
const { adminAuth, requirePermission } = require('../middleware/adminAuth');
const adminUserController = require('../controllers/admin.user.controller');

// جميع routes تحتاج مصادقة أدمن
router.use(adminAuth);

// routes المستخدمين
router.get('/', requirePermission('canViewUsers'), adminUserController.getAllUsers);
router.get('/stats', requirePermission('canViewUsers'), adminUserController.getUsersStats);
router.get('/:id', requirePermission('canViewUsers'), adminUserController.getUserDetails);
router.put('/:id/status', requirePermission('canViewUsers'), adminUserController.updateUserStatus);
router.delete('/:id', requirePermission('canViewUsers'), adminUserController.deleteUser);

module.exports = router;