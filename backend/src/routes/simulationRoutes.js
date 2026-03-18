// src/routes/simulationRoutes.js

const express = require("express");
const router = express.Router();

const simulationController = require("../controllers/simulationController");
const { verifyToken } = require("../middleware/authMiddleware"); 
// 👆 FIXED: destructuring import

/*
====================================================
LIST SIMULATIONS FOR A TOPIC
GET /api/topics/:topicId/simulations
====================================================
*/
router.get(
  "/topics/:topicId/simulations",
  verifyToken,
  simulationController.listTopicSimulations
);

/*
====================================================
START SIMULATION ATTEMPT
POST /api/simulations/:simulationId/start
====================================================
*/
router.post(
  "/simulations/:simulationId/start",
  verifyToken,
  simulationController.startSimulation
);

/*
====================================================
SUBMIT SIMULATION ATTEMPT
POST /api/simulation-attempts/:attemptId/submit
====================================================
*/
router.post(
  "/simulation-attempts/:attemptId/submit",
  verifyToken,
  simulationController.submitSimulationAttempt
);

module.exports = router;