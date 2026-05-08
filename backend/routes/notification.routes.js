const express = require("express");
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const notificationController = require("../controllers/notification.controller");

// جلب إشعارات المستخدم الحالي
router.get('/my-notifications', authenticate, notificationController.getMyNotifications);
// جلب عدد الإشعارات غير المقروءة
router.get('/unread-count', authenticate, notificationController.getUnreadCount); // ✅ أضف هذا
// تحديث إشعار كمقروء
router.patch('/:id/read', authenticate, notificationController.markAsRead);
// تحديث كل الإشعارات كمقروءة
router.post('/mark-all-read', authenticate, notificationController.markAllAsRead);
// حذف إشعار
router.delete('/:id', authenticate, notificationController.deleteNotification);
router.get("/admin-notifications", adminAuth, notificationController.getAdminNotifications);
router.put("/admin/:id/read", adminAuth, notificationController.markAdminNotificationAsRead);
router.put("/admin/mark-all-read", adminAuth, notificationController.markAllAdminNotificationsAsRead);
router.get("/admin/unread-count", adminAuth, notificationController.getAdminUnreadCount);


module.exports = router;