const express = require("express");
const router = express.Router();

const simulationController = require("../controllers/simulationController");
const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { pool } = require("../config/db");

/*
====================================================
SUPERADMIN SIMULATION CRUD
====================================================
*/
router.get(
  "/admin",
  verifyToken,
  requireRole("superadmin"),
  simulationController.getAdminSimulations
);

router.post(
  "/admin",
  verifyToken,
  requireRole("superadmin"),
  simulationController.createSimulation
);

router.put(
  "/admin/:simulationId",
  verifyToken,
  requireRole("superadmin"),
  simulationController.updateSimulation
);

router.delete(
  "/admin/:simulationId",
  verifyToken,
  requireRole("superadmin"),
  simulationController.deleteSimulation
);

/*
====================================================
GET SIMULATION STATS
====================================================
*/
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [totalRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM simulations WHERE is_active = 1"
    );

    const [completedRows] = await pool.query(
      `SELECT COUNT(*) AS completed
       FROM student_simulation_stats
       WHERE student_id = ? AND total_attempts > 0`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        total: totalRows[0]?.total || 0,
        completed: completedRows[0]?.completed || 0,
        avgScore: 0,
        bestScore: 0,
      },
    });
  } catch (err) {
    console.error("Simulation stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/*
====================================================
LIST SIMULATIONS FOR A TOPIC
====================================================
*/
router.get(
  "/topics/:topicId/simulations",
  verifyToken,
  simulationController.listTopicSimulations
);

/*
====================================================
START SIMULATION
====================================================
*/
router.post(
  "/:simulationId/start",
  verifyToken,
  simulationController.startSimulation
);

/*
====================================================
SUBMIT SIMULATION
====================================================
*/
router.post(
  "/simulation-attempts/:attemptId/submit",
  verifyToken,
  simulationController.submitSimulationAttempt
);

/*
====================================================
COMPLETE SIMULATION
====================================================
*/
router.post(
  "/simulation-attempts/:attemptId/complete",
  verifyToken,
  simulationController.completeSimulationAttempt
);

module.exports = router;