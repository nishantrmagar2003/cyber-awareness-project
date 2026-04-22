const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const organizationBadgeController = require("../controllers/organizationBadgeController");

/* ===============================
   SUPERADMIN BADGE STATS
=============================== */
router.get(
  "/stats",
  verifyToken,
  requireRole("superadmin"),
  organizationBadgeController.getBadgeStats
);

/* ===============================
   SUPERADMIN ORG BADGE CRUD
=============================== */
router.get(
  "/",
  verifyToken,
  requireRole("superadmin"),
  organizationBadgeController.getAllOrganizationBadges
);

router.post(
  "/",
  verifyToken,
  requireRole("superadmin"),
  organizationBadgeController.createOrganizationBadge
);

/* ===============================
   ORG STUDENT OWN BADGES
=============================== */
router.get(
  "/student/my-badges",
  verifyToken,
  requireRole("org_student"),
  organizationBadgeController.getMyOrganizationBadges
);
router.get(
    "/general-list",
    verifyToken,
    requireRole("superadmin"),
    organizationBadgeController.getGeneralBadgesList
  );

module.exports = router;