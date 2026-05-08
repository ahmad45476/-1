// routes/artist.routes.js
const express = require("express");
const router = express.Router();
const artistController = require("../controllers/artist.controller");
const uploadMiddleware = require('../utils/upload');
const { authenticate } = require('../middleware/auth');

router.put("/:artistId", uploadMiddleware,
artistController.updateArtistProfile);

router.get("/getArtist", artistController.getAllArtists);
router.put("/:artistId/bio", artistController.updateArtistProfile);
router.post("/:artistId/follow", authenticate, artistController.toggleFollowArtist);
router.get("/:artistId/MyWork",artistController.getMyArtworks)

router.get("/:artistId", artistController.getArtistById);


module.exports = router;