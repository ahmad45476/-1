const mongoose = require('mongoose');

const userReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  targetType: {
    type: String,
    enum: ['user', 'artwork', 'comment', 'event'], // ✅ إضافة 'event'
    required: true
  },
  
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // إضافة مرجع ديناميكي حسب النوع (اختياري ولكن مفيد)
    refPath: 'targetModel'
  },
  
  // حقل إضافي لتحديد النموذج المستهدف ديناميكياً
  targetModel: {
    type: String,
    enum: ['User', 'Artwork', 'Comment', 'Event'],
    required: true
  },
  
  reason: {
    type: String,
    enum: [
      'spam',               // محتوى غير مرغوب فيه
      'inappropriate',      // محتوى غير لائق
      'harassment',         // تحرش أو تنمر
      'hate_speech',        // خطاب كراهية
      'copyright',          // انتهاك حقوق ملكية
      'impersonation',      // انتحال شخصية
      'violence',           // تحريض على العنف
      'nudity',             // محتوى إباحي
      'false_information',  // معلومات خاطئة (للفعاليات)
      'scam',               // احتيال (للفعاليات)
      'other'               // سبب آخر
    ],
    required: true
  },
  
  customReason: {
    type: String,
    maxlength: 200
  },
  
  details: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  evidence: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'يجب أن يكون الرابط صورة صالحة'
    }
  }],
  
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'rejected'],
    default: 'pending'
  },
  
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  reviewedAt: Date,
  
  actionTaken: {
    type: String,
    enum: [
      'content_removed',      // تم حذف المحتوى
      'user_warned',          // تم تحذير المستخدم
      'account_suspended',    // تعليق الحساب
      'account_banned',       // حظر الحساب
      'event_cancelled',      // إلغاء الفعالية (جديد)
      'no_action',            // لا يوجد إجراء
      'false_report'          // بلاغ كاذب
    ]
  },
  
  actionDetails: {
    type: String,
    maxlength: 200
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  reporterNotified: {
    type: Boolean,
    default: false
  },
  
  targetNotified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ فهرس مركب لمنع البلاغات المكررة
userReportSchema.index(
  { reporter: 1, targetId: 1, targetType: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

// ✅ فهرس لتحسين أداء الاستعلامات
userReportSchema.index({ targetType: 1, targetId: 1, status: 1 });
userReportSchema.index({ status: 1, createdAt: -1 });
userReportSchema.index({ priority: 1, status: 1 });

const UserReport = mongoose.model('UserReport', userReportSchema);
module.exports = UserReport;