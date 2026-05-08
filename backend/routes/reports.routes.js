const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reports.controller');
const { adminAuth } = require('../middleware/adminAuth');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/adminAuth');

// ======================= مسارات المستخدم العادي =======================
router.post('/', authenticate, ReportController.createReport);
router.get('/:id', authenticate, ReportController.getReport);

// ======================= مسارات الأدمن =======================
// إحصائيات البلاغات
router.get('/admin/stats', adminAuth, ReportController.getStats);

// جلب جميع البلاغات (مع فلترة)
router.get('/admin/all', adminAuth, ReportController.getAllReports);

// معالجة بلاغ (قبول/رفض)
router.put('/admin/:id/resolve', adminAuth, ReportController.resolveReport);

// حذف بلاغ
router.delete('/admin/:id', adminAuth, ReportController.deleteReport);

// جلب بلاغات مستخدم معين
router.get('/admin/user/:userId', adminAuth, ReportController.getUserReports);

// ✅ جلب بلاغات فعالية معينة
router.get('/admin/event/:eventId', adminAuth, ReportController.getEventReports);

// ✅ إلغاء فعالية بناءً على بلاغ
router.post('/admin/event/cancel/:reportId', adminAuth,  ReportController.cancelEventByReport);

module.exports = router;