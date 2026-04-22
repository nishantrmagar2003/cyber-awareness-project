const express = require("express");
const router = express.Router();

const rewardController = require("../controllers/rewardController");
const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

/*
====================================================
STUDENT: GET OWN BADGES
GET /api/rewards/badges
====================================================
*/
router.get(
  "/badges",
  verifyToken,
  rewardController.getStudentBadges
);

/*
====================================================
SUPERADMIN: GET ALL BADGES
GET /api/rewards/admin/badges
====================================================
*/
router.get(
  "/admin/badges",
  verifyToken,
  requireRole("superadmin"),
  rewardController.getAdminBadges
);

/*
====================================================
SUPERADMIN: CREATE BADGE
POST /api/rewards/admin/badges
====================================================
*/
router.post(
  "/admin/badges",
  verifyToken,
  requireRole("superadmin"),
  rewardController.createBadge
);

/*
====================================================
SUPERADMIN: UPDATE BADGE
PUT /api/rewards/admin/badges/:badgeId
====================================================
*/
router.put(
  "/admin/badges/:badgeId",
  verifyToken,
  requireRole("superadmin"),
  rewardController.updateBadge
);

/*
====================================================
SUPERADMIN: DELETE BADGE
DELETE /api/rewards/admin/badges/:badgeId
====================================================
*/
router.delete(
  "/admin/badges/:badgeId",
  verifyToken,
  requireRole("superadmin"),
  rewardController.deleteBadge
);

module.exports = router;