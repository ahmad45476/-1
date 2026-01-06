// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { adminAuth, requirePermission } = require('../middleware/adminAuth'); // ✅ التصحيح
const { 
  createSuperAdmin, 
  adminLogin, 
  createAdmin, 
  getAdmins, 
  getDashboardStats,
  updateAdmin,
  deleteAdmin,
  getAdminProfile
} = require('../controllers/admin.controller');

// لا تحتاج مصادقة
router.post('/createsuper', createSuperAdmin);
router.post('/login', adminLogin);

// تحتاج مصادقة
router.get('/profile', adminAuth, getAdminProfile);
router.get('/dashboard/stats', adminAuth, getDashboardStats);
router.post('/admins', adminAuth, requirePermission('canManageAdmins'), createAdmin);
router.get('/admins', adminAuth, requirePermission('canManageAdmins'), getAdmins);
router.put('/admins/:id', adminAuth, requirePermission('canManageAdmins'), updateAdmin);
router.delete('/admins/:id', adminAuth, requirePermission('canManageAdmins'), deleteAdmin);
router.get('/roles', (req, res) => {
  const roles = [
    { value: 'financial_admin', label: 'أدمن مالي' },
    { value: 'reports_admin', label: 'أدمن إبلاغات' },
    { value: 'user_admin', label: 'أدمن مستخدمين' },
    { value: 'artwork_admin', label: 'أدمن أعمال فنية' },
    { value: 'superadmin', label: 'سوبر أدمن' }
  ];
  
  res.json({
    success: true,
    roles: roles
  });
});
module.exports = router;