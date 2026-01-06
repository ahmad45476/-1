const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const userController = require('../controllers/user.controller');
// متابعة/إلغاء متابعة مستخدم
router.post('/follow/:id', authenticate, userController.toggleFollowUser);
router.post("/artworks/:id/save", authenticate, userController.toggleSaveArtwork);
router.get("/saved-artworks", authenticate, userController.getSavedArtworks);

// جلب متابعين المستخدم الحالي
router.get("/me/followers", authenticate, userController.getUserFollowers);

// جلب من يتابعهم المستخدم الحالي
router.get("/me/following", authenticate, userController.getUserFollowing);

router.get("/artworks", authenticate, userController.getUsersBatch);
router.post("/batch", authenticate, userController.getUsersBatch);

router.get('/:id', userController.getUserById); 


module.exports = router;
