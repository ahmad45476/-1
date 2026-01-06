import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MdPalette } from "react-icons/md";
import { Users, Grid, List } from "react-feather";
import { useNavigate, useParams } from "react-router-dom";
import ArtworksTab from "../Components/ArtworksTab";
import FollowingTab from "../Components/FollowingTab";
import FollowersTab from "../Components/FollowersTab";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_BASE = "http://localhost:5000";

const ArtistProfile = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // States
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("artworks");
  const [viewMode, setViewMode] = useState("grid");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const refreshData = () => setRefreshKey(prev => prev + 1);

  /* ===============================
     📥 جلب بيانات الفنان والمستخدم معاً
  ================================ */
  useEffect(() => {
    const fetchCompleteData = async () => {
      try {
        setLoading(true);
        
        // 1. جلب بيانات الفنان
        const artistRes = await axios.get(`${API_BASE}/api/artist/${id}`);
        
        if (artistRes.data.success) {
          const artistData = artistRes.data.artist;
          console.log("🎨 Artist loaded:", artistData);
          setArtist(artistData);
          
          // 2. جلب بيانات المستخدم باستخدام الـ API الجديد
          const userId = artistData.user;
          if (userId) {
            try {
              const userRes = await axios.get(`${API_BASE}/api/user/${userId}`);
              if (userRes.data.success) {
                console.log("✅ User data loaded:", userRes.data.user);
                setUserData(userRes.data.user);
              } else {
                console.log("❌ User API failed:", userRes.data.message);
              }
            } catch (userErr) {
              console.log("⚠️ User API error:", userErr.message);
            }
          }
          
          // 3. تحقق المتابعة
          if (currentUser && artistData.followers) {
            const isUserFollowing = artistData.followers.some(
              f => f === currentUser._id || f?._id === currentUser._id
            );
            setIsFollowing(isUserFollowing);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompleteData();
  }, [id, refreshKey, currentUser]);

  /* ===============================
     🔍 استخراج المعلومات النهائية
  ================================ */
  const getArtistInfo = useMemo(() => {
    if (!artist) return { 
      name: "فنان", 
      username: "artist", 
      profilePicture: null,
      bio: "",
      category: ""
    };
    
    // الأولوية: بيانات المستخدم من الـ API الجديد
    if (userData) {
      console.log("🎯 Using API user data");
      return {
        name: userData.name || userData.username || "فنان",
        username: userData.username || "artist",
        profilePicture: userData.profilePicture,
        email: userData.email || "",
        gender: userData.gender || "",
        age: userData.age || "",
        bio: artist.bio || "",
        category: artist.category || ""
      };
    }
    
    // إذا مافي userData، استخدم البيانات المتاحة
    let name = "فنان";
    let username = "artist";
    let profilePicture = null;
    
    if (artist.name) name = artist.name;
    else if (artist.username) {
      name = artist.username;
      username = artist.username;
    }
    
    if (artist.profilePicture) profilePicture = artist.profilePicture;
    
    return {
      name,
      username,
      profilePicture,
      bio: artist.bio || "",
      category: artist.category || ""
    };
  }, [artist, userData]);

  /* ===============================
     🖼️ بناء رابط الصورة النهائي
  ================================ */
  const getProfilePictureUrl = useMemo(() => {
    const info = getArtistInfo;
    
    // إذا فيه صورة حقيقية
    if (info.profilePicture) {
      const pic = info.profilePicture;
      console.log("🖼️ Profile picture:", pic);
      
      let finalUrl = pic;
      if (!pic.startsWith('http')) {
        if (pic.startsWith('/uploads/')) {
          finalUrl = `${API_BASE}${pic}`;
        } else if (pic.startsWith('uploads/')) {
          finalUrl = `${API_BASE}/${pic}`;
        } else {
          finalUrl = `${API_BASE}/uploads/${pic}`;
        }
      }
      
      console.log("🔗 Final URL:", finalUrl);
      return finalUrl;
    }
    
    // إذا مافي صورة، استخدم avatar
    console.log("🎭 Using avatar");
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(info.name)}&background=d5006d&color=fff&bold=true&size=256`;
  }, [getArtistInfo]);

  /* ===============================
     📊 حساب الإحصائيات
  ================================ */
  const stats = useMemo(() => {
    if (!artist) return { artworks: 0, followers: 0, following: 0 };
    
    return {
      artworks: artist.artworks?.length || 0,
      followers: artist.followers?.length || 0,
      following: artist.following?.length || 0
    };
  }, [artist]);

  /* ===============================
     👤 تحقق إذا كان المستخدم الحالي
  ================================ */
  const isCurrentUserProfile = useMemo(() => {
    if (!currentUser || !artist) return false;
    
    return currentUser._id === artist.user;
  }, [currentUser, artist]);

  /* ===============================
     🔁 Follow / Unfollow
  ================================ */
  const handleFollow = async () => {
    if (!currentUser || followLoading || isCurrentUserProfile) return;

    const token = localStorage.getItem("artAppToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const prevFollowing = isFollowing;
    setIsFollowing(!prevFollowing);
    
    setArtist(prev => {
      if (!prev) return prev;
      
      const currentFollowers = prev.followers || [];
      const updatedFollowers = prevFollowing
        ? currentFollowers.filter(f => f !== currentUser._id && f?._id !== currentUser._id)
        : [...currentFollowers, currentUser._id];
      
      return { ...prev, followers: updatedFollowers };
    });

    try {
      setFollowLoading(true);
      await axios.post(
        `${API_BASE}/api/artist/${id}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setIsFollowing(prevFollowing);
      console.error("Follow error:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  /* ===============================
     ⏳ Loading
  ================================ */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل...</p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">الفنان غير موجود</h2>
          <button 
            onClick={() => navigate("/artists")}
            className="mt-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  /* ===============================
     🎨 Render
  ================================ */
  const info = getArtistInfo;
  const profilePictureUrl = getProfilePictureUrl;
  
  console.log("🎯 Displaying:", {
    name: info.name,
    hasPicture: !!info.profilePicture,
    userDataLoaded: !!userData
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="h-40 bg-gradient-to-r from-pink-500 to-purple-500" />

      <div className="container mx-auto px-4 -mt-16">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar */}
          <div className="lg:w-1/3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow p-5 text-center"
            >
              {/* Profile Image */}
              <div className="relative flex justify-center -mt-12 mb-4">
                <div className="relative">
                  <img
                    src={profilePictureUrl}
                    alt={info.name}
                    className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover"
                    onError={(e) => {
                      console.error("❌ Image failed");
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(info.name)}&background=d5006d&color=fff&size=256`;
                    }}
                  />
                </div>
              </div>

              {/* Name & Info */}
              <h1 className="text-xl font-bold text-gray-800 mb-1">
                {info.name}
              </h1>
              
              <p className="text-pink-600 text-sm mb-2">
                @{info.username}
              </p>
              
              {/* User Details */}
              {(info.email || info.gender || info.age) && (
                <div className="mb-3 text-xs text-gray-600">
                  {info.email && <p className="mb-1">📧 {info.email}</p>}
                  {info.gender && (
                    <span className="mr-2">
                      {info.gender === 'male' ? '👨 ذكر' : '👩 أنثى'}
                    </span>
                  )}
                  {info.age && <span> • {info.age} سنة</span>}
                </div>
              )}
              
              {info.category && (
                <span className="inline-block mb-3 px-2 py-1 bg-pink-50 text-pink-700 rounded text-xs">
                  {info.category}
                </span>
              )}

              {/* Bio */}
              <p className="text-gray-600 mb-4 text-sm">
                {info.bio || "لا يوجد وصف"}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-bold text-gray-800">{stats.artworks}</div>
                  <div className="text-xs text-gray-500">أعمال</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-bold text-gray-800">{stats.followers}</div>
                  <div className="text-xs text-gray-500">متابعون</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-bold text-gray-800">{stats.following}</div>
                  <div className="text-xs text-gray-500">يتابع</div>
                </div>
              </div>

              {/* Follow/Edit Button */}
              {!isCurrentUserProfile ? (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                    isFollowing
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-pink-500 text-white hover:bg-pink-600"
                  } ${followLoading ? "opacity-70" : ""}`}
                >
                  {followLoading ? "..." : isFollowing ? "متابَع ✓" : "متابعة"}
                </button>
              ) : (
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="w-full py-2 rounded-lg bg-gray-100 text-gray-700 text-sm border hover:bg-gray-200"
                >
                  تعديل الملف
                </button>
              )}
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow p-3 mb-4">
              <div className="flex gap-2">
                {[
                  { id: "artworks", label: "الأعمال", icon: <MdPalette size={16} className="ml-1" /> },
                  { id: "followers", label: "المتابعون", icon: <Users size={16} className="ml-1" /> },
                  { id: "following", label: "المتابَعون", icon: <Users size={16} className="ml-1" /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 rounded-lg flex items-center text-sm transition ${
                      activeTab === tab.id
                        ? "bg-pink-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              {activeTab === "artworks" && (
                <ArtworksTab
                  artworks={artist.artworks || []}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  isCurrentUser={isCurrentUserProfile}
                  onDataRefresh={refreshData}
                />
              )}

              {activeTab === "followers" && (
                <FollowersTab artistId={artist._id} />
              )}

              {activeTab === "following" && (
                <FollowingTab artistId={artist._id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;