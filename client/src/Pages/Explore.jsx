import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ArtworkCard from '../Components/ArtworkCard';

const Explore = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // البحث فقط

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('http://localhost:5000/api/artworks');
        
        console.log('🎨 الأعمال الفنية:', response.data);
        
        const artworksData = response.data.data || response.data.artworks || response.data || [];
        setArtworks(artworksData);
      } catch (error) {
        console.error("Error fetching artworks:", error);
        setError('تعذر تحميل الأعمال الفنية. يرجى المحاولة لاحقاً');
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  // تصفية الأعمال حسب البحث فقط
  const filteredArtworks = searchTerm 
    ? artworks.filter(artwork => 
        artwork.title && artwork.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : artworks;

  // دالة لمسح البحث
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">استكشف الأعمال الفنية</h1>
      <p className="text-gray-600 text-center mb-8">اكتشف أعمال فنية مبدعة </p>

      {/* شريط البحث فقط */}
      <div className="mb-12 max-w-xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن عمل فني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#d5006d] focus:border-transparent shadow-sm"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center">
            {searchTerm ? (
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 mr-2"
                title="مسح البحث"
              >
                ✕
              </button>
            ) : (
              <div className="text-gray-400 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* حالة التحميل */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d5006d]"></div>
          <p className="ml-4 text-gray-600">جاري تحميل الأعمال الفنية...</p>
        </div>
      )}

      {/* حالة الخطأ */}
      {error && (
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#d5006d] text-white rounded-lg hover:bg-[#b0005a] transition-colors"
          >
            حاول مرة أخرى
          </button>
        </div>
      )}

      {/* حالة عدم وجود أعمال فنية */}
      {!loading && !error && artworks.length === 0 && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 text-lg mb-4">لا توجد أعمال فنية متاحة حالياً</p>
        </div>
      )}

      {/* حالة عدم وجود نتائج بحث */}
      {!loading && !error && artworks.length > 0 && searchTerm && filteredArtworks.length === 0 && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 text-lg mb-4">لا توجد أعمال تطابق بحثك "{searchTerm}"</p>
          <button 
            onClick={clearSearch}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            عرض جميع الأعمال
          </button>
        </div>
      )}

      {/* عرض الأعمال الفنية */}
      {!loading && !error && filteredArtworks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtworks.map(artwork => (
            <ArtworkCard 
              key={artwork._id || artwork.id} 
              artwork={artwork}
              viewMode="grid"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;