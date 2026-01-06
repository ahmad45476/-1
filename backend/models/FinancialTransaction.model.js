// models/FinancialTransaction.model.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['بيع', 'شراء', 'عمولة', 'سحب', 'إيداع', 'عمولة_منصة'],
    required: true 
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  fromUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  toUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  artwork: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Artwork' 
  },
  platformFee: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['معلق', 'مكتمل', 'فاشل', 'ملغى'],
    default: 'معلق'
  },
  transactionId: { type: String, unique: true },
  paymentMethod: String,
  notes: String,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Generate transaction ID before saving
transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  next();
});

// تصحيح اسم المتغير هنا
module.exports = mongoose.model('FinancialTransaction', transactionSchema);