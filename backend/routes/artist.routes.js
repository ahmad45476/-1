// routes/artist.routes.js
const express = require("express");
const router = express.Router();
const artistController = require("../controllers/artist.controller");
const uploadMiddleware = require('../utils/upload');
const { authenticate } = require('../middleware/auth');

router.put("/:artistId", uploadMiddleware,
artistController.updateArtistProfile);

router.get("/getArtist", artistController.getAllArtists);

router.get('/:artistId/details', authenticate, artistController.getArtistWithDetails);

router.put("/:artistId/bio", artistController.updateArtistProfile);

router.get("/:artistId/MyWork",artistController.getMyArtworks)

router.get("/:artistId", artistController.getArtistById);

router.post("/:artistId/follow", authenticate, artistController.toggleFollowArtist);

// جلب متابعين فنان
router.get("/:artistId/followers", artistController.getArtistFollowers);

// جلب الفنانين اللي يتابعهم هذا الفنان
router.get("/:artistId/following", artistController.getArtistFollowing);


router.get('/fix/database', artistController.fixDatabase);
router.post('/:artistId/add-test-data', authenticate, artistController.addTestData);
router.get('/:artistId/stats', authenticate, artistController.getArtistStats);
module.exports = router;