// controllers/financial.controller.js
const FinancialTransaction = require('../models/FinancialTransaction.model'); // المسار الصحيح
const User = require('../models/User.model');
const Artwork = require('../models/Artwork.model');

// الحصول على جميع المعاملات
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const transactions = await FinancialTransaction.find(filter)
      .populate('fromUser', 'username fullName')
      .populate('toUser', 'username fullName')
      .populate('artwork', 'title imageUrl')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FinancialTransaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// إنشاء معاملة جديدة
exports.createTransaction = async (req, res) => {
  try {
    const transaction = new FinancialTransaction(req.body);
    await transaction.save();

    await transaction.populate('fromUser', 'username fullName');
    await transaction.populate('toUser', 'username fullName');
    await transaction.populate('artwork', 'title');

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message
    });
  }
};

// تحديث حالة المعاملة
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const transaction = await FinancialTransaction.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
    .populate('fromUser', 'username fullName')
    .populate('toUser', 'username fullName')
    .populate('artwork', 'title');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      error: error.message
    });
  }
};

// الإحصائيات المالية
exports.getFinancialStats = async (req, res) => {
  try {
    const totalRevenue = await FinancialTransaction.aggregate([
      { $match: { type: 'بيع', status: 'مكتمل' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const platformEarnings = await FinancialTransaction.aggregate([
      { $match: { type: 'عمولة_منصة', status: 'مكتمل' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentTransactions = await FinancialTransaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('fromUser', 'username')
      .populate('toUser', 'username');

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        platformEarnings: platformEarnings[0]?.total || 0,
        recentTransactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching financial stats',
      error: error.message
    });
  }
};