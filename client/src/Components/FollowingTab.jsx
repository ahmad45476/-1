import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserX, ExternalLink } from 'react-feather';
import axios from 'axios';

const FollowingTab = ({ following = [], isCurrentUser, artistId, onDataRefresh, onFollowToggle }) => {
  const [loading, setLoading] = useState(false);
  const [followingData, setFollowingData] = useState([]);
  const [unfollowingId, setUnfollowingId] = useState(null);

  useEffect(() => {
    console.log('👤 FollowingTab - Data received:', {
      count: following?.length || 0,
      data: following,
      artistId,
      isCurrentUser
    });

    // معالجة البيانات
    if (following && Array.isArray(following)) {
      const processed = following
        .filter(user => user && typeof user === 'object')
        .map(user => ({
          _id: user._id || user.id,
          username: user.username || user.email?.split('@')[0] || 'user',
          name: user.name || user.username || 'مستخدم',
          profilePicture: user.profilePicture || user.avatar || null,
          bio: user.bio || '',
          email: user.email || ''
        }));
      
      console.log('✅ Processed following:', processed);
      setFollowingData(processed);
    } else {
      console.log('ℹ️ No following data available');
      setFollowingData([]);
    }
  }, [following, artistId]);

  const handleUnfollow = async (followedUserId) => {
    if (!isCurrentUser || !followedUserId) {
      console.log('❌ Cannot unfollow: not current user or no user ID');
      return;
    }

    try {
      setUnfollowingId(followedUserId);
      
      if (onFollowToggle) {
        // استخدام الدالة من الـ parent
        await onFollowToggle(followedUserId);
        
        // إزالة المستخدم من القائمة المحلية
        setFollowingData(prev => prev.filter(user => user._id !== followedUserId));
      } else {
        // استخدام الـ API مباشرة
        const token = localStorage.getItem('token');
        if (!token) {
          alert('يجب تسجيل الدخول أولاً');
          return;
        }

        const response = await axios.post(`/api/artist/${followedUserId}/follow`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.success && !response.data.isFollowing) {
          setFollowingData(prev => prev.filter(user => user._id !== followedUserId));
          
          if (onDataRefresh) {
            setTimeout(() => onDataRefresh(), 1000);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Unfollow error:', error);
      alert('حدث خطأ أثناء إلغاء المتابعة');
    } finally {
      setUnfollowingId(null);
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (followingData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Users size={48} className="text-gray-400" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {isCurrentUser ? 'لم تتابع أي مستخدم بعد' : 'لا يتابع أي مستخدمين'}
          </h3>
          
          <p className="text-gray-500 mb-6 text-center max-w-md">
            {isCurrentUser 
              ? 'ابحث عن فنانين آخرين وابدأ بمتابعتهم لترى أعمالهم هنا' 
              : 'هذا المستخدم لا يتابع أي مستخدمين آخرين'}
          </p>
          
          {isCurrentUser && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.href = '/explore'}
                className="px-6 py-3 bg-[#d5006d] text-white rounded-lg hover:bg-[#b3005a] transition-colors flex items-center"
              >
                <ExternalLink size={18} className="ml-1" />
                استكشاف الفنانين
              </button>
            </div>
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
              المتابَعون ({followingData.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isCurrentUser ? 'المستخدمين الذين تتابعهم' : 'المستخدمين الذين يتابعهم هذا الفنان'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followingData.map((user, index) => (
            <motion.div
              key={user._id || `user-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {/* صورة المستخدم */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-pink-100 to-purple-100 flex-shrink-0">
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    <div className={`w-full h-full ${user.profilePicture ? 'hidden' : 'flex'} items-center justify-center bg-gray-200`}>
                      <span className="text-lg font-semibold text-gray-600">
                        {user.name?.charAt(0) || user.username?.charAt(0) || '?'}
                      </span>
                    </div>
                  </div>
                  
                  {/* معلومات المستخدم */}
                  <div className="mr-3">
                    <h3 className="font-semibold text-gray-800">
                      {user.name || 'مستخدم'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      @{user.username || 'user'}
                    </p>
                  </div>
                </div>
                
                {/* زر إلغاء المتابعة (للمستخدم الحالي فقط) */}
                {isCurrentUser && (
                  <button
                    onClick={() => handleUnfollow(user._id)}
                    disabled={unfollowingId === user._id}
                    className="px-3 py-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center"
                  >
                    {unfollowingId === user._id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                        جاري...
                      </>
                    ) : (
                      <>
                        <UserX size={14} className="ml-1" />
                        إلغاء
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* البايو إذا موجود */}
              {user.bio && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {user.bio}
                </p>
              )}
              
              {/* أزرار الإجراءات */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => window.location.href = `/profile/${user._id}`}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-center"
                >
                  زيارة الملف
                </button>
                
                {!isCurrentUser && (
                  <button
                    onClick={() => window.location.href = `/messages/${user._id}`}
                    className="flex-1 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-center"
                  >
                    مراسلة
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FollowingTab;