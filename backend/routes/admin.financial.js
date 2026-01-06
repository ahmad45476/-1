const express = require('express');
const router = express.Router();
const { adminAuth, requirePermission } = require('../middleware/adminAuth');
const adminFinancialController = require('../controllers/admin.financial.controller');

// جميع routes تحتاج مصادقة أدمن
router.use(adminAuth);

// routes التقارير المالية
router.get('/', requirePermission('canViewFinancial'), adminFinancialController.getFinancialData);
router.get('/stats', requirePermission('canViewFinancial'), adminFinancialController.getFinancialStats);
router.get('/transactions', requirePermission('canViewFinancial'), adminFinancialController.getTransactions);
router.post('/reports/generate', requirePermission('canViewFinancial'), adminFinancialController.generateFinancialReport);

module.exports = router;