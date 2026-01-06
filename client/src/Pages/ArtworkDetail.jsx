import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, MessageSquare, Bookmark, Share2, Edit, Trash2, X } from 'react-feather';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { interactionService } from '../Components/apiService';
import axios from 'axios';

const ArtworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {currentUser}=useAuth()
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const isOwner = artwork && currentUser?.id === artwork.artist.user.id;
  const comments = artwork?.comments || [];
  const[likeCount,setLikeCount]=useState(0)
  const[commentCount,setCommentCount]=useState(0)
  const[savesCount,setSavesCount]=useState(0)
  let postComment=0;
  const [checkLike,setChickLike]=useState(true)
  const [checkRating,setChickRating]=useState(true)
let check = true;

        useEffect(() => {
    console.log("ID from useParams:", id); // ✅ هنا في مكانه الصحيح
    const fetchArtwork = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/artworks/${id}`);
        console.log(response.data);
        setArtwork(response.data)
        setCommentCount(response.data.commentsCount)
        setLikeCount(response.data.likesCount)
        setSavesCount(response.data.savesCount || response.data.savedBy?.length || 0)
        console.log(response.data.likes);
        console.log(currentUser);
        console.log(response.data);
        
        
        response.data.likes.map(id=>{
     if(id===currentUser.id){
       setLiked(true)
     }
   })
   
   // تحقق إذا كان العمل محفوظاً
   if (response.data.savedBy && currentUser) {
     const isSaved = response.data.savedBy.some(
       user => user._id === currentUser.id || user.id === currentUser.id
     );
     setSaved(isSaved);
   }
   
response.data.ratings.map(id=>{
  console.log(id);
     
  if(id.user===currentUser.id){
      setUserRating(id.value)
     }
   })

          
      } catch (error) {
        console.error('Error fetching artwork:', error);
      } finally {
        if(artwork){
        setLoading(false);}
      }
    };
fetchArtwork();


console.log(userRating);
   console.log(artwork);
 

   },[!artwork, ]);

  const handleLike = async () => {
    try {
     const response = await axios.post(`http://localhost:5000/api/artworks/${artwork.id}/like`);

      setLikeCount(response.data.likesCount)
      
        console.log(response.data);
      
      
      setLiked(!liked);
      const likesResponse = await interactionService.getLikesCount(id);
      setArtwork(prev => ({ ...prev, likes: likesResponse.data.count }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  // حفظ العمل
  const handleSave = async () => {
    if (!currentUser) {
      alert('يجب تسجيل الدخول لحفظ الأعمال');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/artworks/${artwork.id}/save`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSaved(true);
        setSavesCount(prev => prev + 1);
        alert('تم حفظ العمل بنجاح');
      }
    } catch (error) {
      console.error('Error saving artwork:', error);
      if (error.response?.status === 401) {
        alert('انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى');
        window.location.href = '/login';
      } else {
        alert(error.response?.data?.message || 'حدث خطأ في الحفظ');
      }
    }
  };

  // إزالة من المحفوظات
  const handleUnsave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:5000/api/artworks/${artwork.id}/save`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSaved(false);
        setSavesCount(prev => prev - 1);
        alert('تم إزالة العمل من المحفوظات');
      }
    } catch (error) {
      console.error('Error unsaving artwork:', error);
      alert(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleRating = async (rating) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/artworks/${artwork.id}/rate`,{
        value:rating
      });
      console.log(response.data);
      setUserRating(rating);
      setArtwork(prev => ({
        ...prev,
        ratingAverage: response.data.avrage,
        ratings:response.data.rate
      }));
      console.log(artwork);
      
    } catch (error) {
      console.error('Error adding rating:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim()) {
      try {
        const response = await axios.post(`http://localhost:5000/api/artworks/${artwork.id}/comment`,{
          text:comment
        });
        setArtwork(prev=>({
          ...prev,
          comments:response.data.comments
        }))
        console.log(artwork);
        console.log(response.data);
        
        
        setComment('');
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('هل أنت متأكد من حذف هذا العمل؟')) {
      setIsDeleting(true);
      try {
        await fetch(`http://localhost:5002/api/posts/${id}`, { method: 'DELETE' });
        navigate('/profile');
      } catch (error) {
        console.error('Error deleting artwork:', error);
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#d5006d] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="text-center py-10 text-gray-500">
        لا يوجد عمل فني بهذا المعرف
      </div>
    );
  }

  return (
    <div className='w-full'>
      <img src={`http://localhost:5000${artwork.imageUrl}`} className=' fixed w-full h-screen z-0 opacity-60 blur-xl'/>
    <div className="container mx-auto px-4 py-8 max-w-4xl z-20 relative">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">

        {/* رأس البطاقة */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={artwork.artist?.image || '/default-avatar.jpg'}
                alt={artwork.artist?.user.username || 'فنان'}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{artwork.artist?.user.username || 'فنان غير معروف'}</p>
                <p className="text-xs text-gray-500">{artwork.category || 'بدون تصنيف'}</p>
              </div>
            </div>

            {isOwner && (
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigate(`/edit-artwork/${id}`)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg flex items-center hover:bg-blue-600 transition"
                >
                  <Edit size={16} className="ml-1" />
                  تعديل
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg flex items-center hover:bg-red-600 transition disabled:opacity-50"
                >
                  <Trash2 size={16} className="ml-1" />
                  {isDeleting ? 'جاري الحذف...' : 'حذف'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* صورة العمل الفني */}
        <img
          src={`http://localhost:5000${artwork.imageUrl}`}
          alt={artwork.title}
          className="w-auto h-auto object-contain bg-gray-100"
          onError={(e) => {
            e.target.src = '/default-artwork.jpg';
          }}
        />

        {/* المحتوى */}
        <div className="p-4">
          {/* التفاعلات */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4">
              <button 
                onClick={handleLike} 
                className="flex items-center space-x-1 hover:text-[#d5006d] transition"
              >
                {liked ? (
                  <Heart className="text-[#d5006d] fill-[#d5006d]" size={18} />
                ) : (
                  <Heart size={18} />
                )}
                <span>{likeCount}</span>
              </button>
              <div className="flex items-center space-x-1">
                <MessageSquare size={18} />
                <span>{comments.length}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={saved ? handleUnsave : handleSave}
                className="flex items-center space-x-1 hover:text-[#d5006d] transition"
              >
                <Bookmark 
                  size={18} 
                  className={saved ? 'text-[#d5006d] fill-[#d5006d]' : ''} 
                />
                <span>{savesCount}</span>
              </button>
              <Share2 size={18} className="hover:text-[#d5006d] cursor-pointer" />
            </div>
          </div>

          {/* معلومات العمل */}
          <div className="mb-6">
            <h2 className="font-bold text-xl mb-2">{artwork.title}</h2>
            <p className="text-gray-700 mb-3">{artwork.description}</p>
            <p className="text-xs text-gray-500">
              تم النشر في {new Date(artwork.createdAt).toLocaleDateString('en-uk')}
            </p>
          </div>

          {/* التقييمات */}
          <div className="mb-6 border-t pt-4">
            <h4 className="text-lg font-medium mb-2">تقييم العمل الفني</h4>
            <div className="flex items-center">
              <div className="flex mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRating(star)}
                    disabled={userRating > 0}
                    className="focus:outline-none"
                  >
                    <Star
                      size={24}
                      className={
                        star <= (hoverRating || userRating || Math.floor(artwork.averageRating || 0))
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  </motion.button>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {(artwork.ratingAverage || 0).toFixed(1)} من 5
                </p>
                <p className="text-xs text-gray-500">
                  ({artwork.ratings?.length || 0} تقييمات)
                </p>
              </div>
            </div>
          </div>

          {/* التعليقات */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">التعليقات ({comments.length})</h3>
            
            <form onSubmit={handleCommentSubmit} className="mb-4 flex">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="أضف تعليقًا..."
                className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d5006d] focus:border-transparent"
                required
              />
              <button 
                type="submit" 
                className="bg-[#d5006d] text-white px-4 py-2 rounded-r-lg hover:bg-[#b0005a] transition"
              >
                نشر
              </button>
            </form>

            
              <div className="space-y-3">
                {artwork.comments.map((comment) => (
                  
                  <div key={comment.id} className="flex space-x-3">
                    <img
                      src={'/default-avatar.jpg'}
                      alt={comment.user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="bg-gray-100 p-3 rounded-lg flex-1">
                      <p className="font-medium">{comment.user.username}</p>
                      <p className="text-gray-700">{comment.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleString('en-uk')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
         {artwork.commentsCount > 0 ?    (<></>) : (
              <p className="text-center text-gray-500 py-4">لا توجد تعليقات حتى الآن</p>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ArtworkDetail;