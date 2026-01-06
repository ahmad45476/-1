const User = require('../models/User.model');
const Artist = require('../models/Artist.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  // تسجيل مستخدم جديد
  async registerUser(userData) {
    const { username, email, password, role,gender,age } = userData;

    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // إنشاء مستخدم جديد
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      gender,
      age
    });

    await user.save();

    // إذا كان المستخدم فناناً، ننشئ ملف فنان
    if (role === 'artist') {
      const artist = new Artist({
        user: user._id,
        bio: '',
        socialMedia: {}
      });
      await artist.save();
      
      // تحديث المستخدم بربطه بالملف الفني
      user.artistProfile = artist._id;
      await user.save();
    }

    // توليد توكن JWT
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        artistProfile: user.artistProfile
      }
    };
  }

  // تسجيل الدخول
  async loginUser(email, password) {
    // التحقق من وجود المستخدم مع تضمين artistProfile
    const user = await User.findOne({ email })
      .populate({
        path: 'artistProfile',
        select: 'bio website socialMedia'
      });
      
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // توليد توكن JWT
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        artistProfile: user.artistProfile
      }
    };
  }

  // توليد توكن JWT
  generateToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }
}

module.exports = new AuthService();