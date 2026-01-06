const express = require('express');
const router = express.Router();
const { adminAuth, requirePermission } = require('../middleware/adminAuth');
const {
  getTransactions,
  createTransaction,
  updateTransactionStatus,
  getFinancialStats
} = require('../controllers/financial.controller');

// جميع routes تحتاج صلاحية financial
router.get('/transactions', adminAuth, requirePermission('canViewFinancial'), getTransactions);
router.post('/transactions', adminAuth, requirePermission('canViewFinancial'), createTransaction);
router.put('/transactions/:id/status', adminAuth, requirePermission('canViewFinancial'), updateTransactionStatus);
router.get('/stats', adminAuth, requirePermission('canViewFinancial'), getFinancialStats);

module.exports = router;