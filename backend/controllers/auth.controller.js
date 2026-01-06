const authService = require('../services/auth.service');
const User=require("../models/User.model")



exports.register = async (req, res) => {
  try {
    const { username, email, password, role,gender,age } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!username || !email || !password || !gender || !age) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // التحقق من الصلاحيات المسموحة
    if (role && !['user', 'artist'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
    
    const result = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    const result = await authService.loginUser(email, password);
    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

// الحصول على بيانات المستخدم الحالي
exports.getMe = async (req, res) => {
  try {
    console.log('Authenticated user ID:', req.user.id);
    
    // ⬇️⬇️⬇️ هذا هو الكود الأصلي الصحيح ⬇️⬇️⬇️
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'artistProfile',
        select: '_id bio website profileImage socialMedia artworks followers following',
        populate: [
          {
            path: 'artworks',
            select: '_id title image description likes views createdAt category price comments rating artist imageUrl',
            populate: [
              {
                path: 'artist',
                select: '_id username profileImage'
              },
              {
                path: 'likes',
                select: '_id username'
              },
              {
                path: 'comments',
                select: '_id text user createdAt',
                populate: {
                  path: 'user',
                  select: '_id username profilePicture'
                }
              }
            ]
          },
          {
            path: 'followers',
            select: '_id username profilePicture email'
          },
          {
            path: 'following',
            select: '_id username profilePicture email'
          }
        ]
      })
      .populate('followingArtists', '_id username profilePicture email');
      
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // ⬇️⬇️⬇️ فقط أضف الكاونتس بدون تغيير البيانات ⬇️⬇️⬇️
    if (user.artistProfile && user.artistProfile.artworks) {
      user.artistProfile.artworks.forEach(artwork => {
        artwork.likesCount = artwork.likes?.length || 0;
        artwork.commentsCount = artwork.comments?.length || 0;
      });
      
      user.artistProfile.followersCount = user.artistProfile.followers?.length || 0;
      user.artistProfile.followingCount = user.artistProfile.following?.length || 0;
    }
    
    // ⬇️⬇️⬇️ أرسل البيانات كما هي ⬇️⬇️⬇️
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};