// models/SystemLog.js
const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  level: { 
    type: String, 
    enum: ['info', 'warning', 'error', 'debug'],
    default: 'info'
  },
  action: { type: String, required: true },
  message: { type: String, required: true },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  ipAddress: String,
  userAgent: String,
  metadata: mongoose.Schema.Types.Mixed,
  resource: String,
  method: String,
  statusCode: Number,
  responseTime: Number
}, {
  timestamps: true
});

// Index for better query performance
systemLogSchema.index({ level: 1, createdAt: -1 });
systemLogSchema.index({ user: 1, createdAt: -1 });
systemLogSchema.index({ action: 1 });

module.exports = mongoose.model('SystemLog', systemLogSchema);