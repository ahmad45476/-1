const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const uploadMiddleware = require('../utils/upload');
const userController = require('../controllers/user.controller');

// ✅ استخدم uploadMiddleware.fields() للسماح بحقول متعددة
router.put('/:id', authenticate, uploadMiddleware, userController.updateUserProfile);

// باقي المسارات...
router.post("/artworks/:id/save", authenticate, userController.toggleSaveArtwork);
router.get("/saved-artworks", authenticate, userController.getSavedArtworks);
router.post('/follow/:targetType/:targetId', authenticate, userController.toggleFollow);
router.get('/:userId/following-artists', userController.getFollowing);
router.get('/:userId/followers-artists', userController.getFollowers);
router.get('/:id', userController.getUserById);

module.exports = router;