const express = require('express');
const router = express.Router();
const { adminAuth, requirePermission } = require('../middleware/adminAuth');
const adminReportController = require('../controllers/admin.report.controller');

// جميع routes تحتاج مصادقة أدمن
router.use(adminAuth);

// routes الإبلاغات
router.get('/', requirePermission('canViewReports'), adminReportController.getAllReports);
router.get('/stats', requirePermission('canViewReports'), adminReportController.getReportsStats);
router.get('/:id', requirePermission('canViewReports'), adminReportController.getReportDetails);
router.put('/:id/status', requirePermission('canViewReports'), adminReportController.updateReportStatus);
router.post('/generate', requirePermission('canViewReports'), adminReportController.generateSystemReport);

module.exports = router;