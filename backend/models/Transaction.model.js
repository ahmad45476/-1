const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artwork: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
  type: { 
    type: String, 
    enum: ['purchase', 'sale', 'commission', 'withdrawal', 'refund'],
    required: true 
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending' 
  },
  description: String,
  paymentMethod: String,
  transactionId: String, // من بوابة الدفع
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);