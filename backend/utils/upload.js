const multer = require('multer');
const path = require('path');
const fs = require('fs');

// إنشاء مجلد التحميلات
const createUploadsFolder = () => {
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // إنشاء مجلدات إضافية للوثائق (للفعاليات فقط)
  const identityDir = path.join(__dirname, '../uploads/identity');
  const proofsDir = path.join(__dirname, '../uploads/proofs');
  
  if (!fs.existsSync(identityDir)) fs.mkdirSync(identityDir, { recursive: true });
  if (!fs.existsSync(proofsDir)) fs.mkdirSync(proofsDir, { recursive: true });
  
  return uploadDir;
};

// تهيئة Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // تحديد المجلد حسب نوع الملف (للفعاليات)
    if (file.fieldname === 'identityDocument') {
      cb(null, path.join(__dirname, '../uploads/identity'));
    } else if (file.fieldname === 'proofDocument') {
      cb(null, path.join(__dirname, '../uploads/proofs'));
    } else {
      cb(null, createUploadsFolder());
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    
    let prefix = 'artwork';
    if (file.fieldname === 'identityDocument') prefix = 'identity';
    if (file.fieldname === 'proofDocument') prefix = 'proof';
    
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // للوثائق (تقبل PDF والصور)
    if (file.fieldname === 'identityDocument' || file.fieldname === 'proofDocument') {
      const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      cb(null, extname && mimetype);
    } else {
      // للأعمال الفنية (صور فقط)
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      cb(null, extname && mimetype);
    }
  }
});

// ✅ Middleware للفعاليات فقط (يدعم رفع ملفات متعددة)
const uploadEventMiddleware = (req, res, next) => {
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'identityDocument', maxCount: 1 },
    { name: 'proofDocument', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    // إضافة مسارات الملفات إلى req.body
    if (req.files?.image) {
      req.body.imageUrl = `/uploads/${req.files.image[0].filename}`;
    }
    if (req.files?.identityDocument) {
      req.body.identityDocument = `/uploads/identity/${req.files.identityDocument[0].filename}`;
    }
    if (req.files?.proofDocument) {
      req.body.proofDocument = `/uploads/proofs/${req.files.proofDocument[0].filename}`;
    }
    
    next();
  });
};

// ✅ يبقى نفس الـ middleware القديم للأعمال الفنية (ما تغير شي)
const uploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or invalid file type' });
    }
    
    req.body.imageUrl = `/uploads/${req.file.filename}`;
    next();
  });
};
// ✅ Middleware جديد: رفع الصورة اختياري (لا يطلب ملفاً إجبارياً)
const optionalUploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      // إذا كان الخطأ بسبب عدم وجود ملف، تجاهله واستمر
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        console.log('⚠️ لا توجد صورة مرفوعة، متابعة بدون صورة');
        return next();
      }
      return res.status(400).json({ error: err.message });
    }
    
    // إذا كان هناك ملف، أضف مساره إلى req.body
    if (req.file) {
      req.body.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    next();
  });
};

// تصدير الكل
module.exports = uploadMiddleware;                    // للأعمال الفنية (يتطلب ملف)
module.exports.uploadEventMiddleware = uploadEventMiddleware; // للفعاليات
module.exports.optionalUploadMiddleware = optionalUploadMiddleware; // ✅ الجديد (اختياري)
