import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
Users,
BarChart3,
Shield,
Settings,
Bell,
Search,
Menu,
X,
DollarSign,
FileText,
LogOut
} from 'lucide-react';
import axios from 'axios';

// استيراد المكونات المنفصلة
import OverviewSection from './sections/OverviewSection';
import AdminsSection from './sections/AdminsSection';
import ReportsSection from './sections/ReportsSection';
import FinancialSection from './sections/FinancialSection';
import SettingsSection from './sections/SettingsSection';

const SuperAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [admins, setAdmins] = useState([]);
  const [generatedReports, setGeneratedReports] = useState([]);

  // بيانات تجريبية
  const mockStats = {
    totalUsers: 1250,
    totalAdmins: 8,
    totalArtworks: 543,
    totalRevenue: 45200
  };

  const generateMockAdmins = () => {
    return [
      {
        _id: '1',
        username: 'admin1',
        fullName: 'أحمد محمد',
        email: 'admin1@example.com',
        role: 'superadmin',
        isActive: true,
        lastActive: new Date(),
        createdAt: new Date()
      },
      {
        _id: '2',
        username: 'financial_admin',
        fullName: 'سارة عبدالله',
        email: 'sara@example.com',
        role: 'financial_admin',
        isActive: true,
        lastActive: new Date(),
        createdAt: new Date()
      }
    ];
  };

  // جلب التوكن من localStorage
  const getToken = () => {
    return localStorage.getItem('adminToken');
  };

  // جلب بيانات السوبر أدمن
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = getToken();
        console.log('🔑 التوكن في localStorage:', token);
        
        if (!token) {
          window.location.href = '/admin/login';
          return;
        }

        const adminData = JSON.parse(localStorage.getItem('adminData'));
        
        if (adminData && adminData.role === 'superadmin') {
          setCurrentAdmin(adminData);
          fetchDashboardStats();
          fetchAdminsList();
          fetchGeneratedReports();
        } else {
          window.location.href = '/admin/dashboard';
        }

      } catch (error) {
        console.error('Error fetching admin data:', error);
        setStats(mockStats);
        setAdmins(generateMockAdmins());
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
      } else {
        setStats(mockStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(mockStats);
    }
  };

  // جلب قائمة الأدمن
  const fetchAdminsList = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:5000/api/admin/admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setAdmins(response.data.data);
      } else {
        setAdmins(generateMockAdmins());
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setAdmins(generateMockAdmins());
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

  // العناصر القابلة للتعديل
  const menuItems = [
    { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { id: 'admins', label: 'إدارة الأدمن', icon: Users },
    { id: 'reports', label: 'التقارير', icon: FileText },
    { id: 'financial', label: 'التقارير المالية', icon: DollarSign },
    { id: 'settings', label: 'الإعدادات', icon: Settings }
  ];

  // تمرير الدوال كـ props للمكونات الفرعية
  const commonProps = {
    getToken,
    handleLogout,
    stats,
    setStats,
    admins,
    setAdmins,
    generatedReports,
    setGeneratedReports,
    fetchAdminsList,
    fetchDashboardStats,
    fetchGeneratedReports,
    saveReportsToStorage,
    currentAdmin
  };

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
                    {currentAdmin?.fullName?.charAt(0) || currentAdmin?.username?.charAt(0) || 'S'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-white">{currentAdmin?.fullName || 'سوبر أدمن'}</p>
                  <p className="text-sm text-gray-400">Full Access</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-900">
          {activeTab === 'overview' && <OverviewSection {...commonProps} />}
          {activeTab === 'admins' && <AdminsSection {...commonProps} />}
          {activeTab === 'reports' && <ReportsSection {...commonProps} />}
          {activeTab === 'financial' && <FinancialSection {...commonProps} />}
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

export default SuperAdminDashboard;