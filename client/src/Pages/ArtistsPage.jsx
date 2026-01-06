import { useState, useEffect } from 'react';
import axios from 'axios';
import ArtistCard from '../Components/ArtistCard';

const ArtistsPage = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/artist/getArtist');
      setArtists(response.data.data || []);
      
      
    } catch (err) {
      console.error('Error fetching artists:', err);
      setError('فشل في تحميل بيانات الفنانين');
    } finally {
      console.log(artists);
      
      setLoading(false);
    }
  };
const handleFollowSuccess = (artistId, data) => {
  setArtists(prev =>
    prev.map(artist =>
      artist._id === artistId
        ? {
            ...artist,
            followersCount: data.followersCount,
            user: {
              ...artist.user,
              followingArtistsCount:
                data.followingArtistsCount ??
                artist.user?.followingArtistsCount,
            },
          }
        : artist
    )
  );
};

  // تصفية الفنانين حسب البحث
  const filteredArtists = artists.filter(artist =>
    artist.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
          {error}
          <button 
            onClick={fetchArtists}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">الفنانين المبدعين</h1>
      <p className="text-gray-600 text-center mb-10">اكتشف مواهب فنية رائعة من مختلف أنحاء العالم</p>

      {/* شريط البحث */}
      <div className="mb-8 max-w-md mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن فنان..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <div className="absolute right-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* عرض الفنانين */}
      {filteredArtists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
       {filteredArtists.map(artist => (
  <ArtistCard
    key={artist._id}
    artist={artist}
    onFollowSuccess={handleFollowSuccess} // ✅ هون المهم
  />
))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 text-xl">لا يوجد فنانين متطابقين مع بحثك</p>
        </div>
      )}
    </div>
  );
};

export default ArtistsPage;
