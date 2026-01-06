import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserCheck } from 'react-feather';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UserCard = ({ user, showFollowButton = true }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  
  // استخراج بيانات المستخدم (قد تأتي من user مباشرة أو من user.user)
  const userData = user.user || user;
  
  useEffect(() => {
    if (currentUser && userData) {
      // تحقق إذا كان المستخدم الحالي يتابع هذا المستخدم
      // يمكنك إضافة API call هنا للتحقق من حالة المتابعة
      setIsFollowing(false); // مؤقتاً
    }
  }, [currentUser, userData]);

  const handleFollow = async () => {
    if (!currentUser) {
      alert('يجب تسجيل الدخول لمتابعة المستخدمين');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/users/${userData._id}/follow`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error following user:', error);
      alert(error.response?.data?.message || 'حدث خطأ في المتابعة');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `/api/users/${userData._id}/follow`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setIsFollowing(false);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-center">
          {/* صورة البروفايل */}
          <Link to={`/artist/${userData._id}`}>
            <img
              src={`http://localhost:5000${userData.profilePicture || '/default-avatar.jpg'}`}
              alt={userData.username || userData.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                e.target.src = 'http://localhost:5000/default-avatar.jpg';
              }}
            />
          </Link>
          
          {/* معلومات المستخدم */}
          <div className="mr-4 flex-1">
            <Link to={`/artist/${userData._id}`}>
              <h4 className="font-semibold text-gray-800 hover:text-[#d5006d] transition-colors">
                {userData.name || userData.username}
              </h4>
            </Link>
            <p className="text-gray-500 text-sm">
              @{userData.username}
            </p>
            {userData.bio && (
              <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                {userData.bio}
              </p>
            )}
          </div>
          
          {/* زر المتابعة */}
          {showFollowButton && currentUser && currentUser.id !== userData._id && (
            <button
              onClick={isFollowing ? handleUnfollow : handleFollow}
              disabled={loading}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                isFollowing
                  ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  : 'bg-[#d5006d] text-white hover:bg-[#b0005a]'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={14} className="inline ml-1" />
                  متابع
                </>
              ) : (
                <>
                  <UserPlus size={14} className="inline ml-1" />
                  متابعة
                </>
              )}
            </button>
          )}
        </div>
        
        {/* الإحصائيات */}
        <div className="flex justify-around mt-4 pt-3 border-t border-gray-100">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">
              {userData.artworksCount || userData.artworks?.length || 0}
            </p>
            <p className="text-xs text-gray-500">أعمال</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">
              {userData.followersCount || userData.followers?.length || 0}
            </p>
            <p className="text-xs text-gray-500">متابعون</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">
              {userData.followingCount || userData.following?.length || 0}
            </p>
            <p className="text-xs text-gray-500">متابَعون</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;