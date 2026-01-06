import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, DollarSign, CreditCard } from 'lucide-react';
import axios from 'axios';

const FinancialReports = ({ getToken, currentAdmin }) => {
  const [financialData, setFinancialData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchFinancialData();
    fetchFinancialStats();
  }, []);

  const fetchFinancialData = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:5000/api/admin/financial', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setFinancialData(response.data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setFinancialData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialStats = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:5000/api/admin/financial/stats', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setStats(response.data.data || {});
      }
    } catch (error) {
      console.error('Error fetching financial stats:', error);
      setStats({});
    }
  };

  const generateFinancialReport = async () => {
    try {
      setReportLoading(true);
      const token = getToken();
      
      const response = await axios.post('http://localhost:5000/api/admin/reports/generate', {
        type: 'financial_report',
        title: 'تقرير مالي',
        filters: {
          period: 'last_month',
          reportType: 'revenue'
        }
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert('✅ تم إنشاء التقرير المالي بنجاح');
        if (response.data.reportUrl) {
          window.open(response.data.reportUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('❌ فشل إنشاء التقرير');
    } finally {
      setReportLoading(false);
    }
  };

  const displayStats = [
    { 
      title: 'إجمالي الإيرادات', 
      value: stats.totalRevenue ? `$${stats.totalRevenue}` : '$0',
      icon: DollarSign,
      color: 'green'
    },
    { 
      title: 'المبيعات', 
      value: stats.totalSales || '0',
      icon: CreditCard,
      color: 'blue'
    },
    { 
      title: 'عمولات المنصة', 
      value: stats.totalCommissions ? `$${stats.totalCommissions}` : '$0',
      icon: TrendingUp,
      color: 'purple'
    },
    { 
      title: 'المعاملات', 
      value: stats.totalTransactions || '0',
      icon: FileText,
      color: 'orange'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#d5006d] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">التقارير المالية</h1>
          <p className="text-gray-400">عرض وتحليل البيانات المالية للمنصة</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={generateFinancialReport}
            disabled={reportLoading}
            className="px-4 py-2 bg-[#d5006d] text-white rounded-xl hover:bg-[#b3005c] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {reportLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FileText className="w-4 h-4" />
            )}
            إنشاء تقرير
          </button>
        </div>
      </div>

      {/* الإحصائيات المالية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-${stat.color}-500/20 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-300 font-medium">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* المعاملات الحديثة */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-white font-medium">آخر المعاملات</h3>
        </div>
        <div className="p-6">
          {financialData.length > 0 ? (
            <div className="space-y-4">
              {financialData.slice(0, 5).map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="text-white font-medium">{transaction.description}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(transaction.date).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                    </p>
                    <p className="text-gray-400 text-sm">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">لا توجد معاملات مالية</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;