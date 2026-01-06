// routes/publicUser.routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users/:id - Public endpoint لجلب بيانات المستخدم
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    console.log('📥 Fetching user with ID:', userId);
    
    // التحقق من صحة الـ ID
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم غير صالح'
      });
    }
    
    // البحث عن المستخدم
    const user = await User.findById(userId)
      .select('-password -__v -email -resetPasswordToken -resetPasswordExpire');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      user: user
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// GET /api/users/batch - جلب عدة مستخدمين
router.post('/batch', async (req, res) => {
  try {
    const { userIds } = req.body;
    
    console.log('📥 Fetching batch users:', userIds);
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إرسال مصفوفة من معرفات المستخدمين'
      });
    }
    
    // تصفية المعرفات الصالحة فقط
    const validIds = userIds.filter(id => id && id.match(/^[0-9a-fA-F]{24}$/));
    
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لا توجد معرفات مستخدم صالحة'
      });
    }
    
    // جلب جميع المستخدمين دفعة واحدة
    const users = await User.find({ _id: { $in: validIds } })
      .select('-password -__v -email -resetPasswordToken -resetPasswordExpire');
    
    res.status(200).json({
      success: true,
      users: users,
      count: users.length
    });
    
  } catch (error) {
    console.error('Error fetching users batch:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;