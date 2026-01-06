import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, MoreVertical, User, Mail, Calendar } from 'lucide-react';
import axios from 'axios';

const UsersManagement = ({ getToken, currentAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchUsersData();
    fetchUsersStats();
  }, []);

  const fetchUsersData = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersStats = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:5000/api/admin/users/stats', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setStats(response.data.data || {});
      }
    } catch (error) {
      console.error('Error fetching users stats:', error);
      setStats({});
    }
  };

  const generateUsersReport = async () => {
    try {
      setReportLoading(true);
      const token = getToken();
      
      const response = await axios.post('http://localhost:5000/api/admin/reports/generate', {
        type: 'users_report',
        title: 'تقرير المستخدمين',
        filters: {
          period: 'last_month',
          userType: 'all'
        }
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert('✅ تم إنشاء تقرير المستخدمين بنجاح');
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

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayStats = [
    { title: 'إجمالي المستخدمين', value: stats.totalUsers || '0' },
    { title: 'مستخدمين نشطين', value: stats.activeUsers || '0' },
    { title: 'مستخدمين جدد', value: stats.newUsers || '0' },
    { title: 'مستخدمين موقوفين', value: stats.suspendedUsers || '0' }
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
          <h1 className="text-2xl font-bold text-white mb-2">إدارة المستخدمين</h1>
          <p className="text-gray-400">عرض وإدارة جميع مستخدمين المنصة</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={generateUsersReport}
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

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-300 font-medium">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* شريط البحث */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث في المستخدمين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 pl-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d5006d] focus:border-transparent"
          />
        </div>
      </div>

      {/* قائمة المستخدمين */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right p-4 text-gray-400 font-medium">المستخدم</th>
                <th className="text-right p-4 text-gray-400 font-medium">البريد الإلكتروني</th>
                <th className="text-right p-4 text-gray-400 font-medium">الحالة</th>
                <th className="text-right p-4 text-gray-400 font-medium">تاريخ التسجيل</th>
                <th className="text-right p-4 text-gray-400 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium text-sm">{user.name}</p>
                          <p className="text-gray-400 text-xs">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-300 text-sm">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.isActive ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">
                          {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <User className="w-12 h-12 text-gray-600" />
                      <p className="text-gray-400">لا توجد مستخدمين</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;