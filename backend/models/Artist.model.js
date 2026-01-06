const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  bio: String,
  profileImage:String,
  website: String,
  socialMedia: {
    instagram: String,
    twitter: String,
    facebook: String
  },
  artworks: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Artwork',
    default: [] // قيمة افتراضية
  }],
  followers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: [] // قيمة افتراضية
  }],
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Artist',
    default: [] // قيمة افتراضية
  }],
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    value: { type: Number, min: 1, max: 5 }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// حساب عدد المتابعين مع التحقق من وجود القيمة
artistSchema.virtual('followersCount').get(function() {
  return this.followers?.length || 0;
});

// حساب عدد المتابَعين مع التحقق من وجود القيمة
artistSchema.virtual('followingCount').get(function() {
  return this.following?.length || 0;
});

// حساب متوسط التقييم مع التحقق من وجود القيمة
artistSchema.virtual('ratingAverage').get(function() {
  if (!this.ratings || !Array.isArray(this.ratings) || this.ratings.length === 0) {
    return 0;
  }
  
  const total = this.ratings.reduce((sum, rating) => sum + (rating.value || 0), 0);
  return parseFloat((total / this.ratings.length).toFixed(1));
});

// تمكين الحقول الافتراضية في النتائج
artistSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    // إزالة الحقول غير الضرورية
    delete ret.id;
    delete ret.__v;
    return ret;
  }
});

artistSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.id;
    delete ret.__v;
    return ret;
  }
});


module.exports = mongoose.model('Artist', artistSchema);