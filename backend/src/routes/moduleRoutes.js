const express = require("express");
const router = express.Router();

const moduleController = require("../controllers/moduleController");
const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

/*
  BASE PATH = /api/modules
*/

// Create module (Superadmin only)
router.post(
  "/",
  verifyToken,
  requireRole("superadmin"),
  moduleController.createModule
);

// Get all modules
router.get(
  "/",
  verifyToken,
  moduleController.getModules
);

// Get single module
router.get(
  "/:id",
  verifyToken,
  moduleController.getModuleById
);

// Update module
router.put(
  "/:id",
  verifyToken,
  requireRole("superadmin"),
  moduleController.updateModule
);

// Delete module
router.delete(
  "/:id",
  verifyToken,
  requireRole("superadmin"),
  moduleController.deleteModule
);

/* =========================
   NEW ROUTE FOR DASHBOARD
========================= */

// Topic progress (used by dashboard)
router.get(
  "/progress",
  verifyToken,
  moduleController.getTopicProgress
);

module.exports = router;