// DiagnosticPage.jsx - أضف هذا الملف
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DataDiagnostic = () => {
  const { currentUser } = useAuth();
  const [diagnosticData, setDiagnosticData] = useState({});
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('artAppToken');
      
      const results = {
        timestamp: new Date().toISOString(),
        userId: currentUser._id,
        artistId: currentUser.artistProfile?._id || currentUser._id
      };

      // 1. جلب بيانات المستخدم
      const userRes = await axios.get(
        `http://localhost:5000/api/user/${currentUser._id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      results.userData = {
        following: userRes.data.user?.following || [],
        followingCount: userRes.data.user?.following?.length || 0,
        followers: userRes.data.user?.followers || [],
        followersCount: userRes.data.user?.followers?.length || 0
      };

      // 2. جلب بيانات الفنان
      const artistRes = await axios.get(
        `http://localhost:5000/api/artist/${results.artistId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      results.artistData = {
        following: artistRes.data.artist?.following || [],
        followingCount: artistRes.data.artist?.following?.length || 0,
        followers: artistRes.data.artist?.followers || [],
        followersCount: artistRes.data.artist?.followers?.length || 0
      };

      // 3. جلب جميع الفنانين (للتأكد)
      const artistsRes = await axios.get(
        'http://localhost:5000/api/artists/all',
        { headers: { 'Authorization': `Bearer ${token}` } }
      ).catch(() => ({ data: { artists: [] } }));
      results.allArtists = artistsRes.data.artists?.length || 0;

      // 4. التحقق من قائمة المتابعة الفعلية
      // البحث عن الفنانين الذين يتابعهم المستخدم
      let actualFollowing = [];
      if (artistsRes.data.artists) {
        for (const artist of artistsRes.data.artists.slice(0, 20)) {
          try {
            const artistDetails = await axios.get(
              `http://localhost:5000/api/artist/${artist._id}`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            if (artistDetails.data.artist?.followers?.includes(currentUser._id)) {
              actualFollowing.push({
                _id: artist._id,
                name: artist.name || artist.user?.name,
                username: artist.username || artist.user?.username
              });
            }
          } catch (e) {
            console.log(`Could not check artist ${artist._id}`);
          }
        }
      }
      results.actualFollowing = actualFollowing;
      results.actualFollowingCount = actualFollowing.length;

      setDiagnosticData(results);
      console.log('🔍 Diagnostic Results:', results);
      
    } catch (error) {
      console.error('Diagnostic error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">تشخيص بيانات المتابعة</h1>
      
      <button
        onClick={runDiagnostic}
        disabled={loading}
        className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'جاري التشخيص...' : 'تشغيل التشخيص'}
      </button>

      {diagnosticData.timestamp && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">نتائج التشخيص</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border p-4 rounded">
              <h3 className="font-bold text-lg mb-2">بيانات المستخدم</h3>
              <p>المتابَعون: {diagnosticData.userData?.followingCount || 0}</p>
              <p>المتابعون: {diagnosticData.userData?.followersCount || 0}</p>
            </div>
            
            <div className="border p-4 rounded">
              <h3 className="font-bold text-lg mb-2">بيانات الفنان</h3>
              <p>المتابَعون: {diagnosticData.artistData?.followingCount || 0}</p>
              <p>المتابعون: {diagnosticData.artistData?.followersCount || 0}</p>
            </div>
            
            <div className="border p-4 rounded col-span-2">
              <h3 className="font-bold text-lg mb-2">المتابعة الفعلية</h3>
              <p className="text-green-600 font-bold">
                عدد الفنانين الذين تتابعهم فعلياً: {diagnosticData.actualFollowingCount || 0}
              </p>
              {diagnosticData.actualFollowing && diagnosticData.actualFollowing.length > 0 && (
                <ul className="mt-2">
                  {diagnosticData.actualFollowing.map(artist => (
                    <li key={artist._id} className="py-1 border-b">
                      {artist.name} (@{artist.username})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-bold mb-2">التحليل:</h3>
            {diagnosticData.actualFollowingCount === 0 ? (
              <p className="text-red-600">❌ أنت لا تتابع أي فنانين في قاعدة البيانات</p>
            ) : diagnosticData.actualFollowingCount > 0 && 
               diagnosticData.userData?.followingCount === 0 ? (
              <p className="text-yellow-600">
                ⚠️ هناك تناقض! أنت تتابع {diagnosticData.actualFollowingCount} فنانين، 
                لكن البيانات الرسمية تظهر 0. يجب إصلاح قاعدة البيانات.
              </p>
            ) : (
              <p className="text-green-600">✅ البيانات متناسقة</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataDiagnostic;