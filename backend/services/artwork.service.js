const Artwork = require("../models/Artwork.model");
const Artist = require("../models/Artist.model")

class ArtworkService {
  // إنشاء عمل فني جديد
  async createArtwork(artistId, artworkData) {
    const artist = await Artist.findById(artistId);
    if (!artist) throw new Error("Artist not found");

    const artwork = new Artwork({
      ...artworkData,
      artist: artistId,
    });

    const savedArtwork = await artwork.save();

    // إضافة العمل الفني إلى ملف الفنان
    artist.artworks.push(savedArtwork._id);
    await artist.save();

    return savedArtwork;
  }

  // تقييم عمل فني
  async rateArtwork(artworkId, userId, value) {
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) throw new Error('العمل الفني غير موجود');

    // التحقق من صحة التقييم
    if (value < 1 || value > 5) throw new Error('التقييم يجب أن يكون بين 1 و 5');

    // البحث عن تقييم موجود للمستخدم
    const existingRatingIndex = artwork.ratings.findIndex(
      r => r.user.toString() === userId.toString()
    );

    if (existingRatingIndex !== -1) {
      // تحديث التقييم الموجود
      artwork.ratings[existingRatingIndex].value = value;
    } else {
      // إضافة تقييم جديد
      artwork.ratings.push({ user: userId, value });
    }

    await artwork.save();
    return artwork;
  }

  // تفعيل/إلغاء إعجاب العمل الفني
  async toggleLikeArtwork(artworkId, userId) {
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) throw new Error('Artwork not found');

    const likeIndex = artwork.likes.findIndex(like => like.equals(userId));

    if (likeIndex === -1) {
      artwork.likes.push(userId);
    } else {
      artwork.likes.splice(likeIndex, 1);
    }

    await artwork.save();
    return artwork;
  }

  // إضافة تعليق على العمل الفني
  async addComment(artworkId, userId, text) {
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) throw new Error("Artwork not found");

    artwork.comments.push({ user: userId, text });
    return artwork.save();
  }

  // جلب جميع الأعمال الفنية
  async getAllArtworks() {
    return Artwork.find()
     
  }

  // جلب تفاصيل عمل فني محدد
  async getArtworkDetails(id) {
    const artwork = await Artwork.findById(id)
      .populate({
        path: 'artist',
        select: 'user bio followersCount ratingAverage',
        populate: { path: 'user', select: 'username followingArtists' }
      })
      .populate('comments.user', 'username')
      .populate('ratings.user', 'username');

    return artwork;
  }


  // تعديل عمل فني
  async updateArtwork(artworkId, artistId, updateData) {
    const artwork = await Artwork.findOneAndUpdate(
      { _id: artworkId, artist: artistId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!artwork) throw new Error("Artwork not found or unauthorized");

    return artwork;
  }

  // حذف عمل فني
  async deleteArtwork(artworkId, artistId) {
    const artwork = await Artwork.findOneAndDelete({
      _id: artworkId,
      artist: artistId,
    });

    if (!artwork) throw new Error("Artwork not found or unauthorized");

    // إزالة العمل الفني من ملف الفنان
    await Artist.findByIdAndUpdate(artistId, { $pull: { artworks: artworkId } });

    return artwork;
  }
}

module.exports = new ArtworkService();