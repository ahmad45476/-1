const express = require('express');
const router = express.Router();
const { adminAuth, requirePermission } = require('../middleware/adminAuth');
const adminUserController = require('../controllers/admin.user.controller');

// جميع routes تحتاج مصادقة أدمن
router.use(adminAuth);

// ======================= routes المستخدمين =======================
router.get('/', requirePermission('canViewUsers'), adminUserController.getAllUsers);
router.get('/stats', requirePermission('canViewUsers'), adminUserController.getUserStats);
router.get('/:id', requirePermission('canViewUsers'), adminUserController.getUserDetails);
router.get('/:id/reports', requirePermission('canViewUsers'), adminUserController.getUserReports);
router.put('/:id/status', requirePermission('canManageUsers'), adminUserController.updateUserStatus); // ✅ changed from canViewUsers to canManageUsers
router.delete('/:id', requirePermission('canManageUsers'), adminUserController.deleteUser);

// ======================= routes الفعاليات =======================
// ✅ تأكد من وجود هذه الدوال في adminUserController
router.get("/events/pending", requirePermission('canApproveEvents'), adminUserController.getPendingEvents);
router.post("/events/:id/approve", requirePermission('canApproveEvents'), adminUserController.approveEvent);
router.post("/events/:id/reject", requirePermission('canApproveEvents'), adminUserController.rejectEvent);
router.post("/events/:id/block", requirePermission('canApproveEvents'), adminUserController.blockEvent);
router.post("/events/:id/unblock", requirePermission('canApproveEvents'), adminUserController.unblockEvent);
router.get("/events/all", requirePermission('canApproveEvents'), adminUserController.getAllEvents);

module.exports = router;