const artworkService = require('../services/artwork.service');
// ... الدوال الحالية

exports.createArtwork = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.user.artistProfile._id);
    
    
    // التأكد من أن المستخدم فنان
    if (req.user.role !== 'artist') {
      return res.status(403).json({ message: 'Only artists can create artworks' });
    }
    
    const artwork = await artworkService.createArtwork(req.user.artistProfile, req.body);
    res.status(201).json(artwork);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.log(error.massage);
    
  }
};

exports.toggleLikeArtwork = async (req, res) => {
  try {
    const artwork = await artworkService.toggleLikeArtwork(
      req.params.id,
      req.user.id
    );

    res.json({
      success: true,
      likes: artwork.likes,
      likesCount: artwork.likesCount // ✅ استخدم الحقل الافتراضي
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const artwork = await artworkService.addComment(req.params.id, req.user.id, text);
    res.json(artwork);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.rateArtwork  = async (req, res)=> {
    const { artworkId } = req.params;
      const {value } = req.body;
      const userId = req.user._id;
  
  try {
      

 console.log(value);
console.log(userId);
console.log(artworkId);


      const artwork = await artworkService.rateArtwork(artworkId, userId, value);
      
      res.status(200).json({
        message: 'تم إضافة التقييم بنجاح',
        count: artwork.ratings.length,
        rate:artwork.ratings,
        avrage:artwork.ratingAverage
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
   
   
   
    }
  }

// جلب جميع الأعمال الفنية
exports.getAllArtworks = async (req, res) => {
  try {
    const artworks = await artworkService.getAllArtworks();
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// جلب تفاصيل عمل فني
exports.getArtworkDetails = async (req, res) => {
  try {
    const artwork = await artworkService.getArtworkDetails(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// تعديل عمل فني
exports.updateArtwork = async (req, res) => {
  try {
    // التأكد من أن المستخدم فنان
    if (req.user.role !== 'artist') {
      return res.status(403).json({ message: 'Only artists can update artworks' });
    }
    
    const artwork = await artworkService.updateArtwork(
      req.params.id,
      req.user.artistProfile,
      req.body
    );
    
    res.json(artwork);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// حذف عمل فني
exports.deleteArtwork = async (req, res) => {
  try {
    // التأكد من أن المستخدم فنان
    if (req.user.role !== 'artist') {
      return res.status(403).json({ message: 'Only artists can delete artworks' });
    }
    
    const artwork = await artworkService.deleteArtwork(
      req.params.id,
      req.user.artistProfile
    );
    
    res.json({ message: 'Artwork deleted successfully', artwork });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// جلب الأعمال الفنية الخاصة بالفنان الحالي
exports.getMyArtworks = async (req, res) => {
  try {
    if (req.user.role !== 'artist') {
      return res.status(403).json({ message: 'Only artists can view their artworks' });
    }

    const artworks = await artworkService.getArtworksByArtist(req.user.artistProfile._id);

    res.json({
      success: true,
      data: artworks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// controllers/artworkController.js
exports.saveArtwork = async (req, res) => {
  try {
    const artworkId = req.params.id;
    const userId = req.user.id;

    // إضافة العمل للمحفوظات
    await User.findByIdAndUpdate(userId, {
      $addToSet: { savedArtworks: artworkId }
    });

    // إضافة المستخدم لقائمة محفظي العمل
    await Artwork.findByIdAndUpdate(artworkId, {
      $addToSet: { savedBy: userId }
    });

    // جلب العدد المحدث
    const artwork = await Artwork.findById(artworkId);
    const user = await User.findById(userId);

    res.json({
      success: true,
      message: 'تم حفظ العمل بنجاح',
      savesCount: artwork.savedBy.length,
      savedArtworksCount: user.savedArtworks.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الحفظ'
    });
  }
};

exports.unsaveArtwork = async (req, res) => {
  try {
    const artworkId = req.params.id;
    const userId = req.user.id;

    // إزالة العمل من المحفوظات
    await User.findByIdAndUpdate(userId, {
      $pull: { savedArtworks: artworkId }
    });

    // إزالة المستخدم من محفظي العمل
    await Artwork.findByIdAndUpdate(artworkId, {
      $pull: { savedBy: userId }
    });

    res.json({
      success: true,
      message: 'تم إزالة العمل من المحفوظات'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ'
    });
  }
};