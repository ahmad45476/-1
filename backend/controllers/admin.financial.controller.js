const Transaction = require('../models/Transaction.model');
const Artwork = require('../models/Artwork.model');
const User = require('../models/User.model');

exports.getFinancialData = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .populate('user', 'name email')
      .populate('artwork', 'title price')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error fetching financial data:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب البيانات المالية'
    });
  }
};

exports.getFinancialStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // حساب الفترة الزمنية
    let startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // إحصائيات الإيرادات
    const revenueStats = await Transaction.aggregate([
      {
        $match: {
          type: 'income',
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          averageTransaction: { $avg: '$amount' }
        }
      }
    ]);

    // إحصائيات المبيعات
    const salesStats = await Artwork.aggregate([
      {
        $match: {
          status: 'sold',
          soldAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$price' },
          artworksSold: { $sum: 1 }
        }
      }
    ]);

    // عمولات المنصة
    const commissionStats = await Transaction.aggregate([
      {
        $match: {
          type: 'commission',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalCommissions: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        totalSales: salesStats[0]?.totalSales || 0,
        totalCommissions: commissionStats[0]?.totalCommissions || 0,
        totalTransactions: revenueStats[0]?.transactionCount || 0,
        artworksSold: salesStats[0]?.artworksSold || 0
      }
    });
  } catch (error) {
    console.error('Error fetching financial stats:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الإحصائيات المالية'
    });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    let query = {};
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .populate('user', 'name email')
      .populate('artwork', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب المعاملات'
    });
  }
};

exports.generateFinancialReport = async (req, res) => {
  try {
    const { type, title, filters } = req.body;
    
    // جمع البيانات للتقرير
    const reportData = {
      title: title || 'تقرير مالي',
      generatedAt: new Date(),
      type: type,
      filters: filters,
      data: {}
    };

    // حسب نوع التقرير
    switch (type) {
      case 'revenue_report':
        const revenueData = await Transaction.aggregate([
          {
            $match: {
              type: 'income',
              status: 'completed'
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              total: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        reportData.data = revenueData;
        break;

      case 'sales_report':
        const salesData = await Artwork.aggregate([
          {
            $match: { status: 'sold' }
          },
          {
            $group: {
              _id: '$category',
              totalSales: { $sum: '$price' },
              count: { $sum: 1 }
            }
          }
        ]);
        reportData.data = salesData;
        break;

      default:
        reportData.data = { message: 'نوع التقرير غير معروف' };
    }

    // هنا يمكنك إضافة حفظ التقرير في قاعدة البيانات
    // أو إنشاء ملف PDF/Excel

    res.json({
      success: true,
      message: 'تم إنشاء التقرير بنجاح',
      report: reportData,
      reportUrl: `/reports/financial-${Date.now()}.json` // رابط وهمي للتحميل
    });

  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء التقرير المالي'
    });
  }
};