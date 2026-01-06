const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category:String,
  imageUrl: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  createdAt: { type: Date, default: Date.now },
  tags: [String],
   likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: [] 
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now },
    default:[]
  }],
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    value: { type: Number, min: 1, max: 5 }
  }]
});


// حساب عدد الإعجابات
artworkSchema.virtual('likesCount').get(function() {
  return this.likes.length|| 0; // ✅ استخدام Optional Chaining
});

artworkSchema.virtual('commentsCount').get(function() {
  return this.comments?.length || 0;
});

artworkSchema.virtual('ratingAverage').get(function() {
  if (!this.ratings || this.ratings.length === 0) return 0; // ✅ تحقق من وجود ratings
  const total = this.ratings.reduce((sum, rating) => sum + rating.value, 0);
  return parseFloat((total / this.ratings.length).toFixed(1));
});
// تمكين الحقول الافتراضية في النتائج
artworkSchema.set('toJSON', { virtuals: true });
artworkSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Artwork', artworkSchema);