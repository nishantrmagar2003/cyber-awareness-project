const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { pool } = require("../config/db");
const progressController = require("../controllers/progressController");

/* ===============================
   GET OVERALL PROGRESS (ROLE-AWARE)
================================ */
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const organizationId = req.user.organization_id || null;

    let totalQuery = "";
    let totalParams = [];

    let completedQuery = "";
    let completedParams = [];

    if (role === "general_user") {
      totalQuery = `
        SELECT COUNT(*) AS total
        FROM topics t
        JOIN modules m ON t.module_id = m.id
        WHERE m.is_public = 1
          AND m.audience_type = 'general'
      `;
      totalParams = [];

      completedQuery = `
        SELECT COUNT(*) AS completed
        FROM topic_progress tp
        JOIN topics t ON tp.topic_id = t.id
        JOIN modules m ON t.module_id = m.id
        WHERE tp.student_id = ?
          AND tp.status = 'completed'
          AND m.is_public = 1
          AND m.audience_type = 'general'
      `;
      completedParams = [userId];
    } else if (role === "org_student") {
      totalQuery = `
        SELECT COUNT(*) AS total
        FROM topics t
        JOIN modules m ON t.module_id = m.id
        LEFT JOIN organization_modules om
          ON om.module_id = m.id
         AND om.organization_id = ?
        WHERE
          (m.is_public = 1 AND m.audience_type = 'general')
          OR
          (m.is_public = 0 AND m.audience_type = 'organization' AND om.id IS NOT NULL)
      `;
      totalParams = [organizationId];

      completedQuery = `
        SELECT COUNT(*) AS completed
        FROM topic_progress tp
        JOIN topics t ON tp.topic_id = t.id
        JOIN modules m ON t.module_id = m.id
        LEFT JOIN organization_modules om
          ON om.module_id = m.id
         AND om.organization_id = ?
        WHERE tp.student_id = ?
          AND tp.status = 'completed'
          AND (
            (m.is_public = 1 AND m.audience_type = 'general')
            OR
            (m.is_public = 0 AND m.audience_type = 'organization' AND om.id IS NOT NULL)
          )
      `;
      completedParams = [organizationId, userId];
    } else {
      totalQuery = `SELECT COUNT(*) AS total FROM topics`;
      totalParams = [];

      completedQuery = `
        SELECT COUNT(*) AS completed
        FROM topic_progress
        WHERE student_id = ? AND status = 'completed'
      `;
      completedParams = [userId];
    }

    const [totalRows] = await pool.query(totalQuery, totalParams);
    const [completedRows] = await pool.query(completedQuery, completedParams);

    return res.json({
      success: true,
      data: {
        total: Number(totalRows[0]?.total || 0),
        completed: Number(completedRows[0]?.completed || 0),
      },
    });
  } catch (err) {
    console.error("Progress error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/* ===============================
   GET SINGLE TOPIC PROGRESS
================================ */
router.get(
  "/topic/:id",
  verifyToken,
  progressController.getTopicProgress
);

/* ===============================
   GET MODULE PROGRESS
================================ */
router.get("/module/:moduleId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const moduleId = req.params.moduleId;

    const [topics] = await pool.query(
      `SELECT id FROM topics WHERE module_id = ?`,
      [moduleId]
    );

    const totalTopics = topics.length;

    const [completed] = await pool.query(
      `SELECT COUNT(*) AS completed
       FROM topic_progress tp
       JOIN topics t ON tp.topic_id = t.id
       WHERE tp.student_id = ?
         AND t.module_id = ?
         AND tp.status = 'completed'`,
      [userId, moduleId]
    );

    const [moduleRows] = await pool.query(
      `SELECT pre_assessment_score, status
       FROM module_progress
       WHERE student_id = ? AND module_id = ?
       LIMIT 1`,
      [userId, moduleId]
    );

    const completedTopics = completed[0]?.completed || 0;
    const progress =
      totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const preAssessmentCompleted =
      moduleRows.length > 0 && moduleRows[0].pre_assessment_score !== null;

    return res.json({
      success: true,
      data: {
        total_topics: totalTopics,
        completed_topics: completedTopics,
        progress,
        is_unlocked: preAssessmentCompleted ? 1 : 0,
        pre_assessment_completed: preAssessmentCompleted ? 1 : 0
      }
    });
  } catch (err) {
    console.error("Module progress error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

/* ===============================
   SAVE PRE-ASSESSMENT
================================ */
router.post("/pre-assessment/:moduleId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const moduleId = req.params.moduleId;
    const { score } = req.body;

    const [existing] = await pool.query(
      "SELECT id FROM module_progress WHERE student_id = ? AND module_id = ?",
      [userId, moduleId]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE module_progress
         SET pre_assessment_score = ?, status = 'in_progress'
         WHERE student_id = ? AND module_id = ?`,
        [score, userId, moduleId]
      );
    } else {
      await pool.query(
        `INSERT INTO module_progress (student_id, module_id, pre_assessment_score, status)
         VALUES (?, ?, ?, 'in_progress')`,
        [userId, moduleId, score]
      );
    }

    return res.json({
      success: true,
      message: "Pre-assessment saved",
    });
  } catch (err) {
    console.error("Pre-assessment error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

module.exports = router;