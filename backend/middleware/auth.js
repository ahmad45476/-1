const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const multer = require("multer");
const path = require("path");





const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // التحقق من التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    // البحث عن المستخدم في قاعدة البيانات
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate({
        path: 'artistProfile',
        select: 'bio website socialMedia'
      });
    
    if (!user) {
      console.error('User not found for token ID:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }


    
    // إضافة المستخدم إلى كائن الطلب
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(500).json({ message: 'Authentication failed' });
  }
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

module.exports = multer({ storage });

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };