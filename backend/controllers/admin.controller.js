// controllers/adminController.js
const Admin = require('../models/Admin.model');
const User = require('../models/User.model');
const Artwork = require('../models/Artwork.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


 

  

// إنشاء سوبر أدمن
exports.createSuperAdmin = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const superAdmin = new Admin({
      username,
      email,
      password: hashedPassword,
      fullName,
      role: 'superadmin',
      permissions: {
        canViewFinancial: true,
        canViewReports: true,
        canViewUsers: true,
        canViewArtworks: true,
        canManageAdmins: true,
        canGenerateReports:true
      }
    });

    await superAdmin.save();

    res.status(201).json({
      success: true,
      message: 'Super admin created successfully',
      data: superAdmin
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating super admin',
      error: error.message
    });
  }
  
};

// تسجيل دخول الأدمن
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username, isActive: true });
    
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }

    // ⏰ زيادة مدة صلاحية التوكن
    const token = jwt.sign(
      { id: admin._id, role: admin.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' } // ⬅️ غيرت من 7d إلى 30d
    );

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
          permissions: admin.permissions
        },
        token
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل تسجيل الدخول',
      error: error.message
    });
  }
};

// إنشاء أدمن جديد
exports.createAdmin = async (req, res) => {
  try {
    const { username, email, password, fullName, role, permissions } = req.body;

    // التحقق من البيانات المطلوبة
    if (!username || !email || !password || !fullName || !role) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة'
      });
    }

    // التحقق من عدم وجود أدمن بنفس الاسم أو البريد
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'اسم المستخدم أو البريد الإلكتروني مسجل مسبقاً'
      });
    }

    // تشفير الباسوورد
    const hashedPassword = await bcrypt.hash(password, 12);

    // إنشاء الأدمن الجديد
    const admin = new Admin({
      username,
      email,
      password: hashedPassword,
      fullName,
      role,
      permissions: permissions || {},
      createdBy: req.admin._id
    });

    await admin.save();

    // إرجاع البيانات بدون الباسوورد
    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الأدمن بنجاح',
      data: adminData
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء الأدمن',
      error: error.message
    });
  }
};

// الحصول على جميع الأدمن
exports.getAdmins = async (req, res) => {
  try {
    const currentAdminId = req.admin.id; // افترض أن ID المستخدم الحالي مخزن في req.admin.id
    
    // 🔹 جلب جميع الأدمن باستثناء السوبر أدمن والمستخدم الحالي
    const admins = await Admin.find({ 
      _id: { $ne: currentAdminId },
      role: { $ne: 'super_admin' }
    }).select('-password');
    
    res.json({
      success: true,
      data: admins
    });

  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admins',
      error: error.message
    });
  }
};
// تحديث أدمن
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const admin = await Admin.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: admin
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating admin',
      error: error.message
    });
  }
};

// حذف أدمن
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByIdAndDelete(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting admin',
      error: error.message
    });
  }
};

// الإحصائيات العامة
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalArtworks = await Artwork.countDocuments();
    const totalAdmins = await Admin.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalArtworks,
        totalAdmins,
        totalRevenue: 0
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// الحصول على بروفايل الأدمن
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    
    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin profile',
      error: error.message
    });
  }
};