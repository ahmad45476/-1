import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Share, MessageCircle, UserPlus, UserCheck } from "react-feather";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const ArtistCard = ({ artist, onFollowSuccess }) => {
  const { currentUser } = useAuth();

  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
const [forceUpdate, setForceUpdate] = useState(0);
  // =========================
  // 🔄 حساب المتابعين / المتابَعين - مصحح
  // =========================
  useEffect(() => {
    if (!artist) return;

    console.log('🎨 Artist data for card:', {
      artist,
      artistId: artist._id,
      artistName: artist.user?.name || artist.name,
      followers: artist.followers,
      followersCount: artist.user.followingArtistsCount,
      currentUser: currentUser?._id
    });

    // ✅ الإصلاح 1: استخدم followersCount مباشرة من البيانات
    const followersCountFromData = artist.user.followersCount || artist.followers?.length || 0;
    setFollowersCount(followersCountFromData);

    // ✅ الإصلاح 2: استخدم followingCount مباشرة من البيانات
    const followingCountFromData = artist.user.followingArtistsCount || artist.user.followingArtistsCount?.length || 0;
    setFollowingCount(followingCountFromData);

    if (currentUser) {
      // ✅ الإصلاح 3: أصلح المقارنة
      const followed = artist.followers?.some(follower => {
        const followerId = typeof follower === 'object' ? follower._id || follower.id : follower;
        return String(followerId) === String(currentUser._id);
      }) || false;
      
      setIsFollowing(followed);
      
      console.log('🔍 Follow check:', {
        currentUser: currentUser._id,
        isFollowing: followed,
        followersCount: followersCountFromData
      });
    }
  }, [artist, currentUser]);

  // =========================
  // 🔥 دالة المتابعة المحلية البسيطة - مصححة
  // =========================
// في handleFollow
const handleFollow = async () => {
  if (!currentUser) return;

  setLoading(true);

  // حساب المتابعة الجديدة
  const newFollowing = !isFollowing;
  setIsFollowing(newFollowing);

  // تحديث فوري للمتابعين
  setFollowersCount(prev => newFollowing ? prev + 1 : Math.max(0, prev - 1));

  try {
    const token = localStorage.getItem("artAppToken");
    if (token) {
      const response = await axios.post(
        `http://localhost:5000/api/artist/${artist._id}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.data?.followersCount !== undefined) {
        setFollowersCount(response.data.data.followersCount); // تحديث الرقم من السيرفر
      }

    }
  } catch (err) {
    console.error(err);
    // إذا صار خطأ، نرجع القيمة القديمة
    setIsFollowing(!newFollowing);
    setFollowersCount(prev => newFollowing ? prev - 1 : prev + 1);
    alert("❌ حدث خطأ، حاول مرة أخرى");
  } finally {
    setLoading(false);
  }
};


  // =========================
  // ❤️ Like (محلي)
  // =========================
  const handleLike = () => {
    setIsLiked((prev) => !prev);
  };

  // =========================
  // 🔗 Share
  // =========================
  const handleShare = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/artist/${artist._id}`
    );
    alert("تم نسخ رابط الفنان! ✅");
  };

  // =========================
  // ➕ زر المتابعة
  // =========================
  const FollowButton = () => {
    if (!currentUser) return null;

    const artistUserId = artist.user?._id || artist._id;
    if (String(artistUserId) === String(currentUser._id)) return null;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleFollow();
        }}
        disabled={loading}
        className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transition-all duration-300 ${
          isFollowing
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl"
            : "bg-gradient-to-r from-white to-gray-50 text-gray-800 border border-gray-200 shadow-md hover:shadow-lg"
        } ${loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105 active:scale-95"}`}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
            <span className="text-xs font-medium">...</span>
          </>
        ) : isFollowing ? (
          <>
            <UserCheck size={16} />
            <span className="text-xs font-medium">متابَع</span>
          </>
        ) : (
          <>
            <UserPlus size={16} />
            <span className="text-xs font-medium">متابعة</span>
          </>
        )}
      </button>
    );
  };

  // =========================
  // 🖼️ الحصول على صورة البروفايل
  // =========================
  const getProfilePicture = () => {
    if (imgError) return "http://localhost:5000/uploads/default-avatar.jpg";
    
    if (artist.user?.profilePicture) {
      if (artist.user.profilePicture.startsWith('http')) {
        return artist.user.profilePicture;
      }
      return `http://localhost:5000${artist.user.profilePicture}`;
    }
    
    return "http://localhost:5000/uploads/default-avatar.jpg";
  };

  // ألوان خلفيات عشوائية
  const gradients = [
    "from-pink-500 via-rose-500 to-red-500",
    "from-purple-500 via-violet-500 to-indigo-500",
    "from-blue-500 via-cyan-500 to-teal-500",
    "from-emerald-500 via-green-500 to-lime-500",
    "from-amber-500 via-orange-500 to-red-500"
  ];
  
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* خلفية متدرجة جميلة */}
      <div className={`relative h-48 bg-gradient-to-r ${randomGradient} overflow-hidden`}>
        {/* تأثيرات فنية خفيفة */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-8 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute bottom-8 right-8 w-12 h-12 bg-white rounded-full"></div>
        </div>

        <FollowButton />

        {/* عدد المتابعين - تصميم أجمل */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow text-sm font-medium text-gray-800">
          <span className="text-pink-600 font-bold">{followersCount}</span> متابع
        </div>

        {/* زر الإعجاب - تصميم أجمل */}
        <button
          onClick={handleLike}
          className={`absolute bottom-4 left-4 p-2.5 rounded-full shadow-md transition-all duration-300 hover:scale-110 ${
            isLiked 
              ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg" 
              : "bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white"
          }`}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
        </button>

        {isHovered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
          />
        )}
      </div>

      <div className="p-5 bg-gradient-to-b from-white to-gray-50">
        {/* صورة البروفايل - تصميم أجمل */}
        <div className="flex justify-center -mt-20 mb-4 relative">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <img
              src={getProfilePicture()}
              onError={() => setImgError(true)}
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover relative group-hover:scale-105 transition-transform duration-500"
              alt="صورة الفنان"
            />
            {/* مؤشر النشاط */}
            <div className="absolute bottom-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow"></div>
          </div>
        </div>

        {/* المعلومات الأساسية - تحسينات بسيطة */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {artist.user?.name || artist.name || "فنان"}
          </h3>
          <p className="text-pink-600 font-medium">
            @{artist.user?.username || artist.username || "artist"}
          </p>
          {artist.category && (
            <span className="inline-block mt-2 px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">
              {artist.category}
            </span>
          )}
        </div>

        {/* الإحصائيات - تصميم أجمل */}
        <div className="flex justify-around border-y border-gray-100 py-3 mb-4">
          <div className="text-center">
            <p className="font-bold text-xl text-gray-800">
              {artist.artworksCount ?? artist.artworks?.length ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">أعمال</p>
          </div>

          <div className="text-center">
            <p className="font-bold text-xl text-gray-800">{followersCount}</p>
            <p className="text-xs text-gray-500 mt-1">متابعون</p>
          </div>

          <div className="text-center">
            <p className="font-bold text-xl text-gray-800">{followingCount}</p>
            <p className="text-xs text-gray-500 mt-1">يتابع</p>
          </div>
        </div>

        {/* الأزرار السفلية - تحسينات */}
        <div className="flex justify-between items-center">
          <button 
            onClick={handleShare}
            className="p-2.5 rounded-lg text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all duration-300"
            title="مشاركة"
          >
            <Share size={18} />
          </button>

          <Link
            to={`/artist/${artist._id}`}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-medium hover:from-pink-700 hover:to-purple-700 hover:shadow-lg transition-all duration-300"
          >
            عرض الملف
          </Link>

          <button 
            onClick={() => alert("خاصية المراسلة قريباً! ✨")}
            className="p-2.5 rounded-lg text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all duration-300"
            title="مراسلة"
          >
            <MessageCircle size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ArtistCard;