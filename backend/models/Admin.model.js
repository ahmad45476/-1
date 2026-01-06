// models/Admin.model.js
const mongoose = require('mongoose');


const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
 // في Admin.model.js
role: { 
  type: String, 
  enum: [
    'financial_admin', 
    'reports_admin', 
    'superadmin',
    'user_admin',
    'artwork_admin'
  ], 
  default: 'superadmin' 
},
  permissions: {
    canViewFinancial: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: false },
    canViewUsers: { type: Boolean, default: false },
    canViewArtworks: { type: Boolean, default: false },
    canManageAdmins: { type: Boolean, default: false },
    canGenerateReports:{ type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// قبل حفظ الأدمن، حدد الصلاحيات تلقائياً
adminSchema.pre('save', function(next) {
  if (this.isNew) { // فقط للأدمن الجديد
    this.permissions = {
      canViewFinancial: this.role === 'financial_admin' || this.role === 'superadmin',
      canViewReports: this.role === 'reports_admin' || this.role === 'superadmin',
      canViewUsers: this.role === 'user_admin' || this.role === 'superadmin',
      canViewArtworks: this.role === 'artwork_admin' || this.role === 'superadmin',
      canManageAdmins: this.role === 'superadmin',
      canGenerateReports: (this.role === 'financial_admin' || this.role === 'reports_admin' || this.role === 'superadmin')
    };
  }
  next();
});

module.exports = mongoose.model('Admin', adminSchema);