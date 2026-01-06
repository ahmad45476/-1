import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Palette, 
  BarChart3, 
  Shield, 
  Settings,
  Bell,
  Search,
  Menu,
  X,
  TrendingUp,
  Eye,
  DollarSign,
  FileText,
  AlertCircle,
  Download,
  UserPlus,
  Lock,
  Unlock,
  Trash2,
  Filter,
  Calendar,
  Banknote,
  Building,
  Activity
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReports, setSelectedReports] = useState([]);

  // الإحصائيات العامة
  const overviewStats = [
    { 
      title: 'إجمالي المستخدمين', 
      value: '15,847', 
      change: '+12%', 
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      description: 'مستخدم نشط'
    },
    { 
      title: 'إجمالي الأدمن', 
      value: '24', 
      change: '+2', 
      icon: Shield,
      color: 'from-[#d5006d] to-[#ff4081]',
      description: 'أدمن نشط'
    },
    { 
      title: 'الواردات المالية', 
      value: '$245,231', 
      change: '+23%', 
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      description: 'آخر 30 يوم'
    },
    { 
      title: 'التفاعلات', 
      value: '284.2K', 
      change: '+15%', 
      icon: Activity,
      color: 'from-orange-500 to-amber-500',
      description: 'إعجاب وتعليق'
    }
  ];

  // البنوك المشتركة
  const banks = [
    { name: 'Bank of America', users: '2,847', revenue: '$45,230' },
    { name: 'Chase Bank', users: '1,923', revenue: '$38,150' },
    { name: 'Wells Fargo', users: '1,547', revenue: '$29,840' },
    { name: 'Citi Bank', users: '892', revenue: '$18,290' }
  ];

  // قائمة الأدمن
  const admins = [
    { 
      id: 1, 
      name: 'أحمد محمد', 
      username: 'ahmed_admin', 
      email: 'ahmed@artway.com',
      role: 'مالي',
      status: 'active',
      permissions: ['financial', 'reports'],
      lastActive: '2024-01-28',
      joinDate: '2024-01-15'
    },
    { 
      id: 2, 
      name: 'سارة علي', 
      username: 'sara_admin', 
      email: 'sara@artway.com',
      role: 'بلاغات',
      status: 'active',
      permissions: ['reports', 'users'],
      lastActive: '2024-01-29',
      joinDate: '2024-01-20'
    },
    { 
      id: 3, 
      name: 'محمد خالد', 
      username: 'mohammed_admin', 
      email: 'mohammed@artway.com',
      role: 'مستخدمين',
      status: 'suspended',
      permissions: ['users'],
      lastActive: '2024-01-25',
      joinDate: '2024-01-10'
    }
  ];

  // التقارير المتاحة
  const availableReports = [
    { id: 1, title: 'تقرير المستخدمين', type: 'users' },
    { id: 2, title: 'تقرير المبيعات', type: 'sales' },
    { id: 3, title: 'تقرير التفاعلات', type: 'engagement' },
    { id: 4, title: 'تقرير الأدمن', type: 'admins' },
    { id: 5, title: 'تقرير مالي', type: 'financial' }
  ];

  const menuItems = [
    { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { id: 'admins', label: 'إدارة الأدمن', icon: Users },
    { id: 'reports', label: 'التقارير', icon: FileText },
    { id: 'financial', label: 'التقارير المالية', icon: DollarSign },
    { id: 'settings', label: 'الإعدادات', icon: Settings }
  ];

  // دوال الإدارة
  const createAdmin = () => {
    // منطق إنشاء أدمن جديد
    console.log('إنشاء أدمن جديد');
  };

  const toggleAdminStatus = (adminId) => {
    // منطق تجميد/تفعيل الأدمن
    console.log('تغيير حالة الأدمن:', adminId);
  };

  const deleteAdmin = (adminId) => {
    // منطق حذف الأدمن
    if (window.confirm('هل أنت متأكد من حذف هذا الأدمن؟')) {
      console.log('حذف الأدمن:', adminId);
    }
  };

  const exportReports = () => {
    // منطق تصدير التقارير PDF
    console.log('تصدير التقارير:', selectedReports);
  };

  const toggleReportSelection = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="fixed lg:relative bg-gray-800 shadow-xl z-30 w-80 h-full border-l border-gray-700"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-r from-[#d5006d] to-[#ff4081] rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ArtWay</h1>
              <p className="text-sm text-gray-400">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 rtl:space-x-reverse p-4 rounded-xl mb-2 transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-[#d5006d] to-[#ff4081] text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={createAdmin}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
          >
            <UserPlus className="w-5 h-5" />
            إنشاء أدمن جديد
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700 z-20">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
              
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث في النظام..."
                  className="w-96 pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d5006d] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-gradient-to-r from-[#d5006d] to-[#ff4081] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">S</span>
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-white">سوبر أدمن</p>
                  <p className="text-sm text-gray-400">Full Access</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-900">
          {/* نظرة عامة */}
          {activeTab === 'overview' && (
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
                  <button className="px-4 py-2 bg-[#d5006d] text-white rounded-xl hover:bg-[#b3005c] transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    تصدير التقرير
                  </button>
                </div>
              </motion.div>

              {/* الإحصائيات */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewStats.map((stat, index) => (
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
                          : 'bg-red-500/20 text-red-400'
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

              {/* البنوك المشتركة */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-[#d5006d]" />
                    البنوك المشتركة
                  </h3>
                  <div className="space-y-4">
                    {banks.map((bank, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                        <div>
                          <p className="text-white font-medium">{bank.name}</p>
                          <p className="text-gray-400 text-sm">{bank.users} مستخدم</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">{bank.revenue}</p>
                          <p className="text-gray-400 text-sm">إجمالي الإيرادات</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* رسم بياني */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">نشاط المنصة</h3>
                  <div className="h-64 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                    <p className="text-gray-400">رسم بياني للنشاط</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* إدارة الأدمن */}
          {activeTab === 'admins' && (
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
                <button
                  onClick={createAdmin}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  إنشاء أدمن جديد
                </button>
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
                        <tr key={admin.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {admin.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-medium">{admin.name}</p>
                                <p className="text-gray-400 text-sm">{admin.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-[#d5006d]/20 text-[#d5006d] rounded-full text-sm">
                              {admin.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              admin.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {admin.status === 'active' ? 'نشط' : 'موقوف'}
                            </span>
                          </td>
                          <td className="p-4 text-gray-300">{admin.lastActive}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => toggleAdminStatus(admin.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  admin.status === 'active' 
                                    ? 'text-orange-400 hover:bg-orange-500/20' 
                                    : 'text-green-400 hover:bg-green-500/20'
                                }`}
                                title={admin.status === 'active' ? 'تجميد' : 'تفعيل'}
                              >
                                {admin.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => deleteAdmin(admin.id)}
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
            </div>
          )}

          {/* التقارير */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">نظام التقارير</h1>
                  <p className="text-gray-400">إنشاء وتصدير التقارير المختلفة</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    تصفية
                  </button>
                  <button
                    onClick={exportReports}
                    disabled={selectedReports.length === 0}
                    className="px-6 py-2 bg-gradient-to-r from-[#d5006d] to-[#ff4081] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    تصدير PDF ({selectedReports.length})
                  </button>
                </div>
              </motion.div>

              {/* التقارير المتاحة */}
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
                    <p className="text-gray-400 text-sm">تقرير مفصل عن {report.type === 'users' ? 'المستخدمين' : 
                      report.type === 'sales' ? 'المبيعات' : 
                      report.type === 'engagement' ? 'التفاعلات' : 
                      report.type === 'admins' ? 'الأدمن' : 'الأمور المالية'}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;