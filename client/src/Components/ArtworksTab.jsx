import React from 'react';
import { Grid, List } from 'react-feather';
import ArtworkCard from './ArtworkCard';
import { useNavigate } from 'react-router-dom';

const ArtworksTab = ({ artworks = [], viewMode, setViewMode, isCurrentUser = false, onDataRefresh }) => {
  const navigate = useNavigate();
  
  // تأكد من أن artworks هي مصفوفة
  const safeArtworks = Array.isArray(artworks) ? artworks : [];
  
  // تحقق من صحة artwork object
  const isValidArtwork = (artwork) => {
    return artwork && (artwork._id || artwork.id);
  };
  
  // فلترة الأعمال غير الصالحة
  const validArtworks = safeArtworks.filter(isValidArtwork);
  
  // عدد الأعمال الصالحة
  const artworksCount = validArtworks.length;

  // معالجة الإعجاب
  const handleLike = async (artworkId) => {
    console.log('Liked artwork:', artworkId);
    if (onDataRefresh) {
      setTimeout(() => {
        onDataRefresh();
      }, 500);
    }
  };

  // معالجة الحفظ
  const handleSave = async (artworkId, isSaved) => {
    console.log('Saved artwork:', artworkId, isSaved);
    if (onDataRefresh) {
      setTimeout(() => {
        onDataRefresh();
      }, 500);
    }
  };

  return (
    <div>
      {/* شريط التحكم بالعرض */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-xl font-bold text-gray-800">الأعمال الفنية</h3>
          {artworksCount > 0 && (
            <span className="mr-3 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
              {artworksCount}
            </span>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode && setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#d5006d] text-white' : 'bg-gray-100'}`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode && setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-[#d5006d] text-white' : 'bg-gray-100'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* عرض الأعمال */}
      {artworksCount > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {validArtworks.map(artwork => (
            <ArtworkCard 
              key={artwork._id || artwork.id} 
              artwork={artwork} 
              viewMode={viewMode}
              isCurrentUser={isCurrentUser}
              onLike={handleLike}
              onSave={handleSave}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            {isCurrentUser ? 'ليس لديك أعمال فنية بعد' : 'لا يوجد أعمال فنية'}
          </h3>
          <p className="text-gray-500">
            {isCurrentUser 
              ? 'ابدأ بنشر أول عمل فني لك ومشاركته مع العالم'
              : 'هذا الفنان لم ينشر أي أعمال فنية بعد'
            }
          </p>
          {isCurrentUser && (
            <button 
              onClick={() => navigate('/add-artwork')}
              className="mt-4 px-6 py-2 bg-[#d5006d] text-white rounded-lg hover:bg-[#b0005a] transition"
            >
              إضافة عمل فني
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtworksTab;