const Artist = require('../models/Artist.model');
const User = require('../models/User.model');
const Artwork=require('../models/Artwork.model');
const { default: mongoose } = require('mongoose');
class ArtistService {
  // ... الدوال الحالية
  
  // متابعة فنان
  async followArtist(artistId, userId) {
    // إضافة الفنان إلى قائمة متابعة المستخدم
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { followingArtists: artistId } }
    );
    
    // إضافة المستخدم إلى متابعي الفنان
    const artist = await Artist.findByIdAndUpdate(
      artistId,
      { $addToSet: { followers: userId } },
      { new: true }
    )
    .populate('user', 'username email profilePicture');
    
    return artist;
  }

  // إلغاء متابعة فنان
  async unfollowArtist(artistId, userId) {
    // إزالة الفنان من قائمة متابعة المستخدم
    await User.findByIdAndUpdate(
      userId,
      { $pull: { followingArtists: artistId } }
    );
    
    // إزالة المستخدم من متابعي الفنان
    const artist = await Artist.findByIdAndUpdate(
      artistId,
      { $pull: { followers: userId } },
      { new: true }
    )
    .populate('user', 'username email profilePicture');
    
    return artist;
  }

  // تقييم فنان
  async rateArtist(artistId, userId, ratingValue) {
    const artist = await Artist.findById(artistId);
    
    // إزالة التقييم القديم إذا كان موجوداً
    artist.ratings = artist.ratings.filter(r => !r.user.equals(userId));
    
    // إضافة التقييم الجديد
    artist.ratings.push({
      user: userId,
      value: ratingValue
    });
    
    await artist.save();
    return artist;
  }

  async updateArtistProfile(artistId, userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("غير مصرح لك");
      }

      const artist = await Artist.findOneAndUpdate( {_id: artistId },
          updateData,
          { new: true, runValidators: true });
    if (!artist) throw new Error("الفنان غير موجود");
    if(updateData.imageUrl)
    {user.profilePicture=updateData.imageUrl
      await user.save();}
      await artist.save();
      if(updateData.imageUrl && updateData.bio)
         res.status(200).json({ message: "تم تحديث الصورة الشخصية والوصف بنجاح", artist });
      return artist;
    }
    
    async myArtworks(artistId){
      const works= await Artwork.find({artist:artistId})
      return works;
       
    }
   
async getAllArtists() {
  try {
    const artists = await Artist.find()
      .populate({
        path: "user",
        select: "profilePicture username name followingArtists" // 🔥 أضف followingArtists هنا
      })
      .populate({
        path: "followers",
        select: "_id username" // 🔥 جلب followers أيضًا
      })
      .lean();

    console.log(`🎨 Found ${artists?.length || 0} artists`);

    // 🔥 **الحل الصحيح**: احسب مباشرة من بيانات الفنان
    const result = artists.map(artist => {
      // 1. حساب followersCount من followers array
      const followersCount = artist.followers?.length || 0;
      
      // 2. حساب followingArtistsCount من user.followingArtists
      let followingArtistsCount = 0;
      
      if (artist.user && artist.user.followingArtists) {
        // تأكد أن followingArtists مصفوفة
        if (Array.isArray(artist.user.followingArtists)) {
          followingArtistsCount = artist.user.followingArtists.length;
        }
        // إذا كانت string (مفردة)
        else if (artist.user.followingArtists) {
          followingArtistsCount = 1;
        }
      }
      
      console.log('🔍 Artist counts:', {
        artistId: artist._id,
        username: artist.user?.username,
        followersCount: followersCount,
        followingArtistsCount: followingArtistsCount,
        followersArray: artist.followers?.length,
        followingArtistsArray: artist.user?.followingArtists
      });

      return {
        ...artist,
        followersCount: followersCount,
        followingCount: artist.following?.length || 0,
        artworksCount: artist.artworks?.length || 0,
        user: artist.user ? {
          ...artist.user,
          followingArtistsCount: followingArtistsCount,
          // 🔥 إضافة followersCount و followingCount للمستخدم أيضًا
          followersCount: artist.user.followers?.length || 0,
          followingCount: artist.user.following?.length || 0
        } : null
      };
    });

    return result;

  } catch (error) {
    console.error("❌ Error in getAllArtists:", error.message);
    return [];
  }
}

}



module.exports = new ArtistService();