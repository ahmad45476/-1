import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Palette, 
  DollarSign,
  FileText,
  Download,
  Calendar,
  Building,
  Eye,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';

const OverviewSection = (props) => {
  const {
    stats,
    generatedReports,
    getToken,
    handleLogout,
    saveReportsToStorage,
    setGeneratedReports,
    currentAdmin
  } = props;

  const [reportLoading, setReportLoading] = useState(false);

  // دالة إنشاء التقرير - تتحقق من الصلاحيات أولاً
  const generateReport = async (reportType, reportTitle) => {
    // التحقق من الصلاحيات قبل إنشاء التقرير
    if (!hasPermissionToGenerateReport(reportType)) {
      alert('❌ غير مصرح لك بإنشاء هذا النوع من التقارير');
      return false;
    }

    if (reportLoading) {
      alert('⚠️ يرجى الانتظار حتى انتهاء التقرير الحالي');
      return false;
    }

    try {
      setReportLoading(true);
      const token = getToken();
      
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

  // التحقق من صلاحيات إنشاء التقرير
  const hasPermissionToGenerateReport = (reportType) => {
    const permissionMap = {
      'users': 'canViewUsers',
      'financial': 'canViewFinancial',
      'artworks': 'canViewArtworks',
      'reports': 'canViewReports'
    };

    const requiredPermission = permissionMap[reportType];
    return currentAdmin?.permissions?.[requiredPermission] === true;
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

  // تقرير سريع - يتحقق من الصلاحيات
  const handleQuickReport = async () => {
    // تحديد نوع التقرير المسموح به
    let allowedReportType = null;
    let reportTitle = 'تقرير النظرة العامة';

    if (hasPermissionToGenerateReport('users')) {
      allowedReportType = 'users';
      reportTitle = 'تقرير المستخدمين';
    } else if (hasPermissionToGenerateReport('financial')) {
      allowedReportType = 'financial';
      reportTitle = 'تقرير مالي';
    } else if (hasPermissionToGenerateReport('artworks')) {
      allowedReportType = 'artworks';
      reportTitle = 'تقرير الأعمال الفنية';
    } else if (hasPermissionToGenerateReport('reports')) {
      allowedReportType = 'reports';
      reportTitle = 'تقرير عام';
    }

    if (allowedReportType) {
      await generateReport(allowedReportType, reportTitle);
    } else {
      alert('❌ غير مصرح لك بإنشاء أي تقارير');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">لوحة التحكم الرئيسية</h1>
          <p className="text-gray-400">نظرة شاملة على أداء المنصة وإحصائياتها</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            آخر 30 يوم
          </button>
          <button 
            onClick={handleQuickReport}
            disabled={reportLoading}
            className="px-4 py-2 bg-[#d5006d] text-white rounded-xl hover:bg-[#b3005c] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {reportLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {reportLoading ? 'جاري الإنشاء...' : 'إنشاء تقرير'}
          </button>
        </div>
      </motion.div>

      {/* الإحصائيات - بيانات حقيقية فقط */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: 'إجمالي المستخدمين', 
            value: stats.totalUsers || '0', 
            change: stats.usersChange || '+0%', 
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            description: 'مستخدم نشط',
            permission: 'canViewUsers'
          },
          { 
            title: 'الأعمال الفنية', 
            value: stats.totalArtworks || '0', 
            change: stats.artworksChange || '+0%', 
            icon: Palette,
            color: 'from-green-500 to-emerald-500',
            description: 'عمل فني',
            permission: 'canViewArtworks'
          },
          { 
            title: 'الإيرادات', 
            value: stats.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : '$0', 
            change: stats.revenueChange || '+0%', 
            icon: DollarSign,
            color: 'from-orange-500 to-amber-500',
            description: 'آخر 30 يوم',
            permission: 'canViewFinancial'
          },
          { 
            title: 'التقارير', 
            value: stats.totalReports || '0', 
            change: stats.reportsChange || '+0%', 
            icon: FileText,
            color: 'from-[#d5006d] to-[#ff4081]',
            description: 'تقرير منشأ',
            permission: 'canViewReports'
          }
        ]
        .filter(stat => currentAdmin?.permissions?.[stat.permission] !== false)
        .map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-2xl border border-gray-700 p-6 hover:border-gray-600 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                stat.change.startsWith('+') 
                  ? 'bg-green-500/20 text-green-400' 
                  : stat.change.startsWith('-')
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-300 font-medium mb-1">{stat.title}</p>
            <p className="text-gray-400 text-sm">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* محتوى إضافي */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-[#d5006d]" />
            نشاط النظام
          </h3>
          <div className="space-y-4">
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.slice(0, 4).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {activity.user?.charAt(0) || 'ن'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{activity.action}</p>
                      <p className="text-gray-400 text-xs">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">لا توجد أنشطة حديثة</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">آخر التقارير</h3>
          <div className="space-y-3">
            {generatedReports.slice(0, 4).map((report) => (
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
                    title="عرض التقرير"
                  >
                    <Eye className="w-3 h-3" />
                    فتح
                  </button>
                  <button
                    onClick={() => downloadReport(report._id, report.title)}
                    className="px-3 py-1 bg-[#d5006d] text-white rounded-lg hover:bg-[#b3005c] transition-colors text-xs flex items-center gap-1"
                    title="تحميل التقرير"
                  >
                    <Download className="w-3 h-3" />
                    تحميل
                  </button>
                </div>
              </div>
            ))}
            {generatedReports.length === 0 && (
              <p className="text-gray-400 text-center py-4">لا توجد تقارير بعد</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OverviewSection;