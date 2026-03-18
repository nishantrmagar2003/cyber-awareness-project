// src/routes/videoRoutes.js

const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const videoController = require("../controllers/videoController");

// Only logged-in students can mark video complete
router.post(
  "/topics/:topicId/video-complete",
  verifyToken,
  videoController.markVideoComplete
);

module.exports = router;