const User = require('../models/User.model');

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // التحقق من صحة الـ ID
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم غير صالح'
      });
    }
    
    // البحث عن المستخدم
    const user = await User.findById(userId)
      .select('-password') // استبعاد الباسوورد
      .select('-__v') // استبعاد الحقول الإضافية
      .lean(); // تحويل إلى كائن JavaScript عادي
    
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
      message: 'خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
exports.getUsersBatch = async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إرسال مصفوفة من معرفات المستخدمين'
      });
    }
    
    // تصفية المعرفات الصالحة فقط
    const validIds = userIds.filter(id => id.match(/^[0-9a-fA-F]{24}$/));
    
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لا توجد معرفات مستخدم صالحة'
      });
    }
    
    // جلب جميع المستخدمين دفعة واحدة
    const users = await User.find({ _id: { $in: validIds } })
      .select('-password')
      .select('-__v')
      .lean();
    
    // ترتيب النتائج بنفس ترتيب المدخلات
    const usersMap = {};
    users.forEach(user => {
      usersMap[user._id.toString()] = user;
    });
    
    const orderedUsers = validIds.map(id => usersMap[id] || null);
    
    res.status(200).json({
      success: true,
      users: orderedUsers,
      count: users.length
    });
    
  } catch (error) {
    console.error('Error fetching users batch:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    // التحقق من صلاحية المستخدم
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتعديل هذا المستخدم'
      });
    }
    
    // إزالة الحقول التي لا يمكن تحديثها
    const allowedUpdates = ['name', 'username', 'email', 'profilePicture', 'bio', 'gender', 'age', 'phone'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    // تحديث المستخدم
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      filteredUpdates,
      { new: true, runValidators: true }
    ).select('-password -__v');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};
exports.toggleSaveArtwork = async (req, res) => {
  try {
    const artworkId = req.params.id;
    const userId = req.user.id;

  const isSaved = user.savedArtworks.some(
  id => id.toString() === artworkId
);


    if (isSaved) {
      await User.findByIdAndUpdate(userId, {
        $pull: { savedArtworks: artworkId }
      });

      await Artwork.findByIdAndUpdate(artworkId, {
        $pull: { savedBy: userId }
      });

      return res.json({
        success: true,
        saved: false,
        message: "Artwork unsaved"
      });
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { savedArtworks: artworkId }
    });

    await Artwork.findByIdAndUpdate(artworkId, {
      $addToSet: { savedBy: userId }
    });

    res.json({
      success: true,
      saved: true,
      message: "Artwork saved"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getSavedArtworks = async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: "savedArtworks",
      populate: {
        path: "artist",
        select: "username profilePicture"
      }
    });

  res.json({
    success: true,
    savedArtworks: user.savedArtworks || []
  });
};

exports.getUserFollowers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .populate('followers', 'username name profilePicture')
      .select('followers');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      followers: user.followers || []
    });
    
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
exports.getUserFollowing = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .populate('following', 'username name profilePicture')
      .select('following');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      following: user.following || []
    });
    
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
// متابعة/إلغاء متابعة مستخدم
exports.toggleFollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id; // المستخدم اللي بدنا نتابعه
    const currentUserId = req.user.id; // المستخدم الحالي

    console.log('🎯 Toggle follow user:', {
      targetUserId,
      currentUserId
    });

    // التأكد من عدم متابعة النفس
    if (targetUserId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "لا يمكنك متابعة نفسك"
      });
    }

    // البحث عن المستخدمين
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود"
      });
    }

    // التحقق إذا كان المستخدم يتابع بالفعل
    const isFollowing = currentUser.following?.includes(targetUserId) || false;
    const isFollower = targetUser.followers?.includes(currentUserId) || false;

    console.log('🔍 Current status:', {
      isFollowing,
      isFollower,
      currentFollowingCount: currentUser.following?.length || 0,
      targetFollowersCount: targetUser.followers?.length || 0
    });

    if (isFollowing) {
      // إلغاء المتابعة
      await User.findByIdAndUpdate(
        currentUserId,
        { $pull: { following: targetUserId } },
        { new: true }
      );
      
      await User.findByIdAndUpdate(
        targetUserId,
        { $pull: { followers: currentUserId } },
        { new: true }
      );

      console.log('✅ Unfollowed user');

      res.json({
        success: true,
        isFollowing: false,
        message: "تم إلغاء المتابعة بنجاح",
        data: {
          followersCount: (targetUser.followers?.length || 1) - 1,
          followingCount: (currentUser.following?.length || 1) - 1
        }
      });
    } else {
      // إضافة متابعة
      await User.findByIdAndUpdate(
        currentUserId,
        { $addToSet: { following: targetUserId } },
        { new: true }
      );
      
      await User.findByIdAndUpdate(
        targetUserId,
        { $addToSet: { followers: currentUserId } },
        { new: true }
      );

      console.log('✅ Followed user');

      res.json({
        success: true,
        isFollowing: true,
        message: "تم المتابعة بنجاح",
        data: {
          followersCount: (targetUser.followers?.length || 0) + 1,
          followingCount: (currentUser.following?.length || 0) + 1
        }
      });
    }

  } catch (error) {
    console.error('❌ Error in toggleFollowUser:', error);
    res.status(500).json({
      success: false,
      message: "خطأ في الخادم: " + error.message
    });
  }
};

