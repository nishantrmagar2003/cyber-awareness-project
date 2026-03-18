const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Middlewares
const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// 🔐 Login
router.post("/login", authController.login);

// 🌍 Public Register (General users only)
router.post("/register", authController.register);

// 🏢 Organization Admin → Create Organization Student
router.post(
  "/org/create-student",
  verifyToken,
  requireRole("org_admin"),   // ✅ FIXED ROLE
  authController.createOrganizationStudent
);

module.exports = router;