import React, { createContext, useState, useEffect } from 'react';

export const ArtworkContext = createContext();

export const ArtworkProvider = ({ children }) => {
  const [artworks, setArtworks] = useState({});

  useEffect(() => {
    const initialArtworks = {
      1: {
        id: 1,
        title: "لوحة زيتية",
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5",
        description: "وصف اللوحة الزيتية...",
        category: "رسم زيتي",
        likes: 120,
        isLiked: false,
        comments: [
          { id: 1, user: 'محمد', text: 'عمل رائع!', time: 'منذ ساعتين' },
          { id: 2, user: 'ليلى', text: 'ألوان جميلة جدًا', time: 'منذ يوم' }
        ],
        ratings: [4, 5, 3, 4],
        averageRating: 4.0,
        artist: {
          name: "فنان 1",
          image: "https://randomuser.me/api/portraits/men/1.jpg"
        },
        createdAt: new Date().toISOString()
      },
      2: {
        id: 2,
        title: "تصوير فوتوغرافي",
        image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e",
        description: "وصف الصورة الفوتوغرافية...",
        category: "تصوير",
        likes: 90,
        isLiked: false,
        comments: [
          { id: 1, user: 'علي', text: 'جميل جدًا!', time: 'منذ يومين' }
        ],
        ratings: [5, 4],
        averageRating: 4.5,
        artist: {
          name: "فنان 2",
          image: "https://randomuser.me/api/portraits/women/2.jpg"
        },
        createdAt: new Date().toISOString()
      }
    };
    setArtworks(initialArtworks);
  }, []);

  const updateLikeStatus = (artworkId, isLiked) => {
    setArtworks(prev => {
      const currentLikes = prev[artworkId]?.likes || 0;
      const newLikes = isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

      return {
        ...prev,
        [artworkId]: {
          ...prev[artworkId],
          isLiked,
          likes: newLikes
        }
      };
    });
  };

  const updateArtworkRating = (artworkId, newRating) => {
    setArtworks(prev => {
      const oldRatings = prev[artworkId]?.ratings || [];
      const updatedRatings = [...oldRatings, newRating];
      const avg = updatedRatings.reduce((a, b) => a + b, 0) / updatedRatings.length;

      return {
        ...prev,
        [artworkId]: {
          ...prev[artworkId],
          ratings: updatedRatings,
          averageRating: avg
        }
      };
    });
  };

  const addArtworkComment = (artworkId, commentText) => {
    setArtworks(prev => {
      const oldComments = prev[artworkId]?.comments || [];
      const newComment = {
        id: Date.now(),
        user: 'أنت',
        text: commentText,
        time: 'الآن',
      };
      return {
        ...prev,
        [artworkId]: {
          ...prev[artworkId],
          comments: [newComment, ...oldComments],
        }
      };
    });
  };

  return (
    <ArtworkContext.Provider value={{
      artworks,
      updateLikeStatus,
      updateArtworkRating,
      addArtworkComment
    }}>
      {children}
    </ArtworkContext.Provider>
  );
};
