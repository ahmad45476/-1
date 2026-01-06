const Report = require('../models/Report.model');
const User = require('../models/User.model');

exports.getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('reportedBy', 'name username')
      .populate('handledBy', 'name username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الإبلاغات'
    });
  }
};

exports.getReportsStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });
    
    // الإبلاغات حسب النوع
    const reportsByType = await Report.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // تحويل النتائج لكائن سهل الاستخدام
    const typeStats = {};
    reportsByType.forEach(item => {
      typeStats[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        totalReports,
        pendingReports,
        resolvedReports,
        userReports: typeStats.user_reports || 0,
        artworkReports: typeStats.artwork_reports || 0,
        systemReports: typeStats.system_reports || 0,
        contentReports: typeStats.content_reports || 0
      }
    });
  } catch (error) {
    console.error('Error fetching reports stats:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب إحصائيات الإبلاغات'
    });
  }
};

exports.getReportDetails = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedBy', 'name email username')
      .populate('handledBy', 'name username')
      .populate('relatedArtwork', 'title')
      .populate('relatedUser', 'name username');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'الإبلاغ غير موجود'
      });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error fetching report details:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب تفاصيل الإبلاغ'
    });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolutionNotes,
        handledBy: req.user.id,
        handledAt: new Date()
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'الإبلاغ غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث حالة الإبلاغ بنجاح',
      report
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث حالة الإبلاغ'
    });
  }
};

exports.generateSystemReport = async (req, res) => {
  try {
    const { type, title, filters } = req.body;
    
    const reportData = {
      title: title || 'تقرير النظام',
      generatedAt: new Date(),
      type: type,
      filters: filters,
      data: {}
    };

    // حسب نوع التقرير
    switch (type) {
      case 'system_report':
        const systemStats = {
          totalUsers: await User.countDocuments(),
          totalArtworks: await require('../models/Artwork.model').countDocuments(),
          totalReports: await Report.countDocuments(),
          pendingReports: await Report.countDocuments({ status: 'pending' })
        };
        reportData.data = systemStats;
        break;

      case 'users_report':
        const usersData = await User.aggregate([
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 }
            }
          }
        ]);
        reportData.data = usersData;
        break;

      case 'artworks_report':
        const artworksData = await require('../models/Artwork.model').aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalValue: { $sum: '$price' }
            }
          }
        ]);
        reportData.data = artworksData;
        break;

      default:
        reportData.data = { message: 'نوع التقرير غير معروف' };
    }

    res.json({
      success: true,
      message: 'تم إنشاء التقرير بنجاح',
      report: reportData,
      reportUrl: `/reports/system-${Date.now()}.json`
    });

  } catch (error) {
    console.error('Error generating system report:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء تقرير النظام'
    });
  }
};