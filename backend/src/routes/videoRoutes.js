const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const videoController = require("../controllers/videoController");

/* ====================================================
   SUPERADMIN VIDEO MANAGEMENT
==================================================== */

// all premium topics with their video info
router.get(
  "/videos/premium-topics",
  verifyToken,
  requireRole("superadmin"),
  videoController.getPremiumTopicsWithVideos
);

// get video info for one premium topic
router.get(
  "/videos/topic/:topicId",
  verifyToken,
  requireRole("superadmin"),
  videoController.getVideosByTopicId
);

// upload video file for one premium topic
router.post(
  "/videos/upload",
  verifyToken,
  requireRole("superadmin"),
  videoController.uploadVideoMiddleware,
  videoController.uploadVideoForPremiumTopic
);

// delete uploaded video from one premium topic
router.delete(
  "/videos/topic/:topicId",
  verifyToken,
  requireRole("superadmin"),
  videoController.deleteVideoFromPremiumTopic
);

/* ====================================================
   STUDENT VIDEO COMPLETION
==================================================== */

router.post(
  "/topics/:topicId/video-complete",
  verifyToken,
  videoController.markVideoComplete
);

module.exports = router;