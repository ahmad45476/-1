import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, Filter, Search, MoreVertical, FileText, BarChart3 } from 'lucide-react';
import axios from 'axios';

const ArtworksManagement = ({ getToken, currentAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [artworks, setArtworks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  // جلب البيانات الحقيقية من الخادم
  useEffect(() => {
    fetchArtworksData();
    fetchArtworksStats();
  }, []);

  const fetchArtworksData = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:5000/api/admin/artworks', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setArtworks(response.data.artworks || []);
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
      setArtworks([]); // بيانات فارغة بدل الوهمية
    } finally {
      setLoading(false);
    }
  };

  const fetchArtworksStats = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:5000/api/admin/artworks/stats', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setStats(response.data.data || {});
      }
    } catch (error) {
      console.error('Error fetching artworks stats:', error);
      setStats({});
    }
  };

  // إنشاء تقرير الأعمال الفنية
  const generateArtworksReport = async () => {
    try {
      setReportLoading(true);
      const token = getToken();
      
      const response = await axios.post('http://localhost:5000/api/admin/reports/generate', {
        type: 'artworks_report',
        title: 'تقرير الأعمال الفنية',
        filters: {
          period: 'last_month',
          category: 'all'
        }
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert('✅ تم إنشاء تقرير الأعمال الفنية بنجاح');
        // يمكنك تحميل التقرير أو عرضه
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

  const filteredArtworks = artworks.filter(artwork =>
    artwork.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.artist?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // إحصائيات حقيقية
  const displayStats = [
    { title: 'إجمالي الأعمال', value: stats.totalArtworks || '0' },
    { title: 'أعمال معروضة', value: stats.activeArtworks || '0' },
    { title: 'أعمال مباعة', value: stats.soldArtworks || '0' },
    { title: 'إجمالي المبيعات', value: stats.totalSales ? `$${stats.totalSales}` : '$0' }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">إدارة الأعمال الفنية</h1>
          <p className="text-gray-400">عرض وإدارة جميع الأعمال الفنية على المنصة</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={generateArtworksReport}
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
            placeholder="ابحث في الأعمال الفنية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 pl-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d5006d] focus:border-transparent"
          />
        </div>
      </div>

      {/* قائمة الأعمال الفنية */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right p-4 text-gray-400 font-medium">العمل الفني</th>
                <th className="text-right p-4 text-gray-400 font-medium">الفنان</th>
                <th className="text-right p-4 text-gray-400 font-medium">التصنيف</th>
                <th className="text-right p-4 text-gray-400 font-medium">السعر</th>
                <th className="text-right p-4 text-gray-400 font-medium">الحالة</th>
                <th className="text-right p-4 text-gray-400 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredArtworks.length > 0 ? (
                filteredArtworks.map((artwork) => (
                  <motion.tr
                    key={artwork._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">لوحة</span>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium text-sm">{artwork.title}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(artwork.createdAt).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white text-sm">{artwork.artist?.name || 'غير معروف'}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                        {artwork.category || 'عام'}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-white font-medium">${artwork.price || '0'}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        artwork.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : artwork.status === 'sold'
                          ? 'bg-gray-500/20 text-gray-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {artwork.status === 'active' ? 'معروضة' : 
                         artwork.status === 'sold' ? 'مباعة' : 'معلقة'}
                      </span>
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
                  <td colSpan="6" className="p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <BarChart3 className="w-12 h-12 text-gray-600" />
                      <p className="text-gray-400">لا توجد أعمال فنية</p>
                      <p className="text-gray-500 text-sm">سيظهر هنا الأعمال الفنية عند إضافتها</p>
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

export default ArtworksManagement;