// في ملف routes مثل adminReports.js
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin.model');
const auth = require('../middleware/auth');

// جلب جميع الإبلاغات
router.get('/reports', auth, async (req, res) => {
  try {
    // تحقق من الصلاحيات
    if (!req.admin.permissions.canViewReports && req.admin.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لعرض الإبلاغات'
      });
    }

    // جلب الإبلاغات من قاعدة البيانات
    const reports = await Report.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      reports: reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإبلاغات'
    });
  }
});

// معالجة إبلاغ
router.put('/reports/:id', auth, async (req, res) => {
  try {
    const { action } = req.body; // 'resolve', 'reject'
    const reportId = req.params.id;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'الإبلاغ غير موجود'
      });
    }

    // تحديث حالة الإبلاغ
    report.status = action === 'resolve' ? 'resolved' : 'rejected';
    report.handledBy = req.admin._id;
    report.handledAt = new Date();

    await report.save();

    res.json({
      success: true,
      message: `تم ${action === 'resolve' ? 'حل' : 'رفض'} الإبلاغ بنجاح`
    });
  } catch (error) {
    console.error('Error processing report:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في معالجة الإبلاغ'
    });
  }
});

module.exports = router;