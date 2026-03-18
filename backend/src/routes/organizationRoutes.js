const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const organizationController = require("../controllers/organizationController");

// ✅ Superadmin → Create Organization
router.post(
  "/create",
  verifyToken,
  requireRole("superadmin"),
  organizationController.createOrganization
);

// ✅ Superadmin → Create Organization Admin
router.post(
  "/create-admin",
  verifyToken,
  requireRole("superadmin"),
  organizationController.createOrganizationAdmin
);

module.exports = router;