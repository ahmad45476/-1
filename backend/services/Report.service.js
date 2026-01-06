const User = require("../models/User.model");
const Artwork = require("../models/Artwork.model");
const FinancialTransaction = require("../models/FinancialTransaction.model");
const Admin = require("../models/Admin.model");

// تقرير المستخدمين
async function generateUsersReport(period, filters) {
  try {
    console.log('🔍 جلب بيانات المستخدمين...');
    
    const matchStage = {
      createdAt: { 
        $gte: new Date(period.start), 
        $lte: new Date(period.end) 
      }
    };

    const [totalUsers, newUsers, artists, activeUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments(matchStage),
      User.countDocuments({ role: 'artist' }),
      User.countDocuments({ status: 'active' })
    ]);

    // المستخدمين النشطين مؤخراً
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email role createdAt');

    return {
      totalUsers: totalUsers || 0,
      newUsers: newUsers || 0,
      artists: artists || 0,
      regularUsers: (totalUsers - artists) || 0,
      activeUsers: activeUsers || 0,
      inactiveUsers: (totalUsers - activeUsers) || 0,
      recentUsers: recentUsers.map(user => ({
        username: user.username,
        email: user.email,
        role: user.role,
        joined: user.createdAt
      })),
      message: 'تم إنشاء تقرير المستخدمين بنجاح'
    };

  } catch (error) {
    console.error('Error generating users report:', error);
    return {
      totalUsers: 0,
      newUsers: 0,
      artists: 0,
      regularUsers: 0,
      error: 'فشل في جلب بيانات المستخدمين'
    };
  }
}

// تقرير الأعمال الفنية
async function generateArtworksReport(period, filters) {
  try {
    console.log('🔍 جلب بيانات الأعمال الفنية...');
    
    const matchStage = {
      createdAt: { 
        $gte: new Date(period.start), 
        $lte: new Date(period.end) 
      }
    };

    const [totalArtworks, newArtworks, categories, statusCounts] = await Promise.all([
      Artwork.countDocuments(),
      Artwork.countDocuments(matchStage),
      Artwork.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Artwork.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    // الأعمال الحديثة
    const recentArtworks = await Artwork.find()
      .populate('artist', 'username')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title price category status createdAt');

    return {
      totalArtworks: totalArtworks || 0,
      newArtworks: newArtworks || 0,
      categories: categories || [],
      statusCounts: statusCounts || [],
      recentArtworks: recentArtworks.map(artwork => ({
        title: artwork.title,
        artist: artwork.artist?.username || 'غير معروف',
        price: artwork.price,
        category: artwork.category,
        status: artwork.status
      })),
      message: 'تم إنشاء تقرير الأعمال الفنية بنجاح'
    };

  } catch (error) {
    console.error('Error generating artworks report:', error);
    return {
      totalArtworks: 0,
      newArtworks: 0,
      error: 'فشل في جلب بيانات الأعمال الفنية'
    };
  }
}

// التقرير المالي
async function generateFinancialReport(period, filters) {
  try {
    console.log('🔍 جلب البيانات المالية...');
    
    const matchStage = {
      type: "بيع",
      status: "مكتمل",
      createdAt: { 
        $gte: new Date(period.start), 
        $lte: new Date(period.end) 
      }
    };

    const [revenue, platformFees, recentTransactions] = await Promise.all([
      FinancialTransaction.aggregate([
        { $match: matchStage },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      FinancialTransaction.aggregate([
        { 
          $match: {
            type: 'عمولة_منصة',
            status: 'مكتمل',
            createdAt: { 
              $gte: new Date(period.start), 
              $lte: new Date(period.end) 
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      FinancialTransaction.find(matchStage)
        .populate('user', 'username')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('amount type status createdAt')
    ]);

    return {
      totalRevenue: revenue[0]?.total || 0,
      totalSales: revenue[0]?.count || 0,
      platformEarnings: platformFees[0]?.total || 0,
      averageSale: revenue[0]?.total && revenue[0]?.count ? 
        (revenue[0].total / revenue[0].count).toFixed(2) : 0,
      recentTransactions: recentTransactions.map(transaction => ({
        user: transaction.user?.username || 'غير معروف',
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.createdAt
      })),
      message: 'تم إنشاء التقرير المالي بنجاح'
    };

  } catch (error) {
    console.error('Error generating financial report:', error);
    return {
      totalRevenue: 0,
      totalSales: 0,
      platformEarnings: 0,
      error: 'فشل في جلب البيانات المالية'
    };
  }
}

// تقرير المبيعات المتقدم
async function generateSalesReport(period, filters) {
  try {
    const sales = await FinancialTransaction.aggregate([
      {
        $match: {
          type: "بيع",
          status: "مكتمل",
          createdAt: { 
            $gte: new Date(period.start), 
            $lte: new Date(period.end) 
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
          averageSale: { $avg: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // أفضل المنتجات مبيعاً
    const topProducts = await FinancialTransaction.aggregate([
      {
        $match: {
          type: "بيع",
          status: "مكتمل",
          createdAt: { 
            $gte: new Date(period.start), 
            $lte: new Date(period.end) 
          }
        }
      },
      {
        $group: {
          _id: "$artwork",
          totalSold: { $sum: 1 },
          totalRevenue: { $sum: "$amount" }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "artworks",
          localField: "_id",
          foreignField: "_id",
          as: "artworkDetails"
        }
      }
    ]);

    return {
      period: period,
      totalSales: sales.reduce((sum, item) => sum + item.totalSales, 0),
      totalRevenue: sales.reduce((sum, item) => sum + item.totalRevenue, 0),
      averageSale: sales.reduce((sum, item) => sum + item.averageSale, 0) / sales.length || 0,
      dailyBreakdown: sales,
      topProducts: topProducts.map(item => ({
        artwork: item.artworkDetails[0]?.title || 'غير معروف',
        totalSold: item.totalSold,
        totalRevenue: item.totalRevenue
      })),
      message: 'تم إنشاء تقرير المبيعات بنجاح'
    };
  } catch (error) {
    console.error('Error generating sales report:', error);
    return { 
      error: 'فشل في إنشاء تقرير المبيعات: ' + error.message 
    };
  }
}

// تقرير الإبلاغات (دمية)
async function generateReportsData(period, filters) {
  return { 
    totalReports: 50, 
    openReports: 20, 
    closedReports: 30,
    message: 'بيانات الإبلاغات التجريبية'
  };
}

// تقرير المشرفين - الإصدار المحسن
async function generateAdminsData(period, filters) {
  try {
    console.log('🔍 جلب بيانات الأدمن...');
    
    const admins = await Admin.find().select('-password');
    const total = admins.length;
    const active = admins.filter(admin => admin.isActive).length;
    const suspended = total - active;
    
    // تجميع حسب الدور
    const roles = {};
    admins.forEach(admin => {
      const role = admin.role || 'user_admin';
      roles[role] = (roles[role] || 0) + 1;
    });

    // الأدمن النشطين مؤخراً
    const recentAdmins = await Admin.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('username email role isActive lastActive createdAt');

    return {
      summary: {
        total,
        active,
        suspended,
        activationRate: total > 0 ? ((active / total) * 100).toFixed(1) : 0
      },
      byRole: roles,
      admins: admins.map(admin => ({
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        isActive: admin.isActive,
        lastActive: admin.lastActive,
        createdAt: admin.createdAt,
        permissions: admin.permissions || {}
      })),
      recentAdmins: recentAdmins.map(admin => ({
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        lastActive: admin.lastActive
      })),
      generatedAt: new Date(),
      message: 'تم إنشاء تقرير المشرفين بنجاح'
    };

  } catch (error) {
    console.error('Error generating admins report:', error);
    return {
      error: 'فشل في جلب بيانات الأدمن: ' + error.message
    };
  }
}

module.exports = {
  generateUsersReport,
  generateArtworksReport,
  generateFinancialReport,
  generateSalesReport,
  generateReportsData,
  generateAdminsData
};