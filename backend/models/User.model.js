const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'artist'], default: 'user' },
  gender: { type: String, enum: ['male', 'female'], default: 'male' },
  age:{type:Number},
  createdAt: { type: Date, default: Date.now },
  profilePicture: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],
  artistProfile: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist'
  },
  followingArtists: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Artist', 
    default:[]
  }],
followers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: [] 
  }],
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: [] 
  }],
  
});
userSchema.virtual('followingArtistsCount').get(function() {
  return this.followingArtists?.length || 0;
});

// تمكين الحقول الافتراضية في النتائج
userSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    // تأكد من تضمين الـ virtuals
    ret.followingArtistsCount = doc.followingArtists?.length || 0;
  
    
    // إزالة الحقول الحساسة
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

userSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret) {
    ret.followingArtistsCount = doc.followingArtists?.length || 0;
 
    
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});
module.exports = mongoose.model('User', userSchema);