import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Heart, MessageSquare, Share, Eye, 
  TrendingUp, Calendar, Filter, Download 
} from 'lucide-react';

const ActivitiesManagement = () => {
  const [timeRange, setTimeRange] = useState('week');
  
  // إحصائيات الأنشطة
  const activityStats = [
    { 
      title: 'إجمالي التفاعلات', 
      value: '45.2K', 
      change: '+18%', 
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'الإعجابات', 
      value: '23.1K', 
      change: '+12%', 
      icon: Heart,
      color: 'from-[#d5006d] to-[#ff4081]'
    },
    { 
      title: 'التعليقات', 
      value: '8.4K', 
      change: '+8%', 
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500'
    },
    { 
      title: 'المشاركات', 
      value: '3.2K', 
      change: '+15%', 
      icon: Share,
      color: 'from-orange-500 to-amber-500'
    }
  ];

  // آخر الأنشطة
  const recentActivities = [
    {
      id: 1,
      user: "أحمد محمد",
      action: "أعجب بـ",
      target: "لوحة الطبيعة",
      type: "like",
      time: "منذ 5 دقائق",
      avatar: "أ"
    },
    {
      id: 2,
      user: "سارة علي",
      action: "علقت على",
      target: "نحت خشبي",
      type: "comment",
      time: "منذ 15 دقيقة",
      avatar: "س"
    },
    {
      id: 3,
      user: "محمد خالد",
      action: "شارك",
      target: "تصوير فوتوغرافي",
      type: "share",
      time: "منذ ساعة",
      avatar: "م"
    },
    {
      id: 4,
      user: "فاطمة أحمد",
      action: "أضاف عمل جديد",
      target: "رسم زيتي",
      type: "upload",
      time: "منذ ساعتين",
      avatar: "ف"
    },
    {
      id: 5,
      user: "يوسف كمال",
      action: "تابع فنان",
      target: "فنان تشكيلي",
      type: "follow",
      time: "منذ 3 ساعات",
      avatar: "ي"
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-400" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'share': return <Share className="w-4 h-4 text-green-400" />;
      case 'upload': return <Eye className="w-4 h-4 text-purple-400" />;
      case 'follow': return <Users className="w-4 h-4 text-orange-400" />;
      default: return <Heart className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">الأنشطة والتفاعلات</h1>
          <p className="text-gray-400">متابعة تفاعلات المستخدمين على المنصة</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-xl py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#d5006d]"
          >
            <option value="day">آخر 24 ساعة</option>
            <option value="week">آخر أسبوع</option>
            <option value="month">آخر شهر</option>
          </select>
          <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            تصفية
          </button>
          <button className="px-4 py-2 bg-[#d5006d] text-white rounded-xl hover:bg-[#b3005c] transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            تصدير التقرير
          </button>
        </div>
      </div>

      {/* إحصائيات التفاعلات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activityStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors group"
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
            <p className="text-gray-300 font-medium">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* آخر الأنشطة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* قائمة الأنشطة */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">آخر الأنشطة</h3>
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">آخر 24 ساعة</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{activity.avatar}</span>
                </div>
                
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.user}</span>
                    {' '}{activity.action}{' '}
                    <span className="text-[#d5006d]">{activity.target}</span>
                  </p>
                  <p className="text-gray-400 text-xs">{activity.time}</p>
                </div>
                
                <div className="p-2 bg-gray-600 rounded-lg">
                  {getActivityIcon(activity.type)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* رسم بياني للتفاعلات */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">توزيع التفاعلات</h3>
          <div className="space-y-4">
            {[
              { label: 'الإعجابات', value: 45, color: 'bg-[#d5006d]' },
              { label: 'التعليقات', value: 25, color: 'bg-blue-500' },
              { label: 'المشاركات', value: 15, color: 'bg-green-500' },
              { label: 'المتابعات', value: 10, color: 'bg-orange-500' },
              { label: 'التنزيلات', value: 5, color: 'bg-purple-500' }
            ].map((item, index) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-white text-sm">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-400 text-sm w-8">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesManagement;