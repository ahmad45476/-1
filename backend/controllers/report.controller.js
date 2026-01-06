const Report = require('../models/Report.model');
const path = require('path');
const fs = require('fs');

// 📋 دالة إنشاء التقرير - نسخة مبسطة ومضمونة
exports.createReport = async (req, res) => {
  try {
    const { type, title, period, filters } = req.body;
    
    console.log('📋 طلب إنشاء تقرير:', { type, title });

    // ... (الكود السابق لا يتغير)

    let reportData;
    const reportPeriod = period || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    };

    // توليد البيانات حسب نوع التقرير
    const {
      generateUsersReport,
      generateArtworksReport,
      generateFinancialReport,
      generateSalesReport,
      generateAdminsData
    } = require("../services/Report.service");

    switch (type) {
      case 'admins':
        reportData = await generateAdminsData(reportPeriod, filters || {});
        break;
      case 'users':
        reportData = await generateUsersReport(reportPeriod, filters || {});
        break;
      case 'sales':
        reportData = await generateSalesReport(reportPeriod, filters || {});
        break;
      case 'financial':
        reportData = await generateFinancialReport(reportPeriod, filters || {});
        break;
      case 'artworks':
        reportData = await generateArtworksReport(reportPeriod, filters || {});
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'نوع التقرير غير مدعوم'
        });
    }

    console.log('✅ بيانات التقرير المُنشأة:', Object.keys(reportData));

    if (reportData.error) {
      return res.status(500).json({
        success: false,
        message: reportData.error
      });
    }

    // ✅ إصلاح: أنشئ التقرير أولاً بدون PDF
    const report = new Report({
      title,
      type,
      data: reportData,
      generatedBy: req.admin._id,
      period: reportPeriod,
      filters: filters || {},
      status: 'completed'
    });

    await report.save();
    console.log('💾 التقرير محفوظ في قاعدة البيانات:', report._id);

    // ✅ الآن حاول إنشاء PDF بشكل منفصل
    let fileUrl = null;
    try {
      console.log('🔄 محاولة إنشاء PDF...');
      const generatePdfReport = require('../utils/pdfGenerator');
      
      // 🔍 تحقق من البيانات قبل إرسالها للـ PDF
      console.log('🔍 البيانات المرسلة للـ PDF:', {
        title: report.title,
        type: report.type,
        data: report.data
      });

      fileUrl = await generatePdfReport(report.data, report.title, report.type);
      console.log('✅ تم إنشاء PDF بنجاح:', fileUrl);
      
      // ✅ تحديث التقرير برابط PDF
      report.fileUrl = fileUrl;
      await report.save();
      console.log('📎 تم ربط PDF بالتقرير');
      
    } catch (pdfError) {
      console.error('❌ فشل إنشاء PDF:', pdfError.message);
      console.error('❌ تفاصيل الخطأ:', pdfError.stack);
      // لا توقف العملية إذا فشل PDF
    }

    res.status(201).json({
      success: true,
      message: 'تم إنشاء التقرير بنجاح',
      data: {
        reportId: report._id,
        title: report.title,
        type: report.type,
        createdAt: report.createdAt,
        downloadUrl: `/api/reports/download/${report._id}`,
        viewUrl: `/api/reports/view/${report._id}`,
        hasPdf: !!fileUrl,
        dataPreview: reportData
      }
    });

  } catch (error) {
    console.error('❌ خطأ في إنشاء التقرير:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء التقرير',
      error: error.message
    });
  }
};

// 📥 دالة تحميل التقرير - نسخة مبسطة
// 📥 دالة تحميل التقرير - معدلة
// 📥 دالة تحميل التقرير - مبسطة تماماً
exports.downloadReport = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📥 طلب تحميل تقرير:', id);

    const report = await Report.findById(id).populate('generatedBy', 'username email');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'التقرير غير موجود'
      });
    }

    console.log('✅ التقرير موجود:', report.title);

    // ✅ المحاولة 1: إذا يوجد PDF، حمله
    if (report.fileUrl) {
      const filePath = path.join(__dirname, '..', report.fileUrl);
      console.log('📍 مسار ملف PDF:', filePath);
      
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log('📏 حجم ملف PDF:', stats.size, 'bytes');
        
        if (stats.size > 0) {
          console.log('✅ ملف PDF موجود وجاهز، جاري التحميل...');
          
          // ✅ استخدام اسم ملف إنجليزي فقط
          const filename = `report_${report._id}.pdf`;
          
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('Content-Length', stats.size);
          
          const fileStream = fs.createReadStream(filePath);
          return fileStream.pipe(res);
        } else {
          console.warn('⚠️ ملف PDF فارغ (0 bytes)');
        }
      } else {
        console.warn('⚠️ ملف PDF غير موجود رغم وجود رابط');
      }
    }

    // ✅ المحاولة 2: إنشاء PDF جديد
    try {
      console.log('🔄 محاولة إنشاء PDF جديد...');
      const generatePdfReport = require('../utils/pdfGenerator');
      const newPdfPath = await generatePdfReport(report.data, report.title, report.type);
      
      if (newPdfPath) {
        console.log('✅ تم إنشاء PDF جديد:', newPdfPath);
        
        // حفظ رابط PDF الجديد
        report.fileUrl = newPdfPath;
        await report.save();
        
        const filePath = path.join(__dirname, '..', newPdfPath);
        const stats = fs.statSync(filePath);
        
        if (stats.size > 0) {
          const filename = `report_${report._id}.pdf`;
          
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('Content-Length', stats.size);
          
          const fileStream = fs.createReadStream(filePath);
          return fileStream.pipe(res);
        }
      }
    } catch (pdfError) {
      console.warn('⚠️ فشل إنشاء PDF:', pdfError.message);
    }

    // ✅ المحاولة 3: إرجاع البيانات كـ JSON (بدون headers معقدة)
    console.log('📊 إرجاع البيانات كـ JSON...');
    
    const responseData = {
      success: true,
      message: 'تم إنشاء التقرير بنجاح',
      report: {
        id: report._id,
        title: report.title,
        type: report.type,
        createdAt: report.createdAt,
        period: report.period,
        generatedBy: report.generatedBy?.username || 'غير معروف',
        data: report.data || {}
      }
    };

    // ✅ إرجاع كـ JSON response عادي (بدون تحميل)
    res.json(responseData);

  } catch (error) {
    console.error('❌ خطأ في تحميل التقرير:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحميل التقرير',
      error: error.message
    });
  }
};

// 👀 دالة عرض التقرير - مبسطة
exports.viewReport = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('👀 طلب عرض تقرير:', id);

    const report = await Report.findById(id).populate('generatedBy', 'username email');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'التقرير غير موجود'
      });
    }

    console.log('✅ التقرير موجود:', report.title);

    // ✅ المحاولة 1: إذا يوجد PDF، اعرضه
    if (report.fileUrl) {
      const filePath = path.join(__dirname, '..', report.fileUrl);
      console.log('📍 مسار ملف PDF:', filePath);
      
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log('📏 حجم ملف PDF:', stats.size, 'bytes');
        
        if (stats.size > 0) {
          console.log('✅ عرض ملف PDF...');
          res.setHeader('Content-Type', 'application/pdf');
          
          const fileStream = fs.createReadStream(filePath);
          return fileStream.pipe(res);
        }
      }
    }

    // ✅ المحاولة 2: إنشاء PDF جديد للعرض
    try {
      console.log('🔄 إنشاء PDF جديد للعرض...');
      const generatePdfReport = require('../utils/pdfGenerator');
      const newPdfPath = await generatePdfReport(report.data, report.title, report.type);
      
      if (newPdfPath) {
        // حفظ رابط PDF الجديد
        report.fileUrl = newPdfPath;
        await report.save();
        
        const filePath = path.join(__dirname, '..', newPdfPath);
        const stats = fs.statSync(filePath);
        
        if (stats.size > 0) {
          res.setHeader('Content-Type', 'application/pdf');
          const fileStream = fs.createReadStream(filePath);
          return fileStream.pipe(res);
        }
      }
    } catch (pdfError) {
      console.warn('⚠️ فشل إنشاء PDF:', pdfError.message);
    }

    // ✅ المحاولة 3: عرض البيانات كـ HTML
    console.log('🌐 عرض البيانات كـ HTML...');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    const htmlContent = `
<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>${report.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .info { background: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0; }
        pre { background: #2d3748; color: white; padding: 20px; border-radius: 5px; overflow-x: auto; }
        .alert { background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${report.title}</h1>
        <div class="alert">
            ⚠️ ملاحظة: يتم عرض البيانات كـ HTML
        </div>
        <div class="info">
            <strong>نوع التقرير:</strong> ${report.type}<br>
            <strong>تاريخ الإنشاء:</strong> ${new Date(report.createdAt).toLocaleString('ar-EG')}<br>
            <strong>أنشأ بواسطة:</strong> ${report.generatedBy?.username || 'غير معروف'}
        </div>
        <h2>بيانات التقرير:</h2>
        <pre>${JSON.stringify(report.data, null, 2)}</pre>
    </div>
</body>
</html>
    `;
    
    res.send(htmlContent);

  } catch (error) {
    console.error('❌ خطأ في عرض التقرير:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء عرض التقرير',
      error: error.message
    });
  }
};

// 📊 دالة جلب جميع التقارير
exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, startDate, endDate } = req.query;
    
    const query = {};
    
    if (type) query.type = type;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const reports = await Report.find(query)
      .populate('generatedBy', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReports: total
      }
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التقارير',
      error: error.message
    });
  }
};

// 🗑️ دالة حذف التقرير
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'التقرير غير موجود'
      });
    }

    await Report.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'تم حذف التقرير بنجاح'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف التقرير',
      error: error.message
    });
  }
};