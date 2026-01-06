import React, { useState, useEffect } from 'react';
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
  DollarSign,
  FileText,
  Download,
  Calendar,
  Building,
  LogOut,
  RefreshCw,
  Eye,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';

// استيراد المكونات المنفصلة
import OverviewSection from './sections/OverviewSection';
import UsersManagement from './Components/UsersManagement';
import ArtworksManagement from './Components/ArtworksManagement';
import FinancialReports from './Components/FinancialReports';
import GeneralReports from './Components/GeneralReports';
import SettingsSection from './sections/SettingsSection';
import ReportsMangemaent from './Components/ReportsMangement';
const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [generatedReports, setGeneratedReports] = useState([]);

  // جلب التوكن من localStorage
  const getToken = () => {
    return localStorage.getItem('adminToken');
  };

  // جلب بيانات الأدمن
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = getToken();
        
        if (!token) {
          window.location.href = '/admin/login';
          return;
        }

        const adminData = JSON.parse(localStorage.getItem('adminData'));
        
        if (adminData) {
          setCurrentAdmin(adminData);
          fetchDashboardStats();
          fetchGeneratedReports();
        } else {
          // جلب البيانات من API
          const response = await axios.get('http://localhost:5000/api/admin/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            setCurrentAdmin(response.data.data);
            localStorage.setItem('adminData', JSON.stringify(response.data.data));
            fetchDashboardStats();
            fetchGeneratedReports();
          }
        }

      } catch (error) {
        console.error('Error fetching admin data:', error);
        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // جلب إحصائيات الداشبورد
  const fetchDashboardStats = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:5000/api/admin/dashboard/stats', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // جلب التقارير المُنشأة من localStorage
  const fetchGeneratedReports = () => {
    try {
      const savedReports = localStorage.getItem('generatedReports');
      if (savedReports) {
        setGeneratedReports(JSON.parse(savedReports));
      }
    } catch (error) {
      console.error('Error loading saved reports:', error);
    }
  };

  // حفظ التقارير في localStorage
  const saveReportsToStorage = (reports) => {
    try {
      localStorage.setItem('generatedReports', JSON.stringify(reports));
    } catch (error) {
      console.error('Error saving reports:', error);
    }
  };

  // تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('generatedReports');
    window.location.href = '/admin/login';
  };

  // القوائم حسب الصلاحيات الحقيقية - الأنواع الأساسية فقط
  const getMenuItems = () => {
    if (!currentAdmin) return [];

    const baseItems = [
      { id: 'overview', label: 'نظرة عامة', icon: BarChart3, permission: null },
      { id: 'users', label: 'المستخدمين', icon: Users, permission: 'canViewUsers',role:'user_admin' },
      { id: 'artworks', label: 'الأعمال الفنية', icon: Palette, permission: 'canViewArtworks' },
      { id: 'financial', label: 'التقارير المالية', icon: DollarSign, permission: 'canViewFinancial' },
      { id: 'reports', label: 'الابلاغات', icon: FileText, permission: 'canViewReports' },
      { id: 'settings', label: 'الإعدادات', icon: Settings, permission: null }
    ];

    // إذا كان سوبر أدمن، نعرض كل شيء
    if (currentAdmin.role === 'superadmin') {
      return baseItems;
    }

    // إذا كان أدمن عادي، نعرض فقط المسموح له بناءً على الصلاحيات الحقيقية
     return baseItems.filter(item => {
    // النظرة العامة والإعدادات للجميع
    if (item.id === 'settings') return true;
    
    // الباقي حسب الصلاحيات
    return currentAdmin.permissions?.[item.permission] === true;
  });
};
 useEffect(() => {
    if (currentAdmin && activeTab) {
      const menuItems = getMenuItems();
      const allowedTabs = menuItems.map(item => item.id);
      
      if (!allowedTabs.includes(activeTab)) {
        // إذا التبويب الحالي مش مسموح، نغير لأول تبويب مسموح
        const firstAllowedTab = menuItems[0]?.id || 'settings';
        setActiveTab(firstAllowedTab);
      }
    }
  }, [currentAdmin, activeTab]);
// أضف هذه الدالة بعد دالة getMenuItems
const handleTabChange = (tabId) => {
  const menuItems = getMenuItems();
  const allowedTabs = menuItems.map(item => item.id);
  
  if (allowedTabs.includes(tabId)) {
    setActiveTab(tabId);
  } else {
    // إذا لم يكن مسموحاً، انتقل إلى النظرة العامة
    setActiveTab('overview');
    alert('⚠️ ليس لديك صلاحية الوصول إلى هذا القسم');
  }
};
  const menuItems = getMenuItems();

  // تمرير الدوال كـ props للمكونات الفرعية
  const commonProps = {
    getToken,
    handleLogout,
    stats,
    setStats,
    generatedReports,
    setGeneratedReports,
    fetchDashboardStats,
    fetchGeneratedReports,
    saveReportsToStorage,
    currentAdmin
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#d5006d] border-t-transparent rounded-full animate-spin"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!currentAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <p>غير مصرح بالوصول</p>
          <button 
            onClick={() => window.location.href = '/admin/login'}
            className="mt-4 px-6 py-2 bg-[#d5006d] rounded-lg hover:bg-[#b3005c] transition-colors"
          >
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
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
                  <span className="text-white font-semibold">
                    {currentAdmin?.fullName?.charAt(0) || currentAdmin?.username?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-white">{currentAdmin?.fullName || currentAdmin?.username || 'أدمن'}</p>
                  <p className="text-sm text-gray-400 capitalize">{currentAdmin?.role || 'أدمن'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
       <main className="flex-1 overflow-auto p-6 bg-gray-900">
  {activeTab === 'overview' && <OverviewSection {...commonProps} />}
  {activeTab === 'users' && <UsersManagement {...commonProps} />}
  {activeTab === 'artworks' && <ArtworksManagement {...commonProps} />}
  {activeTab === 'financial' && <FinancialReports {...commonProps} />}
  {activeTab === 'reports' && <ReportsMangemaent {...commonProps} />}
  {activeTab === 'settings' && <SettingsSection {...commonProps} />}
</main>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: sidebarOpen ? 0 : 300 }}
        className="fixed lg:relative bg-gray-800 shadow-xl z-30 w-80 h-full border-r border-gray-700 right-0"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-r from-[#d5006d] to-[#ff4081] rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ArtWay</h1>
              <p className="text-sm text-gray-400 capitalize">{currentAdmin?.role || 'Admin'}</p>
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

        {/* زر تسجيل الخروج */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;