import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, ExternalLink } from 'react-feather';
import axios from 'axios';

const FollowersTab = ({ followers = [], isCurrentUser, artistId, onDataRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [followersData, setFollowersData] = useState([]);

  useEffect(() => {
    console.log('👥 FollowersTab - Data received:', {
      count: followers?.length || 0,
      data: followers,
      artistId,
      isCurrentUser
    });

    // معالجة البيانات
    if (followers && Array.isArray(followers)) {
      const processed = followers
        .filter(follower => follower && typeof follower === 'object')
        .map(follower => ({
          _id: follower._id || follower.id,
          username: follower.username || follower.email?.split('@')[0] || 'user',
          name: follower.name || follower.username || 'متابع',
          profilePicture: follower.profilePicture || follower.avatar || null,
          bio: follower.bio || '',
          email: follower.email || ''
        }));
      
      console.log('✅ Processed followers:', processed);
      setFollowersData(processed);
    } else {
      console.log('ℹ️ No followers data available');
      setFollowersData([]);
    }
  }, [followers, artistId]);

  const handleFollow = async (followerId) => {
    if (!isCurrentUser || !followerId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('يجب تسجيل الدخول أولاً');
        return;
      }

      const response = await axios.post(`/api/artist/${followerId}/follow`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        if (onDataRefresh) {
          onDataRefresh();
        }
        alert(response.data.isFollowing ? 'تم المتابعة بنجاح' : 'تم إلغاء المتابعة');
      }
    } catch (error) {
      console.error('❌ Follow error:', error);
      alert('حدث خطأ أثناء المتابعة');
    } finally {
      setLoading(false);
    }
  };

  if (followersData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Users size={48} className="text-gray-400" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            لا يوجد متابعون
          </h3>
          
          <p className="text-gray-500 mb-6 text-center max-w-md">
            {isCurrentUser 
              ? 'سيظهر المتابعون هنا عندما يبدأ الآخرون بمتابعتك' 
              : 'لا يوجد متابعون لهذا المستخدم'}
          </p>
          
          {isCurrentUser && (
            <button
              onClick={() => window.location.href = '/explore'}
              className="px-6 py-3 bg-[#d5006d] text-white rounded-lg hover:bg-[#b3005a] transition-colors flex items-center"
            >
              <ExternalLink size={18} className="ml-1" />
              نشر أعمال جديدة
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              المتابعون ({followersData.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              المستخدمين الذين يتابعون هذا الفنان
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followersData.map((follower, index) => (
            <motion.div
              key={follower._id || `follower-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {/* صورة المتابع */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-pink-100 to-purple-100 flex-shrink-0">
                    {follower.profilePicture ? (
                      <img 
                        src={follower.profilePicture} 
                        alt={follower.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-lg font-semibold text-gray-600">
                          {follower.name?.charAt(0) || follower.username?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* معلومات المتابع */}
                  <div className="mr-3">
                    <h3 className="font-semibold text-gray-800">
                      {follower.name || 'متابع'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      @{follower.username || 'user'}
                    </p>
                  </div>
                </div>
                
                {/* زر المتابعة (للمستخدم الحالي فقط) */}
                {isCurrentUser && (
                  <button
                    onClick={() => handleFollow(follower._id)}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-[#d5006d] hover:bg-[#b3005a] text-white rounded-lg transition-colors flex items-center"
                  >
                    <UserPlus size={14} className="ml-1" />
                    متابعة
                  </button>
                )}
              </div>
              
              {/* البايو إذا موجود */}
              {follower.bio && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {follower.bio}
                </p>
              )}
              
              {/* زر زيارة الملف الشخصي */}
              <button
                onClick={() => window.location.href = `/profile/${follower._id}`}
                className="w-full mt-3 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-center"
              >
                زيارة الملف الشخصي
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FollowersTab;