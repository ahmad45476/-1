import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Share2, Bookmark, Star, Eye } from 'react-feather';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ArtworkCard = ({ artwork, viewMode, isCurrentUser, onLike, onSave }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser } = useAuth();

  // تحميل البيانات الأولية - الإصدار المحسن
  useEffect(() => {
    console.log('🔄 ArtworkCard Effect - Artwork ID:', artwork._id);
    console.log('📊 Artwork Data:', {
      id: artwork._id,
      title: artwork.title,
      rawLikes: artwork.likes,
      likesType: typeof artwork.likes?.[0],
      likesLength: artwork.likes?.length,
      likesCount: artwork.likesCount,
      currentUser: currentUser?.id
    });
    
    // 1. حساب عدد الإعجابات - استخدم likesCount إذا موجود
    const calculatedLikeCount = artwork.likesCount || artwork.likes?.length || 0;
    console.log('👍 Like Count:', calculatedLikeCount);
    setLikeCount(calculatedLikeCount);
    
    // 2. حساب عدد التعليقات
    const calculatedCommentCount = artwork.commentsCount || artwork.comments?.length || 0;
    console.log('💬 Comment Count:', calculatedCommentCount);
    setCommentCount(calculatedCommentCount);
    
    // 3. التحقق إذا كان المستخدم الحالي أعجب بالعمل - النسخة المحسنة
    if (currentUser) {
      const likes = artwork.likes || [];
      let userLiked = false;
      
      if (likes.length > 0) {
        console.log('🔍 Checking likes for user:', currentUser.id);
        
        // إذا كانت likes مصفوفة من strings (IDs)
        if (typeof likes[0] === 'string') {
          console.log('📝 Likes are strings');
          userLiked = likes.some(like => {
            const match = like === currentUser.id;
            if (match) console.log('✅ Found matching string like:', like);
            return match;
          });
        }
        // إذا كانت likes مصفوفة من objects
        else if (likes[0] && typeof likes[0] === 'object') {
          console.log('📦 Likes are objects');
          userLiked = likes.some(like => {
            // تحقق من جميع الحقول الممكنة
            const likeId = like._id || like.id || like.user;
            const match = likeId === currentUser.id;
            if (match) {
              console.log('✅ Found matching object like:', {
                like,
                likeId,
                currentUserId: currentUser.id
              });
            }
            return match;
          });
        }
      } else {
        console.log('📭 No likes array or empty array');
      }
      
      console.log('🎯 Final isLiked:', userLiked);
      setIsLiked(userLiked);
    } else {
      console.log('👤 No current user');
      setIsLiked(false);
    }
    
    console.log('--- End ArtworkCard Effect ---\n');
  }, [artwork, currentUser]);

  // الحصول على عنوان الصورة
  const getImageUrl = () => {
    // جرب كل الاحتمالات
    const imageFields = ['imageUrl', 'image', 'picture', 'photo', 'url'];
    
    for (const field of imageFields) {
      if (artwork[field]) {
        const imageValue = artwork[field];
        
        // إذا كان رابط كامل
        if (typeof imageValue === 'string' && imageValue.startsWith('http')) {
          return imageValue;
        }
        
        // إذا كان يبدأ بـ /
        if (typeof imageValue === 'string' && imageValue.startsWith('/')) {
          return `http://localhost:5000${imageValue}`;
        }
        
        // إذا كان اسم ملف فقط
        if (typeof imageValue === 'string') {
          return `http://localhost:5000/uploads/${imageValue}`;
        }
      }
    }
    
    // إذا لم توجد صورة
    return '/default-artwork.png';
  };

  const imageUrl = getImageUrl();

  // معالجة الإعجاب - نسخة مبسطة
  const handleLike = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isProcessing) return;
    
    if (!currentUser) {
      alert('يجب تسجيل الدخول للإعجاب');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('جلسة الدخول منتهية');
        setIsProcessing(false);
        return;
      }
      
      const artworkId = artwork._id || artwork.id;
      console.log('🔄 Sending like request for artwork:', artworkId);
      
      const response = await axios.post(
        `http://localhost:5000/api/artworks/${artworkId}/like`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      console.log('✅ Like response:', response.data);
      
      if (response.data.success) {
        // تحديث الحالة المحلية
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        
        // تحديث عدد الإعجابات
        if (response.data.likesCount !== undefined) {
          setLikeCount(response.data.likesCount);
        } else if (response.data.likes !== undefined) {
          setLikeCount(response.data.likes);
        } else {
          setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
        }
        
        // إعلام المكون الأب
        if (onLike) {
          onLike(artworkId, newIsLiked);
        }
      }
      
    } catch (error) {
      console.error('❌ Like error:', error);
      
      // التراجع عن التغيير
      setIsLiked(prev => prev);
      
      // عرض رسالة خطأ
      if (error.response?.status === 401) {
        alert('يرجى تسجيل الدخول أولاً');
      } else {
        alert(error.response?.data?.message || 'حدث خطأ أثناء الإعجاب');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // معالجة الحفظ
  const handleSave = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!currentUser) {
      alert('يجب تسجيل الدخول للحفظ');
      return;
    }
    
    const newSaveStatus = !isSaved;
    setIsSaved(newSaveStatus);
    
    if (onSave) {
      onSave(artwork._id || artwork.id, newSaveStatus);
    }
  };

  // بيانات العمل الفني
  const artworkData = {
    id: artwork._id || artwork.id,
    title: artwork.title || 'بدون عنوان',
    description: artwork.description || 'لا يوجد وصف',
    category: artwork.category || 'غير مصنف',
    rating: artwork.rating || artwork.ratingAverage || 0,
    views: artwork.views || 0,
    createdAt: artwork.createdAt || new Date()
  };

  // عرض النجوم
  const renderStars = () => {
    if (!artworkData.rating || artworkData.rating === 0) return null;
    
    return (
      <div className="flex items-center mt-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < Math.floor(artworkData.rating) ? 
              'text-yellow-400 fill-yellow-400' : 
              'text-gray-300'
            }
          />
        ))}
        <span className="text-xs text-gray-500 mr-1">({artworkData.rating.toFixed(1)})</span>
      </div>
    );
  };

  // عرض Grid
  if (viewMode === 'grid') {
    return (
      <div className="relative group">
        {/* الرابط للصورة والعنوان فقط */}
        <Link 
          to={`/artwork/${artworkData.id}`}
          className="block"
        >
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition duration-300"
          >
            {/* الصورة */}
            <div className="relative h-64 bg-gray-100 overflow-hidden">
              <img
                src={imageUrl}
                alt={artworkData.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = '/default-artwork.png';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-white font-bold text-lg">{artworkData.title}</h3>
                <p className="text-white text-sm opacity-90">{artworkData.category}</p>
                {renderStars()}
              </div>
            </div>
            
            {/* العنوان والوصف (بدون أزرار) */}
            <div className="p-4">
              <p className="text-gray-700 text-sm line-clamp-2">
                {artworkData.description}
              </p>
            </div>
          </motion.div>
        </Link>
        
        {/* أزرار التفاعل - خارج الـ Link */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 flex justify-between items-center">
            {/* زر الإعجاب */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLike(e);
              }}
              disabled={isProcessing}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'text-[#d5006d] bg-[#d5006d]/10' 
                  : 'text-gray-600 hover:text-[#d5006d] hover:bg-gray-100'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={isLiked ? 'fill-[#d5006d]' : ''} size={18} />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>
            
            {/* التعليقات */}
            <div className="flex items-center space-x-2 text-gray-600 p-2">
              <MessageSquare size={18} />
              <span className="text-sm">{commentCount}</span>
            </div>
            
            {/* المشاهدات */}
            <div className="flex items-center space-x-2 text-gray-600 p-2">
              <Eye size={18} />
              <span className="text-sm">{artworkData.views}</span>
            </div>
            
            {/* الحفظ */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSave(e);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isSaved 
                  ? 'text-[#d5006d] bg-[#d5006d]/10' 
                  : 'text-gray-600 hover:text-[#d5006d] hover:bg-gray-100'
              }`}
            >
              <Bookmark className={isSaved ? 'fill-[#d5006d]' : ''} size={18} />
            </button>
            
            {/* المشاركة */}
            <button 
              className="p-2 text-gray-600 hover:text-[#d5006d] hover:bg-gray-100 rounded-lg transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(`${window.location.origin}/artwork/${artworkData.id}`);
                alert('تم نسخ رابط العمل إلى الحافظة');
              }}
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // عرض List
  return (
    <div className="relative">
      <Link 
        to={`/artwork/${artworkData.id}`}
        className="block"
      >
        <motion.div 
          whileHover={{ x: 5 }}
          className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-6 border border-gray-100 hover:shadow-lg transition duration-300"
        >
          {/* الصورة */}
          <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={artworkData.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/default-artwork.png';
              }}
            />
          </div>
          
          {/* المحتوى */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-xl mb-1">{artworkData.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{artworkData.category}</p>
                {renderStars()}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(artworkData.createdAt).toLocaleDateString('ar-SA')}
              </span>
            </div>
            
            <p className="text-gray-700 text-sm mb-4 line-clamp-2">
              {artworkData.description}
            </p>
            
            {/* إحصائيات (بدون أزرار) */}
            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center space-x-2">
                <Heart size={16} />
                <span className="text-sm">{likeCount} إعجاب</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MessageSquare size={16} />
                <span className="text-sm">{commentCount} تعليق</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Eye size={16} />
                <span className="text-sm">{artworkData.views} مشاهدة</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
      
      {/* أزرار الجانب - خارج الـ Link */}
      <div className="absolute top-6 right-6 flex space-x-2 z-10">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLike(e);
          }}
          disabled={isProcessing}
          className={`p-3 rounded-lg transition-colors ${
            isLiked 
              ? 'text-[#d5006d] bg-[#d5006d]/10' 
              : 'text-gray-600 hover:text-[#d5006d] hover:bg-gray-100'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Heart className={isLiked ? 'fill-[#d5006d]' : ''} size={20} />
        </button>
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSave(e);
          }}
          className={`p-3 rounded-lg transition-colors ${
            isSaved 
              ? 'text-[#d5006d] bg-[#d5006d]/10' 
              : 'text-gray-600 hover:text-[#d5006d] hover:bg-gray-100'
          }`}
        >
          <Bookmark className={isSaved ? 'fill-[#d5006d]' : ''} size={20} />
        </button>
        
        <button 
          className="p-3 text-gray-600 hover:text-[#d5006d] hover:bg-gray-100 rounded-lg transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard.writeText(`${window.location.origin}/artwork/${artworkData.id}`);
            alert('تم نسخ رابط العمل إلى الحافظة');
          }}
        >
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default ArtworkCard;