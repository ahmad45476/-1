const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');

const adminAuth = async (req, res, next) => {
  try {
    // الحصول على التوكن من multiple sources
    let token = req.header('Authorization');
    
    if (!token && req.query.token) {
      token = `Bearer ${req.query.token}`;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // إزالة Bearer إذا موجود
    token = token.replace('Bearer ', '');

    console.log('🔐 JWT Secret exists:', !!process.env.JWT_SECRET);
    console.log('🔐 Token length:', token.length);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Decoded token:', decoded);

    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is suspended'
      });
    }

    // ✅ إصلاح: استخدم req.admin فقط
    req.admin = admin;
    console.log('✅ Admin authenticated:', admin.username);
    
    next();

  } catch (error) {
    console.error('❌ Auth error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// دالة التحقق من الصلاحيات - معدلة
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Superadmin لديه جميع الصلاحيات
    if (req.admin.role === 'superadmin') {
      return next();
    }

    // التحقق من الصلاحيات
    if (!req.admin.permissions || !req.admin.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions: ${permission}`
      });
    }

    next();
  };
};

module.exports = { adminAuth, requirePermission };