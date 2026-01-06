import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText,
  Download,
  RefreshCw,
  Eye
} from 'lucide-react';
import axios from 'axios';

const ReportsSection = (props) => {
  const {
    generatedReports,
    setGeneratedReports,
    getToken,
    handleLogout,
    saveReportsToStorage
  } = props;

  const [selectedReports, setSelectedReports] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  const availableReports = [
    { id: 1, title: 'تقرير المستخدمين', type: 'users' },
    { id: 2, title: 'تقرير المبيعات', type: 'sales' },
    { id: 3, title: 'تقرير الأدمن', type: 'admins' },
    { id: 4, title: 'تقرير مالي', type: 'financial' },
    { id: 5, title: 'تقرير الأعمال الفنية', type: 'artworks' }
  ];

  // دالة إنشاء التقرير
  const generateReport = async (reportType, reportTitle) => {
    if (reportLoading) {
      alert('⚠️ يرجى الانتظار حتى انتهاء التقرير الحالي');
      return false;
    }

    try {
      setReportLoading(true);
      const token = getToken();
      
      console.log('🔑 التوكن المستخدم لإنشاء التقرير:', token);
      
      if (!token) {
        alert('❌ لم يتم العثور على رمز الدخول');
        handleLogout();
        return false;
      }

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
      console.log('🔑 التوكن المستخدم للتحميل:', token);
      
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
      
      // الحصول على اسم الملف
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${reportTitle}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
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
      console.log('🔑 التوكن المستخدم للعرض:', token);
      
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

  // التصدير الجماعي
  const handleBulkExport = async () => {
    if (selectedReports.length === 0) {
      alert('⚠️ الرجاء اختيار تقارير للتصدير');
      return;
    }

    try {
      setReportLoading(true);
      let successCount = 0;
      
      for (const reportId of selectedReports) {
        const report = availableReports.find(r => r.id === reportId);
        if (report) {
          const success = await generateReport(report.type, report.title);
          if (success) successCount++;
        }
      }
      
      setSelectedReports([]);
      alert(`✅ تم إنشاء ${successCount} من ${selectedReports.length} تقرير بنجاح`);
      
    } catch (error) {
      console.error('Error in bulk export:', error);
      alert('❌ فشل إنشاء بعض التقارير');
    } finally {
      setReportLoading(false);
    }
  };

  // تقرير سريع
  const handleQuickReport = async (type, title) => {
    await generateReport(type, title);
  };

  // تحديث قائمة التقارير
  const handleRefreshReports = () => {
    props.fetchGeneratedReports();
    alert('✅ تم تحديث قائمة التقارير');
  };

  // دوال مساعدة
  const getReportTypeArabic = (type) => {
    const types = {
      'users': 'المستخدمين',
      'sales': 'المبيعات', 
      'admins': 'الأدمن',
      'financial': 'المالية',
      'artworks': 'الأعمال الفنية'
    };
    return types[type] || type;
  };

  const toggleReportSelection = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">نظام التقارير</h1>
          <p className="text-gray-400">إنشاء وتحميل التقارير المختلفة</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefreshReports}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
          <button
            onClick={handleBulkExport}
            disabled={selectedReports.length === 0 || reportLoading}
            className="px-6 py-2 bg-gradient-to-r from-[#d5006d] to-[#ff4081] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {reportLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FileText className="w-4 h-4" />
            )}
            إنشاء ({selectedReports.length})
          </button>
        </div>
      </motion.div>

     

      {/* التقارير المتاحة للاختيار */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableReports.map((report) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-gray-800 rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 ${
              selectedReports.includes(report.id)
                ? 'border-[#d5006d] bg-[#d5006d]/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => toggleReportSelection(report.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <input
                type="checkbox"
                checked={selectedReports.includes(report.id)}
                onChange={() => {}}
                className="w-5 h-5 text-[#d5006d] rounded focus:ring-[#d5006d] focus:ring-2"
              />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{report.title}</h3>
            <p className="text-gray-400 text-sm">تقرير مفصل عن {getReportTypeArabic(report.type)}</p>
          </motion.div>
        ))}
      </div>

      {/* التقارير المُنشأة مسبقاً */}
      {generatedReports.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl border border-gray-700 p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">التقارير المُنشأة ({generatedReports.length})</h3>
          <div className="space-y-3">
            {generatedReports.map((report) => (
              <div key={report._id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                <div>
                  <h4 className="text-white font-medium">{report.title}</h4>
                  <p className="text-gray-400 text-sm">
                    {new Date(report.createdAt).toLocaleDateString('ar-EG')} - {getReportTypeArabic(report.type)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => viewReport(report._id, report.title)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    فتح
                  </button>
                  <button
                    onClick={() => downloadReport(report._id, report.title)}
                    className="px-4 py-2 bg-[#d5006d] text-white rounded-lg hover:bg-[#b3005c] transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    تحميل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReportsSection;