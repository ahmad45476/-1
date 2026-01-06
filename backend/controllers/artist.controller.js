const mongoose = require('mongoose');
const Artist = require("../models/Artist.model");
const User = require("../models/User.model");
const artistService = require("../services/artist.service");

// في controllers/artist.controller.js - دالة toggleFollowArtist
exports.toggleFollowArtist = async (req, res) => {
  try {
    const artistId = req.params.id || req.params.artistId;
    const userId = req.user?.id;

    // تحقق من المستخدم
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود"
      });
    }

    // تحقق من الفنان
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "الفنان غير موجود"
      });
    }

    // التحقق من المتابعة الحالية
    const isCurrentlyFollowing = user.followingArtists?.includes(artistId) || false;
    
    console.log('📊 Follow state:', {
      user: user.username,
      artist: artist.user?.username,
      isCurrentlyFollowing,
      userFollowingArtists: user.followingArtists?.length,
      artistFollowers: artist.followers?.length
    });

    let updateResult;
    
    if (isCurrentlyFollowing) {
      // إلغاء المتابعة
      // 1. إزالة الفنان من قائمة متابعة المستخدم
      user.followingArtists = user.followingArtists.filter(id => 
        id.toString() !== artistId.toString()
      );
      await user.save();
      
      // 2. إزالة المستخدم من متابعي الفنان
      artist.followers = artist.followers.filter(id => 
        id.toString() !== userId.toString()
      );
      await artist.save();
      
      console.log('✅ Unfollowed successfully');
      
    } else {
      // متابعة
      // 1. إضافة الفنان إلى قائمة متابعة المستخدم
      if (!user.followingArtists.includes(artistId)) {
        user.followingArtists.push(artistId);
        await user.save();
      }
      
      // 2. إضافة المستخدم إلى متابعي الفنان
      if (!artist.followers.includes(userId)) {
        artist.followers.push(userId);
        await artist.save();
      }
      
      console.log('✅ Followed successfully');
    }

    // جلب البيانات المحدثة
    const updatedUser = await User.findById(userId);
    const updatedArtist = await Artist.findById(artistId);
    
    const isNowFollowing = updatedUser.followingArtists?.includes(artistId) || false;

    res.json({
      success: true,
      isFollowing: isNowFollowing,
      message: isCurrentlyFollowing ? "تم إلغاء المتابعة" : "تمت المتابعة",
      data: {
        followersCount: updatedArtist.followers.length,
        followingCount: updatedUser.followingArtists.length,
        artistId: updatedArtist._id,
        userId: updatedUser._id
      }
    });

  } catch (err) {
    console.error('❌ toggleFollowArtist error:', err);
    res.status(500).json({
      success: false,
      message: "خطأ في الخادم",
      error: err.message
    });
  }
};

exports.getArtistWithDetails = async (req, res) => {
  try {
    const artistId = req.params.artistId;
    
    const artist = await Artist.findById(artistId)
      .populate({
        path: 'followers',
        select: '_id username name profilePicture email bio',
        model: 'User'
      })
      .populate({
        path: 'following',
        select: '_id username name profilePicture email bio',
        model: 'Artist'
      })
      .populate({
        path: 'artworks',
        select: '_id title imageUrl description likes comments createdAt',
        populate: {
          path: 'artist',
          select: '_id username name profilePicture'
        }
      });
    
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'الفنان غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      artist: artist
    });
    
  } catch (error) {
    console.error('❌ Error in getArtistWithDetails:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};


exports.unfollowArtist = async (req, res) => {
  try {
    const artist = await artistService.unfollowArtist(req.params.artistId, req.user.id);

    res.json({
      success: true,
      message: "Artist unfollowed successfully",
      data: artist,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// تقييم فنان
exports.rateArtist = async (req, res) => {
  try {
    const { rating } = req.body;
    const artist = await artistService.rateArtist(req.params.artistId, req.user.id, rating);

    res.json({
      success: true,
      message: "Artist rated successfully",
      data: artist,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// تحديث ملف الفنان
exports.updateArtistProfile = async (req, res) => {
  try {
    const { artistId } = req.params;
    const updateData = req.body;
    const userId = req.body.userId;

    const artist = await artistService.updateArtistProfile(artistId, userId, updateData);

    res.status(200).json({
      message: "تم تحديث الملف الشخصي بنجاح",
      artist,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// جلب أعمال الفنان الخاصة
exports.getMyArtworks = async (req, res) => {
  try {
    const { artistId } = req.params;
    const artistWorks = await artistService.myArtworks(artistId);

    res.status(201).json({
      message: "الأعمال الموجودة",
      artistWorks,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// جلب كل الفنانين
exports.getAllArtists = async (req, res) => {
  try {
    const artists = await artistService.getAllArtists();
    res.json({
      success: true,
      data: artists  || [],
    });
  } catch (error) {
    console.error("Error in getAllArtists controller:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// جلب الأعمال المحفوظة للمستخدم
exports.getSavedArtworks = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate({
        path: 'savedArtworks',
        populate: {
          path: 'artist',
          select: 'username profilePicture'
        }
      });

    res.json({
      success: true,
      artworks: user.savedArtworks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب المحفوظات'
    });
  }
};


// إضافة دالة جديدة لجلب المتابعين فقط
exports.getArtistFollowers = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.artistId)
      .populate({
        path: "followers",
        select: "username name profilePicture email bio"
      })
      .select("followers");
      
    if (!artist) {
      return res.status(404).json({ 
        success: false, 
        message: "Artist not found" 
      });
    }
    
    res.json({
      success: true,
      followers: artist.followers || []
    });
  } catch (error) {
    console.error('Error fetching artist followers:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// إضافة دالة جديدة لجلب المتابَعين فقط
exports.getArtistFollowing = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.artistId)
      .populate({
        path: "following",
        select: "username name profilePicture email bio"
      })
      .select("following");
      
    if (!artist) {
      return res.status(404).json({ 
        success: false, 
        message: "Artist not found" 
      });
    }
    
    res.json({
      success: true,
      following: artist.following || []
    });
  } catch (error) {
    console.error('Error fetching artist following:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

exports.getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.artistId)
      .populate({
        path: "followers",
        select: "username name profilePicture email" // الحقول المطلوبة
      })
      .populate({
        path: "following",
        select: "username name profilePicture email"
      })
      .populate({
        path: "artworks",
        select: "title imageUrl likes comments createdAt"
      });
      
    if (!artist) return res.status(404).json({ 
      success: false, 
      message: "Artist not found" 
    });
    
    res.json({ 
      success: true, 
      artist 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};
// دالة إصلاح قاعدة البيانات
exports.fixDatabase = async (req, res) => {
  try {
    console.log('🔧 === FIXING DATABASE ===');
    
    // 1. أصلح كل الفنانين
    const artists = await Artist.find({});
    console.log(`📊 Found ${artists.length} artists`);
    
    let fixedArtists = 0;
    
    for (const artist of artists) {
      // تأكد أن followers مصفوفة
      if (!artist.followers || !Array.isArray(artist.followers)) {
        artist.followers = [];
        await artist.save();
        fixedArtists++;
        console.log(`✅ Fixed artist: ${artist._id}`);
      }
    }
    
    // 2. أصلح المستخدم الحالي
    const currentUser = await User.findById("68beece8586268ef3f863b21");
    if (currentUser) {
      if (!currentUser.followingArtists || !Array.isArray(currentUser.followingArtists)) {
        currentUser.followingArtists = [];
        await currentUser.save();
        console.log(`✅ Fixed user: ${currentUser.username}`);
      }
    }
    
    console.log('🔧 === DATABASE FIXED ===');
    
    res.json({
      success: true,
      message: `تم إصلاح ${fixedArtists} فنان والمستخدم الحالي`,
      artistsFixed: fixedArtists,
      userFixed: !!currentUser
    });
    
  } catch (error) {
    console.error('❌ Fix error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// دالة إضافة بيانات اختبارية مباشرة
exports.addTestData = async (req, res) => {
  try {
    const { artistId } = req.params;
    const userId = req.user.id;
    
    console.log('🎯 Adding test data:', { artistId, userId });
    
    // 1. أضف المستخدم إلى followers الفنان
    const artistUpdate = await Artist.findByIdAndUpdate(
      artistId,
      { 
        $addToSet: { followers: userId },
        $inc: { followersCount: 1 }
      },
      { new: true }
    );
    
    // 2. أضف الفنان إلى followingArtists المستخدم
    const userUpdate = await User.findByIdAndUpdate(
      userId,
      { 
        $addToSet: { followingArtists: artistId },
        $inc: { followingCount: 1 }
      },
      { new: true }
    );
    
    console.log('✅ Test data added:', {
      artistFollowers: artistUpdate.followers.length,
      userFollowing: userUpdate.followingArtists.length
    });
    
    res.json({
      success: true,
      message: "تمت إضافة بيانات الاختبار",
      data: {
        artist: {
          id: artistUpdate._id,
          followersCount: artistUpdate.followers.length,
          followers: artistUpdate.followers
        },
        user: {
          id: userUpdate._id,
          followingCount: userUpdate.followingArtists.length,
          followingArtists: userUpdate.followingArtists
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Add test data error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// دالة لجلب إحصائيات الفنان
exports.getArtistStats = async (req, res) => {
  try {
    const artistId = req.params.artistId;
    const userId = req.user?.id;
    
    const artist = await Artist.findById(artistId)
      .populate('user', 'username name')
      .populate('followers', 'username name');
    
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "الفنان غير موجود"
      });
    }
    
    // حساب الإحصائيات
    const isFollowing = userId ? 
      artist.followers.some(f => f._id.toString() === userId.toString()) : 
      false;
    
    res.json({
      success: true,
      data: {
        artistId: artist._id,
        name: artist.user?.name || artist.username,
        followersCount: artist.followers.length,
        followingCount: artist.following?.length || 0,
        artworksCount: artist.artworks?.length || 0,
        isFollowing,
        totalFollowers: artist.followers.length,
        // للمستخدم الحالي فقط
        userIsFollowing: isFollowing
      }
    });
    
  } catch (error) {
    console.error('Artist stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

