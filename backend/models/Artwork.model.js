const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  imageUrl: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  createdAt: { type: Date, default: Date.now },
  tags: [String],
  price: { type: Number, min: 0, default: 0 },
  // ✅ إضافة حقول جديدة للـ blockchain
  tokenId: { type: Number }, // معرف العمل على البلوكشين
  transactionHash: { type: String }, // هاش المعاملة
  soldAt: { type: Date }, // تاريخ البيع
  isForSale: { type: Boolean, default: false }, // ✅ حقل حقيقي للبيع
   owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'ownerModel', // ديناميكي
    required: true
  },
  ownerModel: { 
    type: String, 
    enum: ['Artist', 'User'],
    default: 'Artist'
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: [] 
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now },
  }],
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    value: { type: Number, min: 1, max: 5 }
  }],
  // ✅ حقول الحظر - أضف هذه
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  blockReason: { type: String, default: null },
  blockedAt: { type: Date, default: null },
  blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null }
}, {
  timestamps: true
});

// الحقول المحسوبة (virtuals)
artworkSchema.virtual('likesCount').get(function() {
  return this.likes?.length || 0; 
});

artworkSchema.virtual('commentsCount').get(function() {
  return this.comments?.length || 0;
});

artworkSchema.virtual('ratingAverage').get(function() {
  if (!this.ratings || this.ratings.length === 0) return 0; 
  const total = this.ratings.reduce((sum, rating) => sum + rating.value, 0);
  return parseFloat((total / this.ratings.length).toFixed(1));
});

artworkSchema.set('toJSON', { virtuals: true });
artworkSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Artwork', artworkSchema);