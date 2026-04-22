const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const organizationController = require("../controllers/organizationController");

// Superadmin -> Create Organization
router.post(
  "/create",
  verifyToken,
  requireRole("superadmin"),
  organizationController.createOrganization
);

// Superadmin -> Create Organization Admin
router.post(
  "/create-admin",
  verifyToken,
  requireRole("superadmin"),
  organizationController.createOrganizationAdmin
);

// Superadmin -> Dashboard summary
router.get(
  "/superadmin/dashboard",
  verifyToken,
  requireRole("superadmin"),
  organizationController.getSuperAdminDashboard
);

// Superadmin -> Get all organizations
router.get(
  "/superadmin/all",
  verifyToken,
  requireRole("superadmin"),
  organizationController.getAllOrganizations
);
// Superadmin -> Toggle organization status
router.put(
  "/superadmin/:id/status",
  verifyToken,
  requireRole("superadmin"),
  organizationController.toggleOrganizationStatusBySuperadmin
);

// Superadmin -> Get one organization detail
router.get(
  "/superadmin/:id",
  verifyToken,
  requireRole("superadmin"),
  organizationController.getOrganizationByIdForSuperadmin
);

// Superadmin -> Get all premium modules for assignment
router.get(
  "/superadmin/premium-modules/all",
  verifyToken,
  requireRole("superadmin"),
  organizationController.getAllPremiumModulesForAssignment
);

// Superadmin -> Assign premium module to organization
router.post(
  "/superadmin/:id/modules",
  verifyToken,
  requireRole("superadmin"),
  organizationController.assignPremiumModuleToOrganization
);

// Superadmin -> Remove premium module from organization
router.delete(
  "/superadmin/:id/modules/:moduleId",
  verifyToken,
  requireRole("superadmin"),
  organizationController.removePremiumModuleFromOrganization
);
// Org admin -> Create org student
router.post(
  "/students",
  verifyToken,
  requireRole("org_admin"),
  organizationController.createOrganizationStudent
);

// Org admin -> Get all own students
router.get(
  "/students",
  verifyToken,
  requireRole("org_admin"),
  organizationController.getOrganizationStudents
);

// Org admin -> Get one student detail
router.get(
  "/students/:id",
  verifyToken,
  requireRole("org_admin"),
  organizationController.getOrganizationStudentDetails
);

// Org admin -> Dashboard summary
router.get(
  "/dashboard",
  verifyToken,
  requireRole("org_admin"),
  organizationController.getOrganizationDashboard
);
// Org admin -> Get settings
router.get(
  "/settings",
  verifyToken,
  requireRole("org_admin"),
  organizationController.getOrganizationSettings
);

// Org admin -> Update organization settings
router.put(
  "/settings/organization",
  verifyToken,
  requireRole("org_admin"),
  organizationController.updateOrganizationSettings
);

// Org admin -> Update admin profile / password
router.put(
  "/settings/profile",
  verifyToken,
  requireRole("org_admin"),
  organizationController.updateOrganizationAdminProfile
);

module.exports = router;