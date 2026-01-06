const express = require('express');
const router = express.Router();
const artworkController = require('../controllers/artwork.controller');
const { authenticate, authorize } = require('../middleware/auth');
const uploadMiddleware = require('../utils/upload'); // استيراد middleware واحد

// Public routes
router.get('/', artworkController.getAllArtworks);
router.get('/:id', artworkController.getArtworkDetails);

// Protected routes
router.use(authenticate);

// Artwork creation requires artist role
router.post('/', 
  authorize('artist'), 
  uploadMiddleware, // استخدام middleware واحد فقط
  artworkController.createArtwork
);

// Artwork update and delete
router.put('/:id', 
  authorize('artist'), 
  artworkController.updateArtwork
);

router.delete('/:id', 
  authorize('artist'), 
  artworkController.deleteArtwork
);

// Interactions
router.post('/:id/like', artworkController.toggleLikeArtwork);
router.post('/:id/comment', artworkController.addComment);
router.post('/:artworkId/rate', artworkController.rateArtwork);
module.exports = router;