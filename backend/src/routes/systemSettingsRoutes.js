const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const systemSettingsController = require("../controllers/systemSettingsController");

/* ===============================
   SUPERADMIN SYSTEM SETTINGS
=============================== */
router.get(
  "/",
  verifyToken,
  requireRole("superadmin"),
  systemSettingsController.getSystemSettings
);

router.put(
  "/",
  verifyToken,
  requireRole("superadmin"),
  systemSettingsController.updateSystemSettings
);

module.exports = router;