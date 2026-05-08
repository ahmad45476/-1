const Artist = require("../models/Artist.model");
const User = require("../models/User.model");

class ArtistService {
  
  async toggleFollowArtistLogic(userId, artistId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("المستخدم غير موجود");

    const artist = await Artist.findById(artistId);
    if (!artist) throw new Error("الفنان غير موجود");

    const isCurrentlyFollowing = user.followingArtists?.includes(artistId) || false;
    
    if (isCurrentlyFollowing) {
      user.followingArtists = user.followingArtists.filter(id => 
        id.toString() !== artistId.toString()
      );
      await user.save();

      artist.followers = artist.followers.filter(id => 
        id.toString() !== userId.toString()
      );
      await artist.save();
    } else {
      if (!user.followingArtists.includes(artistId)) {
        user.followingArtists.push(artistId);
        await user.save();
      }

      if (!artist.followers.includes(userId)) {
        artist.followers.push(userId);
        await artist.save();
      }
    }

    const updatedUser = await User.findById(userId);
    const updatedArtist = await Artist.findById(artistId);
    
    const isNowFollowing = updatedUser.followingArtists?.includes(artistId) || false;

    return {
      isFollowing: isNowFollowing,
      message: isCurrentlyFollowing ? "تم إلغاء المتابعة" : "تمت المتابعة",
      data: {
        followersCount: updatedArtist.followers.length,
        followingCount: updatedUser.followingArtists.length,
        artistId: updatedArtist._id,
        userId: updatedUser._id
      }
    };
  }
  async updateArtistProfileLogic(artistId, userId, updateData) {
    const artist = await Artist.findById(artistId);
    if (!artist) throw new Error("الفنان غير موجود");

    if (artist.user.toString() !== userId) {
      throw new Error("غير مصرح لك بتحديث هذا الملف");
    }

    Object.assign(artist, updateData);
    await artist.save();
    
    return artist;
  }
  async myArtworksLogic(artistId) {
    const artist = await Artist.findById(artistId).populate('artworks');
    if (!artist) throw new Error("الفنان غير موجود");
    return artist.artworks || [];
  }
  async getAllArtistsLogic() {
    const artists = await Artist.find()
      .populate('user', 'username email name profilePicture')
      .populate('followers', 'username name')
      .select('-__v');
    return artists;
  }
  async getArtistByIdLogic(artistId) {
    const artist = await Artist.findById(artistId)
      .populate({
        path: "followers",
        select: "username name profilePicture email"
      })
      .populate({
        path: "following",
        select: "username name profilePicture email"
      })
      .populate({
        path: "artworks",
        select: "title imageUrl likes comments createdAt"
      });
    
    if (!artist) throw new Error("Artist not found");
    return artist;
  }
}

module.exports = new ArtistService();