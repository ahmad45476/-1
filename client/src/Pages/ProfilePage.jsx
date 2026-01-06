import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MdPalette } from "react-icons/md";
import { Bookmark, Users, Grid, List } from "react-feather";
import UserInfoCard from "../Components/UserInfoCard";
import { useNavigate } from "react-router-dom";
import ArtworksTab from "../Components/ArtworksTab";
import { useAuth } from "../context/AuthContext";
import FollowingTab from "../Components/FollowingTab";
import FollowersTab from "../Components/FollowersTab";
import SavedArtworksTab from "../Components/SavedTab";
import axios from "axios";

const ProfilePage = ({ isCurrentUser = false }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [artistId, setArtistId] = useState(null);
  const [activeTab, setActiveTab] = useState("artworks");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [profileData, setProfileData] = useState({
    artworks: [],
    followers: [],
    following: [],
    saved: []
  });

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);

        if (!currentUser) {
          setLoading(false);
          return;
        }

        const userId = currentUser._id;
        const artistProfile = currentUser.artistProfile || currentUser;
        const targetArtistId = artistProfile._id || userId;
        setArtistId(targetArtistId);

        // البيانات الأولية من context
        let fetchedArtworks = artistProfile.artworks || [];
        let fetchedFollowers = artistProfile.followers || [];
        let fetchedFollowing = currentUser.followingArtists || [];
        let fetchedSaved = currentUser.savedArtworks || [];

        const token = localStorage.getItem('token');
        if (token) {
          try {
            // جلب البيانات من API
            const artistResponse = await axios.get(`/api/artist/${targetArtistId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (artistResponse.data.success && artistResponse.data.artist) {
              const apiData = artistResponse.data.artist;
              fetchedArtworks = apiData.artworks || fetchedArtworks;
              fetchedFollowers = apiData.followers || fetchedFollowers;
              fetchedFollowing = apiData.followingArtists || fetchedFollowing;
            }
          } catch (err) {
            console.warn('⚠️ API fetch failed, using local data', err.message);
          }

          if (isCurrentUser) {
            try {
              const savedRes = await axios.get('/api/user/saved-artworks', {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (savedRes.data.success) {
                fetchedSaved = savedRes.data.artworks || savedRes.data.savedArtworks || fetchedSaved;
              }
            } catch (err) {
              console.warn('⚠️ Saved artworks fetch failed', err.message);
            }
          }
        }

        setProfileData({
          artworks: fetchedArtworks,
          followers: fetchedFollowers,
          following: fetchedFollowing,
          saved: fetchedSaved
        });

      } catch (error) {
        console.error('❌ Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchProfileData();
  }, [currentUser, isCurrentUser, refreshKey]);

  // احصائيات
  const stats = useMemo(() => ({
    artworks: profileData.artworks.length,
    followers: profileData.followers.length,
    following: profileData.following.length,
    saved: profileData.saved.length
  }), [profileData]);

  if (loading) return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d5006d] mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري تحميل الملف الشخصي...</p>
      </div>
    </div>
  );

  if (!currentUser) return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">لا يوجد مستخدم</h2>
        <p className="text-gray-600 mb-6">يرجى تسجيل الدخول لعرض الملف الشخصي</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-[#d5006d] text-white rounded-lg hover:bg-[#b3005a] transition-colors"
        >
          تسجيل الدخول
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative h-48 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* معلومات المستخدم */}
          <div className="lg:w-1/3 relative">
            <UserInfoCard
              isCurrentUser={isCurrentUser}
              artistId={artistId}
              user={currentUser}
              followersCount={stats.followers}
              followingCount={stats.following}
              artworksCount={stats.artworks}
            />
          </div>

          {/* المحتوى الرئيسي */}
          <div className="lg:w-2/3">
            {/* الإحصائيات */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6 mb-6"
            >
              <div className={`grid ${isCurrentUser ? "grid-cols-4" : "grid-cols-3"} gap-4 text-center`}>
                <motion.div whileHover={{ scale: 1.05 }} onClick={() => setActiveTab("artworks")}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${activeTab === "artworks" ? "bg-[#d5006d]/10" : "hover:bg-gray-100"}`}>
                  <p className="text-2xl font-bold text-[#d5006d]">{stats.artworks}</p>
                  <p className="text-gray-600">أعمال</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} onClick={() => setActiveTab("followers")}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${activeTab === "followers" ? "bg-[#d5006d]/10" : "hover:bg-gray-100"}`}>
                  <p className="text-2xl font-bold text-[#d5006d]">{stats.followers}</p>
                  <p className="text-gray-600">متابعون</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} onClick={() => setActiveTab("following")}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${activeTab === "following" ? "bg-[#d5006d]/10" : "hover:bg-gray-100"}`}>
                  <p className="text-2xl font-bold text-[#d5006d]">{stats.following}</p>
                  <p className="text-gray-600">متابَعون</p>
                </motion.div>

                {isCurrentUser && (
                  <motion.div whileHover={{ scale: 1.05 }} onClick={() => setActiveTab("saved")}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${activeTab === "saved" ? "bg-[#d5006d]/10" : "hover:bg-gray-100"}`}>
                    <p className="text-2xl font-bold text-[#d5006d]">{stats.saved}</p>
                    <p className="text-gray-600">محفوظات</p>
                  </motion.div>
                )}
              </div>

              <div className="mt-4 text-center text-sm text-gray-500">
                <p>{isCurrentUser ? 'ملفك الشخصي' : `ملف ${currentUser.name || currentUser.username}`}</p>
              </div>
            </motion.div>

            {/* تبويبات المحتوى */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-md p-4 mb-6 flex justify-between items-center"
            >
              <div className="flex space-x-1">
                <button onClick={() => setActiveTab("artworks")}
                  className={`px-4 py-2 rounded-lg flex items-center ${activeTab === "artworks" ? "bg-[#d5006d] text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                  <MdPalette className="ml-2" size={20} /> الأعمال
                </button>
                <button onClick={() => setActiveTab("followers")}
                  className={`px-4 py-2 rounded-lg flex items-center ${activeTab === "followers" ? "bg-[#d5006d] text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                  <Users className="ml-2" size={18} /> المتابعون
                </button>
                <button onClick={() => setActiveTab("following")}
                  className={`px-4 py-2 rounded-lg flex items-center ${activeTab === "following" ? "bg-[#d5006d] text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                  <Users className="ml-2" size={18} /> المتابَعون
                </button>
                {isCurrentUser && (
                  <button onClick={() => setActiveTab("saved")}
                    className={`px-4 py-2 rounded-lg flex items-center ${activeTab === "saved" ? "bg-[#d5006d] text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                    <Bookmark className="ml-2" size={18} /> المحفوظات
                  </button>
                )}
              </div>

              {(activeTab === "artworks" || (isCurrentUser && activeTab === "saved")) && (
                <div className="flex space-x-2">
                  <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-[#d5006d] text-white" : "bg-gray-100 hover:bg-gray-200"}`}>
                    <Grid size={18} />
                  </button>
                  <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[#d5006d] text-white" : "bg-gray-100 hover:bg-gray-200"}`}>
                    <List size={18} />
                  </button>
                </div>
              )}
            </motion.div>

            {/* محتوى التبويب النشط */}
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              {activeTab === "artworks" && <ArtworksTab artworks={profileData.artworks} viewMode={viewMode} setViewMode={setViewMode} isCurrentUser={isCurrentUser} onDataRefresh={refreshData} />}
              {activeTab === "followers" && <FollowersTab followers={profileData.followers} isCurrentUser={isCurrentUser} artistId={artistId} onDataRefresh={refreshData} />}
              {activeTab === "following" && <FollowingTab following={profileData.following} isCurrentUser={isCurrentUser} artistId={artistId} onDataRefresh={refreshData} />}
              {activeTab === "saved" && isCurrentUser && <SavedArtworksTab savedArtworks={profileData.saved} viewMode={viewMode} setViewMode={setViewMode} onDataRefresh={refreshData} />}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
