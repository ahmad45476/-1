// models/Report.model.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['user_reports', 'artwork_reports', 'system_reports', 'content_reports'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  reportedBy: { type: String, required: true },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  handledAt: { type: Date },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);