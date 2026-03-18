const express = require("express");
const router = express.Router();

const incidentController = require("../controllers/incidentController");
const { verifyToken } = require("../middleware/authMiddleware");

// ===============================
// INCIDENT ROUTES
// ===============================

// ✅ Stats (must come before /:id routes)
router.get("/incidents/stats", verifyToken, incidentController.getIncidentStats);

// ===============================
// BASIC CRUD
// ===============================

router.post("/incidents", verifyToken, incidentController.createIncident);
router.get("/incidents", verifyToken, incidentController.getIncidents);
router.patch("/incidents/:id/status", verifyToken, incidentController.updateIncidentStatus);
router.post("/incidents/:id/notes", verifyToken, incidentController.addIncidentNote);

// ===============================
// SPECIFIC ROUTES (Before generic :id)
// ===============================

router.get("/incidents/:id/logs", verifyToken, incidentController.getIncidentLogs);
router.patch("/incidents/:id/restore", verifyToken, incidentController.restoreIncident);
router.patch("/incidents/:id/assign", verifyToken, incidentController.assignIncident);
router.delete("/incidents/:id", verifyToken, incidentController.deleteIncident);

// ===============================
// GENERIC (MUST BE LAST)
// ===============================

router.get("/incidents/:id", verifyToken, incidentController.getSingleIncident);

module.exports = router;