const Artwork = require('../models/Artwork.model');
const User = require('../models/User.model');

exports.getAllArtworks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, category } = req.query;
    
    // بناء query البحث
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (category) query.category = category;

    const artworks = await Artwork.find(query)
      .populate('artist', 'name email username')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Artwork.countDocuments(query);

    res.json({
      success: true,
      artworks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الأعمال الفنية'
    });
  }
};

exports.getArtworksStats = async (req, res) => {
  try {
    const totalArtworks = await Artwork.countDocuments();
    const activeArtworks = await Artwork.countDocuments({ status: 'active' });
    const soldArtworks = await Artwork.countDocuments({ status: 'sold' });
    const pendingArtworks = await Artwork.countDocuments({ status: 'pending' });

    // إحصائيات المبيعات (إذا عندك نظام مبيعات)
    const salesStats = await Artwork.aggregate([
      { $match: { status: 'sold' } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$price' },
          averagePrice: { $avg: '$price' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalArtworks,
        activeArtworks,
        soldArtworks,
        pendingArtworks,
        totalSales: salesStats[0]?.totalSales || 0,
        averagePrice: salesStats[0]?.averagePrice || 0
      }
    });
  } catch (error) {
    console.error('Error fetching artworks stats:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب إحصائيات الأعمال الفنية'
    });
  }
};

exports.getArtworkDetails = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
      .populate('artist', 'name email username')
      .populate('category', 'name')
      .populate('comments.user', 'name username');

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'العمل الفني غير موجود'
      });
    }

    res.json({
      success: true,
      artwork
    });
  } catch (error) {
    console.error('Error fetching artwork details:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب تفاصيل العمل الفني'
    });
  }
};

exports.updateArtworkStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const artwork = await Artwork.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'العمل الفني غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث حالة العمل الفني بنجاح',
      artwork
    });
  } catch (error) {
    console.error('Error updating artwork status:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث حالة العمل الفني'
    });
  }
};

exports.deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findByIdAndDelete(req.params.id);

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'العمل الفني غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف العمل الفني بنجاح'
    });
  } catch (error) {
    console.error('Error deleting artwork:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في حذف العمل الفني'
    });
  }
};