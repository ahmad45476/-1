import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdPerson, MdGroup, MdBookmark } from "react-icons/md";
import FollowersTab from "./FollowersTab";
import FollowingTab from "./FollowingTab";
import SavedTab from "./SavedTab";

const RegularUserProfile = ({ user, isCurrentUser }) => {
  const [activeTab, setActiveTab] = useState("saved");

  const stats = {
    followers: user.followers?.length || 0,
    following: user.following?.length || 0,
    saved: user.savedArtworks?.length || 0
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-48 rounded-2xl mb-8"></div>
      
      {/* Profile Info */}
      <div className="bg-white rounded-2xl shadow-lg p-6 -mt-20 relative z-10">
        <div className="flex flex-col items-center text-center">
          <img
            src={user.profileImage || "/default-avatar.png"}
            alt={user.name}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg mb-4"
          />
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-600">@{user.username}</p>
          {!user.bio && isCurrentUser && (
            <button className="mt-4 text-blue-500 hover:text-blue-600">
              أضف نبذة عن نفسك
            </button>
          )}
        </div>
      </div>

      {/* Stats - بدون أعمال */}
      <div className="grid grid-cols-3 gap-4 my-6">
        <StatCard 
          number={stats.saved} 
          label="محفوظ" 
          icon={<MdBookmark />}
          onClick={() => setActiveTab("saved")}
          active={activeTab === "saved"}
        />
        <StatCard 
          number={stats.followers} 
          label="متابِع" 
          icon={<MdGroup />}
          onClick={() => setActiveTab("followers")}
          active={activeTab === "followers"}
        />
        <StatCard 
          number={stats.following} 
          label="متابَع" 
          icon={<MdPerson />}
          onClick={() => setActiveTab("following")}
          active={activeTab === "following"}
        />
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {activeTab === "saved" && (
          <div>
            <h3 className="text-xl font-bold mb-4">الأعمال المحفوظة</h3>
            {stats.saved > 0 ? (
              <SavedTab saved={user.savedArtworks} />
            ) : (
              <EmptyState 
                icon="📌"
                title="لا توجد أعمال محفوظة"
                message="ابدأ بحفظ الأعمال التي تعجبك"
                buttonText="استكشاف الأعمال"
                onClick={() => window.location.href = '/explore'}
              />
            )}
          </div>
        )}
        
        {activeTab === "followers" && <FollowersTab followers={user.followers} />}
        {activeTab === "following" && <FollowingTab following={user.following} />}
      </div>
    </div>
  );
};

const StatCard = ({ number, label, icon, onClick, active }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    onClick={onClick}
    className={`p-4 rounded-xl text-center cursor-pointer ${
      active ? "bg-blue-50 border-2 border-blue-200" : "bg-gray-50 hover:bg-gray-100"
    }`}
  >
    <div className="text-2xl font-bold text-blue-600">{number}</div>
    <div className="text-gray-600 mt-1">{label}</div>
  </motion.div>
);

const EmptyState = ({ icon, title, message, buttonText, onClick }) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">{icon}</div>
    <h4 className="text-lg font-medium text-gray-800 mb-2">{title}</h4>
    <p className="text-gray-600 mb-6">{message}</p>
    <button
      onClick={onClick}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      {buttonText}
    </button>
  </div>
);

export default RegularUserProfile;