const express = require("express");
const router = express.Router();

const quizController = require("../controllers/quizController");
const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

/* =====================================================
   SUPERADMIN ROUTES
===================================================== */

router.post(
  "/",
  verifyToken,
  requireRole("superadmin"),
  quizController.createQuiz
);

router.post(
  "/:quizId/questions",
  verifyToken,
  requireRole("superadmin"),
  quizController.addQuestion
);

/* =====================================================
   ADMIN ANALYTICS ROUTES (STATIC ROUTES FIRST)
===================================================== */

// Suspicious attempts dashboard
router.get(
  "/admin/suspicious",
  verifyToken,
  requireRole("org_admin", "superadmin"),
  quizController.getSuspiciousAttempts
);

// Question difficulty analytics per quiz
router.get(
  "/:quizId/analytics",
  verifyToken,
  requireRole("org_admin", "superadmin"),
  quizController.getQuestionAnalytics
);

/* =====================================================
   DASHBOARD STATS ROUTE (NEW)
===================================================== */

router.get(
  "/stats",
  verifyToken,
  quizController.getQuizStats
);

/* =====================================================
   STUDENT SUBMIT ROUTE
===================================================== */

router.post(
  "/:quizId/submit",
  verifyToken,
  requireRole("org_student", "general_user"),
  quizController.submitQuiz
);

/* =====================================================
   STUDENT ATTEMPTS ROUTE
===================================================== */

router.get(
  "/:quizId/attempts",
  verifyToken,
  requireRole("org_student", "general_user"),
  async (req, res) => {
    try {
      const { quizId } = req.params;
      const student_id = req.user.id;

      const { pool } = require("../config/db");

      const [attempts] = await pool.query(
        `SELECT attempt_number, score, time_taken_seconds, is_suspicious, created_at
         FROM quiz_attempts
         WHERE student_id = ? AND quiz_id = ?
         ORDER BY attempt_number DESC`,
        [student_id, quizId]
      );

      res.json({ attempts });

    } catch (err) {
      console.error("GET ATTEMPTS ERROR:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/* =====================================================
   QUIZ FETCH ROUTES (DYNAMIC ROUTES LAST)
===================================================== */
router.get(
  "/topic/:topicId",
  verifyToken,
  quizController.getQuizByTopicId
);
// IMPORTANT: More specific route first
router.get(
  "/:quizId/questions",
  verifyToken,
  quizController.getQuizById
);

// Then generic quiz route
router.get(
  "/:quizId",
  verifyToken,
  quizController.getQuizById
);

module.exports = router;