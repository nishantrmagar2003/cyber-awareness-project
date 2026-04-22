const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// Public
router.post("/login", authController.login);
router.post("/register", authController.register);

// Logged-in user
router.get("/me", verifyToken, authController.getMe);
router.put("/me", verifyToken, authController.updateMe);
router.put("/change-password", verifyToken, authController.changePassword);

// Superadmin
router.get(
  "/superadmin/users",
  verifyToken,
  requireRole("superadmin"),
  authController.getAllUsersForSuperadmin
);

// Org admin
router.post(
  "/org/create-student",
  verifyToken,
  requireRole("org_admin"),
  authController.createOrganizationStudent
);

module.exports = router;