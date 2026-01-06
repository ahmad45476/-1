import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertCircle, Users, Image, Download } from 'lucide-react';
import axios from 'axios';

const ReportsManagement = ({ getToken, currentAdmin }) => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchReportsData();
    fetchReportsStats();
  }, []);

  const fetchReportsData = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:5000/api/admin/reports', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setReports(response.data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportsStats = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:5000/api/admin/reports/stats', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setStats(response.data.data || {});
      }
    } catch (error) {
      console.error('Error fetching reports stats:', error);
      setStats({});
    }
  };

  const generateSystemReport = async () => {
    try {
      setReportLoading(true);
      const token = getToken();
      
      const response = await axios.post('http://localhost:5000/api/admin/reports/generate', {
        type: 'system_report',
        title: 'تقرير النظام',
        filters: {
          period: 'last_week',
          reportScope: 'all'
        }
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert('✅ تم إنشاء تقرير النظام بنجاح');
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

  const reportTypes = [
    {
      id: 'user_reports',
      title: 'إبلاغات المستخدمين',
      description: 'المشاكل والإبلاغات المقدمة من المستخدمين',
      icon: Users,
      color: 'blue',
      count: stats.userReports || 0
    },
    {
      id: 'artwork_reports',
      title: 'إبلاغات الأعمال الفنية',
      description: 'الإبلاغات على الأعمال الفنية والمحتوى',
      icon: Image,
      color: 'purple',
      count: stats.artworkReports || 0
    },
    {
      id: 'system_reports',
      title: 'إبلاغات النظام',
      description: 'مشاكل النظام والأخطاء التقنية',
      icon: AlertCircle,
      color: 'orange',
      count: stats.systemReports || 0
    },
    {
      id: 'content_reports',
      title: 'إبلاغات المحتوى',
      description: 'الإبلاغات على المحتوى غير المناسب',
      icon: FileText,
      color: 'red',
      count: stats.contentReports || 0
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
          <h1 className="text-2xl font-bold text-white mb-2">الإبلاغات</h1>
          <p className="text-gray-400">إدارة وعرض الإبلاغات النظامية</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={generateSystemReport}
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

      {/* أنواع الإبلاغات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((reportType, index) => (
          <motion.div
            key={reportType.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-${reportType.color}-500/20 rounded-xl flex items-center justify-center`}>
                <reportType.icon className={`w-6 h-6 text-${reportType.color}-400`} />
              </div>
              <span className="text-2xl font-bold text-white">{reportType.count}</span>
            </div>
            <h3 className="text-white font-medium mb-2">{reportType.title}</h3>
            <p className="text-gray-400 text-sm">{reportType.description}</p>
          </motion.div>
        ))}
      </div>

      {/* قائمة الإبلاغات الحديثة */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-white font-medium">الإبلاغات الحديثة</h3>
        </div>
        <div className="p-6">
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.slice(0, 5).map((report) => (
                <div key={report._id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="text-white font-medium">{report.title}</p>
                    <p className="text-gray-400 text-sm">{report.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    report.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {report.status === 'pending' ? 'قيد المراجعة' : 
                     report.status === 'resolved' ? 'مكتمل' : 'مرفوض'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">لا توجد إبلاغات حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsManagement;