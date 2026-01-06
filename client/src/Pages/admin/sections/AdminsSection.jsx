import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  FileText,
  UserPlus,
  Lock,
  Unlock,
  Trash2,
  X
} from 'lucide-react';
import axios from 'axios';

const AdminsSection = (props) => {
  const {
    admins,
    getToken,
    handleLogout,
    fetchAdminsList
  } = props;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');
  const [allowedRoles, setAllowedRoles] = useState([]);

  // جلب الأدوار المسموحة من الخادم
  useEffect(() => {
    const fetchAllowedRoles = async () => {
      try {
        const token = getToken();
        const response = await axios.get('http://localhost:5000/api/admin/roles', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          setAllowedRoles(response.data.roles);
          // تعيين القيمة الافتراضية إذا كانت موجودة
          if (response.data.roles.length > 0) {
            setNewAdminData(prev => ({ ...prev, role: response.data.roles[0].value }));
          }
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        // إذا فشل جلب الأدوار، نستخدم القيم الافتراضية
        setDefaultRoles();
      }
    };

const setDefaultRoles = () => {
  const defaultRoles = [
    { value: 'financial_admin', label: 'أدمن مالي' },
    { value: 'reports_admin', label: 'أدمن إبلاغات' }, // غيرت report_admin إلى reports_admin
    { value: 'user_admin', label: 'أدمن مستخدمين' },   // أضفت
    { value: 'artwork_admin', label: 'أدمن أعمال فنية' }, // أضفت
    { value: 'superadmin', label: 'سوبر أدمن' }
  ];
  setAllowedRoles(defaultRoles);
  setNewAdminData(prev => ({ ...prev, role: defaultRoles[0].value }));
};

    fetchAllowedRoles();
  }, [getToken]);

  // دوال مساعدة للمودال
  const openCreateModal = () => {
    setShowCreateModal(true);
    setError('');
  };
  
  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetForm();
  };
  
  const resetForm = () => {
    setNewAdminData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: allowedRoles.length > 0 ? allowedRoles[0].value : ''
    });
    setError('');
  };

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

  // تقرير سريع
  const handleQuickReport = async (type, title) => {
    await generateReport(type, title);
  };

  // دوال إدارة الأدمن - محسنة
  const createAdmin = async () => {
    try {
      setCreateLoading(true);
      setError('');
      const token = getToken();

      if (!token) {
        setError('❌ لم يتم العثور على رمز الدخول');
        return;
      }

      // تحقق من البيانات المطلوبة
      if (!newAdminData.username || !newAdminData.email || !newAdminData.password || !newAdminData.fullName || !newAdminData.role) {
        setError('❌ يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      console.log('📤 بيانات الأدمن المرسلة:', newAdminData);

      const response = await axios.post('http://localhost:5000/api/admin/admins', newAdminData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 ثواني
      });

      console.log('📥 استجابة الخادم:', response.data);

      if (response.data.success) {
        alert('✅ تم إنشاء الأدمن بنجاح');
        setShowCreateModal(false);
        resetForm();
        fetchAdminsList();
      } else {
        throw new Error(response.data.message || 'فشل إنشاء الأدمن');
      }
    } catch (error) {
      console.error('❌ Error creating admin:', error);
      
      let errorMessage = '❌ فشل إنشاء الأدمن: ';
      
      if (error.response) {
        // الخادم استجاب مع حالة خطأ
        const serverError = error.response.data;
        errorMessage += serverError.message || serverError.error || `خطأ في الخادم: ${error.response.status}`;
        
        // إذا كان هناك تفاصيل عن التحقق من الصحة
        if (serverError.details) {
          errorMessage += ` - ${serverError.details}`;
        }
        
        console.error('📋 تفاصيل الخطأ:', serverError);
      } else if (error.request) {
        // تم إرسال الطلب ولكن لم يتم استقبال رد
        errorMessage += 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الشبكة.';
        console.error('🌐 خطأ اتصال:', error.request);
      } else {
        // خطأ في إعداد الطلب
        errorMessage += error.message;
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const toggleAdminStatus = async (adminId, currentStatus) => {
    try {
      const token = getToken();
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      
      const response = await axios.put(`http://localhost:5000/api/admin/admins/${adminId}`, {
        isActive: newStatus === 'active'
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert(`✅ تم ${newStatus === 'active' ? 'تفعيل' : 'تجميد'} الأدمن بنجاح`);
        fetchAdminsList();
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert('❌ فشل تحديث حالة الأدمن: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteAdmin = async (adminId) => {
    if (window.confirm('⚠️ هل أنت متأكد من حذف هذا الأدمن؟')) {
      try {
        const token = getToken();
        const response = await axios.delete(`http://localhost:5000/api/admin/admins/${adminId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          alert('✅ تم حذف الأدمن بنجاح');
          fetchAdminsList();
        }
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert('❌ فشل حذف الأدمن: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // الحصول على الاسم العربي للدور
const getRoleArabicName = (role) => {
  const roleMap = {
    'financial_admin': 'أدمن مالي',
    'reports_admin': 'أدمن إبلاغات', // غيرت report_admin إلى reports_admin
    'user_admin': 'أدمن مستخدمين',
    'artwork_admin': 'أدمن أعمال فنية',
    'superadmin': 'سوبر أدمن'
  };
  return roleMap[role] || role;
};

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">إدارة الأدمن</h1>
          <p className="text-gray-400">إدارة حسابات الأدمن والصلاحيات</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleQuickReport('admins', 'تقرير الأدمن')}
            disabled={reportLoading}
            className="px-4 py-2 bg-[#d5006d] text-white rounded-xl hover:bg-[#b3005c] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            إنشاء تقرير
          </button>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            إنشاء أدمن جديد
          </button>
        </div>
      </motion.div>

      {/* قائمة الأدمن */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right p-4 text-gray-400 font-medium">الأدمن</th>
                <th className="text-right p-4 text-gray-400 font-medium">الدور</th>
                <th className="text-right p-4 text-gray-400 font-medium">الحالة</th>
                <th className="text-right p-4 text-gray-400 font-medium">آخر نشاط</th>
                <th className="text-right p-4 text-gray-400 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {admin.username?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{admin.fullName || admin.username}</p>
                        <p className="text-gray-400 text-sm">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-[#d5006d]/20 text-[#d5006d] rounded-full text-sm">
                      {getRoleArabicName(admin.role)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      admin.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {admin.isActive ? 'نشط' : 'موقوف'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">
                    {admin.lastActive ? new Date(admin.lastActive).toLocaleDateString('ar-EG') : 'غير متوفر'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => toggleAdminStatus(admin._id, admin.isActive ? 'active' : 'suspended')}
                        className={`p-2 rounded-lg transition-colors ${
                          admin.isActive 
                            ? 'text-orange-400 hover:bg-orange-500/20' 
                            : 'text-green-400 hover:bg-green-500/20'
                        }`}
                        title={admin.isActive ? 'تجميد' : 'تفعيل'}
                      >
                        {admin.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteAdmin(admin._id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal إنشاء أدمن جديد */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">إنشاء أدمن جديد</h2>
                <button
                  onClick={closeCreateModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-xl">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    value={newAdminData.fullName}
                    onChange={(e) => setNewAdminData({ ...newAdminData, fullName: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d5006d] focus:border-transparent"
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    اسم المستخدم *
                  </label>
                  <input
                    type="text"
                    value={newAdminData.username}
                    onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d5006d] focus:border-transparent"
                    placeholder="أدخل اسم المستخدم"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    value={newAdminData.email}
                    onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d5006d] focus:border-transparent"
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    كلمة المرور *
                  </label>
                  <input
                    type="password"
                    value={newAdminData.password}
                    onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d5006d] focus:border-transparent"
                    placeholder="أدخل كلمة المرور"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    الدور *
                  </label>
                  <select
                    value={newAdminData.role}
                    onChange={(e) => setNewAdminData({ ...newAdminData, role: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#d5006d] focus:border-transparent"
                    disabled={allowedRoles.length === 0}
                  >
                    {allowedRoles.length === 0 ? (
                      <option value="">جاري تحميل الأدوار...</option>
                    ) : (
                      allowedRoles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))
                    )}
                  </select>
                  {allowedRoles.length === 0 && (
                    <p className="text-gray-400 text-xs mt-1">يتم جلب الأدوار المسموحة من الخادم...</p>
                  )}
                </div>

                <div className="bg-gray-700/50 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-2">الصلاحيات التلقائية:</h4>
                  <p className="text-gray-400 text-sm">
                    سيتم منح الصلاحيات تلقائياً حسب الدور المحدد. كل أدمن يمكنه إنشاء التقارير الخاصة بدوره.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700 flex gap-3">
              <button
                onClick={closeCreateModal}
                className="flex-1 py-3 px-4 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={createAdmin}
                disabled={createLoading || !newAdminData.username || !newAdminData.email || !newAdminData.password || !newAdminData.fullName || !newAdminData.role || allowedRoles.length === 0}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {createLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    إنشاء أدمن
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminsSection;