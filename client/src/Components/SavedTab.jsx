import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Grid, List, Eye } from 'react-feather';

const SavedArtworksTab = ({ savedArtworks = [], viewMode, setViewMode, onDataRefresh }) => {
  console.log('📦 Saved artworks data:', {
    count: savedArtworks.length,
    artworks: savedArtworks
  });

  if (savedArtworks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Bookmark size={48} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            لا توجد أعمال محفوظة
          </h3>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            عند حفظ أي عمل فني باستخدام زر الإشارة المرجعية، سيظهر هنا
          </p>
          <button
            onClick={() => window.location.href = '/explore'}
            className="px-6 py-3 bg-[#d5006d] text-white rounded-lg hover:bg-[#b3005a] transition-colors flex items-center"
          >
            <Eye size={18} className="ml-1" />
            استكشاف الأعمال
          </button>
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
              الأعمال المحفوظة ({savedArtworks.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              الأعمال التي قمت بحفظها للإشارات المرجعية
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${
                viewMode === "grid" ? "bg-[#d5006d] text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${
                viewMode === "list" ? "bg-[#d5006d] text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedArtworks.map((artwork, index) => (
              <motion.div
                key={artwork._id || `saved-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {artwork.imageUrl ? (
                  <img 
                    src={artwork.imageUrl} 
                    alt={artwork.title}
                    className="w-full h-56 object-cover"
                  />
                ) : (
                  <div className="w-full h-56 bg-gradient-to-r from-pink-100 to-purple-100 flex items-center justify-center">
                    <Bookmark size={32} className="text-gray-400" />
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">
                      {artwork.title || 'عمل بدون عنوان'}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      محفوظ
                    </span>
                  </div>
                  
                  {artwork.artist && (
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 mr-2">
                        {artwork.artist.profilePicture ? (
                          <img 
                            src={artwork.artist.profilePicture} 
                            alt={artwork.artist.username}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <span className="text-sm text-gray-600">
                        @{artwork.artist.username}
                      </span>
                    </div>
                  )}
                  
                  {artwork.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {artwork.description}
                    </p>
                  )}
                  
                  <button
                    onClick={() => window.location.href = `/artwork/${artwork._id}`}
                    className="w-full px-4 py-2 bg-[#d5006d] hover:bg-[#b3005a] text-white rounded-lg transition-colors text-center"
                  >
                    عرض العمل
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {savedArtworks.map((artwork, index) => (
              <motion.div
                key={artwork._id || `saved-list-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow flex items-center"
              >
                {artwork.imageUrl ? (
                  <img 
                    src={artwork.imageUrl} 
                    alt={artwork.title}
                    className="w-24 h-24 object-cover rounded-lg mr-4"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <Bookmark size={24} className="text-gray-400" />
                  </div>
                )}
                
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-800">
                      {artwork.title || 'عمل بدون عنوان'}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      محفوظ
                    </span>
                  </div>
                  
                  {artwork.artist && (
                    <p className="text-sm text-gray-600 mb-1">
                      بواسطة: @{artwork.artist.username}
                    </p>
                  )}
                  
                  {artwork.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {artwork.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => window.location.href = `/artwork/${artwork._id}`}
                      className="px-4 py-1 bg-[#d5006d] hover:bg-[#b3005a] text-white rounded-lg transition-colors text-sm"
                    >
                      عرض العمل
                    </button>
                    
                    {artwork.createdAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(artwork.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedArtworksTab;