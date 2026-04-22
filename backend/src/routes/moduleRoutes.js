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

// Topic progress/dashboard route must stay before /:id
router.get(
  "/progress",
  verifyToken,
  moduleController.getTopicProgress
);

// Get all modules (old mixed endpoint - keep for now)
router.get(
  "/",
  verifyToken,
  moduleController.getModules
);

// Get general modules
router.get(
  "/general",
  verifyToken,
  moduleController.getGeneralModules
);

// Get premium modules
router.get(
  "/premium",
  verifyToken,
  moduleController.getPremiumModules
);
// Submit general module pre-assessment and unlock module
router.post(
  "/:moduleId/pre-assessment",
  verifyToken,
  requireRole("general_user", "org_student"),
  moduleController.submitModulePreAssessment
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

module.exports = router;