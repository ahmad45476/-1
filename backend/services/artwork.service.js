const Artwork = require("../models/Artwork.model");
const Artist = require("../models/Artist.model");
const User = require('../models/User.model');
const notificationService = require('./notification.service');

class ArtworkService {

  async createArtwork(artistId, artworkData) {
    const artist = await Artist.findById(artistId).populate('user', 'username');
    if (!artist) throw new Error("Artist not found");

    const artwork = new Artwork({
      ...artworkData,
      artist: artistId,
      owner: artistId,
      isForSale: artworkData.price > 0
    });

    const savedArtwork = await artwork.save();

    artist.artworks.push(savedArtwork._id);
    await artist.save();

    // ✅ إشعار للأدمن: عمل فني جديد
    await notificationService.createAdminNotification({
      type: 'new_artwork',
      title: '🎨 عمل فني جديد',
      message: `الفنان ${artist.user.username} أضاف "${savedArtwork.title}"`,
      relatedId: savedArtwork._id,
      relatedModel: 'Artwork'
    });

    return savedArtwork;
  }
  async rateArtwork(artworkId, userId, value) {
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) throw new Error('العمل الفني غير موجود');

    if (value < 1 || value > 5) throw new Error('التقييم يجب أن يكون بين 1 و 5');

    const existingRatingIndex = artwork.ratings.findIndex(
      r => r.user.toString() === userId.toString()
    );

    if (existingRatingIndex !== -1) {
      artwork.ratings[existingRatingIndex].value = value;
    } else {
      artwork.ratings.push({ user: userId, value });
    }

    await artwork.save();
    return artwork;
  }
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
  async addComment(artworkId, userId, text) {
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) throw new Error("Artwork not found");

    artwork.comments.push({ user: userId, text });
    return artwork.save();
  }
  async updateComment(artworkId, commentId, userId, newText) {
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) throw new Error("Artwork not found");

    const comment = artwork.comments.id(commentId);
    if (!comment) throw new Error("Comment not found");

    if (comment.user.toString() !== userId.toString()) {
      throw new Error("Unauthorized: You can only edit your own comments");
    }

    comment.text = newText;
    comment.edited = true;
    
    await artwork.save();
    return comment;
  }
  async deleteComment(artworkId, commentId, userId) {
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) throw new Error("Artwork not found");

    const comment = artwork.comments.id(commentId);
    if (!comment) throw new Error("Comment not found");

    if (comment.user.toString() !== userId.toString()) {
      throw new Error("Unauthorized: You can only delete your own comments");
    }

    comment.deleteOne();
    
    await artwork.save();
    return { message: "Comment deleted successfully" };
  }
  async getAllArtworks() {
  try {
    // ✅ أضف شرط filtering: فقط الأعمال النشطة (غير المحظورة)
    return await Artwork.find({ status: 'active' })  // ✅ أضف هذا الشرط
      .populate({
        path: 'artist',
        select: 'user bio followersCount ratingAverage',
        populate: { 
          path: 'user', 
          select: 'username profilePicture followingArtists' 
        }
      })
      .populate('owner', 'name user')
      .populate('comments.user', 'username profilePicture')
      .populate('ratings.user', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(20);
  } catch (error) {
    console.error("Error in getAllArtworks:", error);
    throw error;
  }
  }
  async getArtworkDetails(artworkId) {
  try {
    // ✅ جلب العمل الفني أولاً للتحقق من حالته
    const artwork = await Artwork.findById(artworkId);
    
    // ✅ إذا كان العمل محظوراً، لا ترجع تفاصيله
    if (!artwork || artwork.status === 'blocked') {
      throw new Error('هذا العمل الفني غير متاح حالياً');
    }
    
    return await Artwork.findById(artworkId)
      .populate({
        path: 'artist',
        select: 'user bio',
        populate: { path: 'user', select: 'username profilePicture' }
      })
      .populate({
        path: 'owner',
        select: 'user bio',
        populate: { path: 'user', select: 'username profilePicture' }
      })
      // ✅ أضف هذين السطرين المهمين:
      .populate({
        path: 'comments.user',
        select: 'username profilePicture'
      })
      .populate({
        path: 'ratings.user',
        select: 'username profilePicture'
      });
  } catch (error) {
    console.error("Error in getArtworkDetails:", error);
    throw error;
  }
  }
  async updateArtwork(artworkId, userId, updateData) {
    console.log("🚀 STARTING UPDATE PROCESS");
    console.log("Artwork ID:", artworkId);
    console.log("User ID:", userId);
    console.log("Update Data:", updateData);

    try {
        // 1. جلب الفنان من userId
        const artist = await Artist.findOne({ user: userId });
        
        if (!artist) {
            console.log("❌ Artist not found for user:", userId);
            throw new Error("Artist not found for this user");
        }

        console.log("✅ Artist found:", artist._id.toString());
        
        // 2. جلب العمل المطلوب
        const existingArtwork = await Artwork.findById(artworkId);
        if (!existingArtwork) {
            console.log("❌ Artwork not found:", artworkId);
            throw new Error("Artwork not found");
        }
        
        console.log("✅ Artwork found:", {
            id: existingArtwork._id.toString(),
            artist: existingArtwork.artist?.toString(),
            owner: existingArtwork.owner?.toString(),
            title: existingArtwork.title
        });

        // 3. التحقق: المالك الحالي فقط يمكنه التعديل
        if (!existingArtwork.owner) {
            console.log("❌ Artwork has no owner");
            throw new Error("Artwork has no owner");
        }

        if (existingArtwork.owner.toString() !== artist._id.toString()) {
            console.log("❌ Permission denied:", {
                artworkOwner: existingArtwork.owner.toString(),
                userArtistId: artist._id.toString()
            });
            throw new Error("You are not the current owner of this artwork");
        }

        console.log("✅ Permission granted");

        // 4. تحديث البيانات
        const updatedArtwork = await Artwork.findByIdAndUpdate(
            artworkId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate({
            path: 'artist',
            select: 'user bio',
            populate: { path: 'user', select: 'username profilePicture' }
        }).populate('owner', 'name');

        if (!updatedArtwork) {
            console.log("❌ Failed to update artwork");
            throw new Error("Failed to update artwork");
        }

        console.log("✅ Artwork updated successfully:", updatedArtwork._id);
        return updatedArtwork;

    } catch (error) {
        console.log("❌ ERROR in updateArtwork:", error.message);
        throw error;
    }
  }
  async deleteArtwork(artworkId, userId) {
    const artist = await Artist.findOne({ user: userId });
    
    if (!artist) {
      throw new Error("Artist not found");
    }

    const artwork = await Artwork.findOneAndDelete({
      _id: artworkId,
      owner: artist._id
    });

    if (!artwork) {
      throw new Error("Artwork not found or you are not the owner");
    }

    await Artist.findByIdAndUpdate(artwork.artist, { $pull: { artworks: artworkId } });

    return artwork;
  }
 async purchaseArtwork(artworkId, buyerUserId, transactionHash) {
    // البحث عن المشتري في جدول المستخدمين أولاً
    let buyer = await User.findById(buyerUserId);
    let ownerModel = 'User';  // ✅ افتراضياً المستخدم عادي
    
    // إذا لم يكن مستخدم عادي، ابحث في جدول الفنانين
    if (!buyer) {
        buyer = await Artist.findOne({ user: buyerUserId });
        ownerModel = 'Artist';  // ✅ تغيير النموذج إلى فنان
    }
    
    if (!buyer) throw new Error("Buyer not found");

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) throw new Error("Artwork not found");
    
    if (!artwork.isForSale) throw new Error("Artwork is not for sale");
    
    // التحقق من الملكية
    const ownerId = artwork.owner.toString();
    const buyerId = buyer._id.toString();
    
    if (ownerId === buyerId) {
        throw new Error("You already own this artwork");
    }

    // ✅ تحديث مالك العمل بشكل صحيح
    artwork.owner = buyer._id;
    artwork.ownerModel = ownerModel;  
    artwork.isForSale = false;
    artwork.transactionHash = transactionHash;
    artwork.soldAt = new Date();
    
    await artwork.save();
    
    return artwork;
  }
  async getUserPurchases(userId) {
    // ✅ البحث عن المشتريات بغض النظر عن نوع المالك
    const purchases = await Artwork.find({
      $or: [
        { owner: userId, ownerModel: 'User' },      // اشترى كمستخدم عادي
        { owner: userId, ownerModel: 'Artist' }     // اشترى كفنان (إذا كان فناناً)
      ],
      // استثناء الأعمال التي هو فنانها الأصلي (لم يشترها بل أنشأها)
      artist: { $ne: await this.getArtistIdByUserId(userId) }
    })
    .populate({
      path: 'artist',
      select: 'user bio',
      populate: { path: 'user', select: 'username profilePicture' }
    })
    .sort({ soldAt: -1, createdAt: -1 });
    
    return purchases;
  }
  async getArtistIdByUserId(userId) {
    const artist = await Artist.findOne({ user: userId });
    return artist ? artist._id : null;
  }
}

module.exports = new ArtworkService();