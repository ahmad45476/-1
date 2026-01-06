import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign,
  FileText,
  Download,
  Eye
} from 'lucide-react';
import axios from 'axios';

const FinancialSection = (props) => {
  const {
    stats,
    generatedReports,
    getToken,
    handleLogout,
    setGeneratedReports,
    saveReportsToStorage
  } = props;

  const [reportLoading, setReportLoading] = useState(false);

  // دالة إنشاء التقرير
  const generateReport = async (reportType, reportTitle) => {
    if (reportLoading) {
      alert('⚠️ يرجى الانتظار حتى انتهاء التقرير الحالي');
      return false;
    }

    try {
      setReportLoading(true);
      const token = getToken();
      
      const response = await axios.post('http://localhost:5000/api/reports', {
        type: reportType,
        title: reportTitle,
        period: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        filters: {}
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const reportId = response.data.data.reportId;
        
        const newReport = {
          _id: reportId,
          type: reportType,
          title: reportTitle,
          createdAt: new Date(),
          downloadUrl: `http://localhost:5000/api/reports/download/${reportId}`,
          viewUrl: `http://localhost:5000/api/reports/view/${reportId}`
        };
        
        const updatedReports = [newReport, ...generatedReports];
        setGeneratedReports(updatedReports);
        saveReportsToStorage(updatedReports);
        
        alert(`✅ تم إنشاء التقرير "${reportTitle}" بنجاح`);
        return true;
      } else {
        throw new Error(response.data.message || 'فشل إنشاء التقرير');
      }
      
    } catch (error) {
      console.error('❌ خطأ في إنشاء التقرير:', error);
      
      if (error.response?.status === 401) {
        alert('❌ انتهت جلسة العمل، يرجى تسجيل الدخول مرة أخرى');
        handleLogout();
      } else {
        alert('❌ فشل إنشاء التقرير: ' + (error.response?.data?.message || error.message));
      }
      return false;
    } finally {
      setReportLoading(false);
    }
  };

  // دالة تحميل التقرير
  const downloadReport = async (reportId, reportTitle) => {
    try {
      const token = getToken();
      
      if (!token) {
        alert('❌ لم يتم العثور على رمز الدخول');
        handleLogout();
        return;
      }

      const response = await axios.get(`/api/reports/download/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      });

      // إنشاء رابط تحميل
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      let filename = `${reportTitle}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('❌ خطأ في تحميل التقرير:', error);
      
      if (error.response?.status === 401) {
        alert('❌ انتهت جلسة العمل، يرجى تسجيل الدخول مرة أخرى');
        handleLogout();
      } else if (error.response?.status === 404) {
        alert('❌ التقرير غير موجود');
      } else {
        alert('❌ فشل تحميل التقرير: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // دالة فتح التقرير
  const viewReport = async (reportId, reportTitle) => {
    try {
      const token = getToken();
      
      if (!token) {
        alert('❌ لم يتم العثور على رمز الدخول');
        handleLogout();
        return;
      }

      // فتح التقرير في نافذة جديدة مع التوكن في الرابط
      const viewUrl = `http://localhost:5000/api/reports/view/${reportId}?token=${encodeURIComponent(token)}`;
      const viewWindow = window.open(viewUrl, '_blank', 'width=1200,height=800');
      
      if (!viewWindow) {
        alert('⚠️ يرجى السماح بالنوافذ المنبثقة لهذا الموقع');
        return;
      }

    } catch (error) {
      console.error('❌ خطأ في فتح التقرير:', error);
      alert('❌ فشل فتح التقرير: ' + error.message);
    }
  };

  // تقرير سريع
  const handleQuickReport = async (type, title) => {
    await generateReport(type, title);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">التقارير المالية</h1>
          <p className="text-gray-400">عرض وتحليل البيانات المالية</p>
        </div>
        <button
          onClick={() => handleQuickReport('financial', 'تقرير مالي شامل')}
          disabled={reportLoading}
          className="px-6 py-2 bg-[#d5006d] text-white rounded-xl hover:bg-[#b3005c] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          إنشاء تقرير مالي
        </button>
      </motion.div>

      {/* محتوى التقارير المالية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">الإحصائيات المالية</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-xl">
              <span className="text-gray-300">إجمالي الإيرادات</span>
              <span className="text-green-400 font-bold">${(stats.totalRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-xl">
              <span className="text-gray-300">عدد المبيعات</span>
              <span className="text-blue-400 font-bold">{stats.totalSales || '0'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-xl">
              <span className="text-gray-300">متوسط المبيعات</span>
              <span className="text-yellow-400 font-bold">
                ${((stats.totalRevenue || 0) / (stats.totalSales || 1)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">آخر التقارير المالية</h3>
          <div className="space-y-3">
            {generatedReports
              .filter(report => report.type === 'financial')
              .slice(0, 3)
              .map((report) => (
                <div key={report._id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="text-white font-medium text-sm">{report.title}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(report.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewReport(report._id, report.title)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      فتح
                    </button>
                    <button
                      onClick={() => downloadReport(report._id, report.title)}
                      className="px-3 py-1 bg-[#d5006d] text-white rounded-lg hover:bg-[#b3005c] transition-colors text-xs flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      تحميل
                    </button>
                  </div>
                </div>
              ))}
            {generatedReports.filter(report => report.type === 'financial').length === 0 && (
              <p className="text-gray-400 text-center py-4">لا توجد تقارير مالية بعد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSection;