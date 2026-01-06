const express = require('express');
const router = express.Router();
const { adminAuth, requirePermission } = require('../middleware/adminAuth');
const adminArtworkController = require('../controllers/admin.artwork.controller');

// جميع routes تحتاج مصادقة أدمن
router.use(adminAuth);

// routes الأعمال الفنية
router.get('/', requirePermission('canViewArtworks'), adminArtworkController.getAllArtworks);
router.get('/stats', requirePermission('canViewArtworks'), adminArtworkController.getArtworksStats);
router.get('/:id', requirePermission('canViewArtworks'), adminArtworkController.getArtworkDetails);
router.put('/:id/status', requirePermission('canViewArtworks'), adminArtworkController.updateArtworkStatus);
router.delete('/:id', requirePermission('canViewArtworks'), adminArtworkController.deleteArtwork);

module.exports = router;