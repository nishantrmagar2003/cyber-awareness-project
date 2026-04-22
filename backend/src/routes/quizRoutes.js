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

router.put(
  "/:quizId",
  verifyToken,
  requireRole("superadmin"),
  quizController.updateQuiz
);

router.delete(
  "/:quizId",
  verifyToken,
  requireRole("superadmin"),
  quizController.deleteQuiz
);

router.put(
  "/questions/:questionId",
  verifyToken,
  requireRole("superadmin"),
  quizController.updateQuestion
);

router.delete(
  "/questions/:questionId",
  verifyToken,
  requireRole("superadmin"),
  quizController.deleteQuestion
);

/* =====================================================
   SUPERADMIN QUIZ FETCH ROUTES
===================================================== */

router.get(
  "/admin/module/:moduleId/pre-assessment",
  verifyToken,
  requireRole("superadmin"),
  quizController.getAdminPreAssessmentByModuleId
);

router.get(
  "/admin/topic/:topicId",
  verifyToken,
  requireRole("superadmin"),
  quizController.getAdminQuizByTopicId
);

/* =====================================================
   ADMIN ANALYTICS ROUTES
===================================================== */

router.get(
  "/admin/suspicious",
  verifyToken,
  requireRole("org_admin", "superadmin"),
  quizController.getSuspiciousAttempts
);

router.get(
  "/:quizId/analytics",
  verifyToken,
  requireRole("org_admin", "superadmin"),
  quizController.getQuestionAnalytics
);

/* =====================================================
   DASHBOARD STATS
===================================================== */

router.get(
  "/stats",
  verifyToken,
  quizController.getQuizStats
);

/* =====================================================
   STUDENT QUIZ FETCH ROUTES
   KEEP THESE ABOVE /:quizId
===================================================== */

// module pre-assessment
router.get(
  "/module/:moduleId/pre-assessment",
  verifyToken,
  quizController.getPreAssessmentByModuleId
);

// topic quiz
router.get(
  "/topic/:topicId",
  verifyToken,
  quizController.getQuizByTopicId
);

/* =====================================================
   STUDENT SUBMIT ROUTE
===================================================== */

router.post(
  "/:quizId/submit",
  verifyToken,
  requireRole("general_user", "org_student"),
  quizController.submitQuiz
);

router.get(
  "/:quizId/attempts",
  verifyToken,
  requireRole("general_user", "org_student"),
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
   QUIZ FETCH BY ID
   KEEP LAST
===================================================== */

router.get(
  "/:quizId/questions",
  verifyToken,
  quizController.getQuizById
);

router.get(
  "/:quizId",
  verifyToken,
  quizController.getQuizById
);

module.exports = router;