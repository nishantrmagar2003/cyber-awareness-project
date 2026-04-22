const express = require("express");
const router = express.Router();

const incidentController = require("../controllers/incidentController");
const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const requireIncidentAdmin = requireRole("superadmin", "org_admin");

// ===============================
// INCIDENT ROUTES
// ===============================

// Stats must come before /:id routes
router.get(
  "/incidents/stats",
  verifyToken,
  requireIncidentAdmin,
  incidentController.getIncidentStats
);

// ===============================
// BASIC CRUD
// ===============================

router.post(
  "/incidents",
  verifyToken,
  requireIncidentAdmin,
  incidentController.createIncident
);

router.get(
  "/incidents",
  verifyToken,
  requireIncidentAdmin,
  incidentController.getIncidents
);

router.patch(
  "/incidents/:id/status",
  verifyToken,
  requireIncidentAdmin,
  incidentController.updateIncidentStatus
);

router.post(
  "/incidents/:id/notes",
  verifyToken,
  requireIncidentAdmin,
  incidentController.addIncidentNote
);

// ===============================
// SPECIFIC ROUTES (Before generic :id)
// ===============================

router.get(
  "/incidents/:id/logs",
  verifyToken,
  requireIncidentAdmin,
  incidentController.getIncidentLogs
);

router.patch(
  "/incidents/:id/restore",
  verifyToken,
  requireIncidentAdmin,
  incidentController.restoreIncident
);

router.patch(
  "/incidents/:id/assign",
  verifyToken,
  requireIncidentAdmin,
  incidentController.assignIncident
);

router.delete(
  "/incidents/:id",
  verifyToken,
  requireIncidentAdmin,
  incidentController.deleteIncident
);

// ===============================
// GENERIC (MUST BE LAST)
// ===============================

router.get(
  "/incidents/:id",
  verifyToken,
  requireIncidentAdmin,
  incidentController.getSingleIncident
);

module.exports = router;