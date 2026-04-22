const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const moduleController = require("../controllers/moduleController");
const rewardService = require("../services/rewardService");
const { pool } = require("../config/db");

/* ===============================
   SUPERADMIN TOPIC CRUD
================================ */
router.post(
  "/module/:moduleId",
  verifyToken,
  requireRole("superadmin"),
  moduleController.createTopicByModule
);

router.put(
  "/:topicId",
  verifyToken,
  requireRole("superadmin"),
  moduleController.updateTopic
);

router.delete(
  "/:topicId",
  verifyToken,
  requireRole("superadmin"),
  moduleController.deleteTopic
);

/* ===============================
   TOPIC PROGRESS
================================ */
router.get("/progress", verifyToken, moduleController.getTopicProgress);
router.get("/module/:moduleId", verifyToken, moduleController.getTopicsByModule);

/* ===============================
   SHARED TOPIC ACCESS CHECK
================================ */
async function getAccessibleTopic(user, topicId) {
  const [rows] = await pool.query(
    `
    SELECT 
      t.id,
      t.module_id,
      t.title,
      t.description,
      t.video_url,
      m.is_public,
      m.audience_type
    FROM topics t
    JOIN modules m ON m.id = t.module_id
    WHERE t.id = ?
    LIMIT 1
    `,
    [topicId]
  );

  if (rows.length === 0) {
    return {
      ok: false,
      status: 404,
      error: "Topic not found",
    };
  }

  const topic = rows[0];

  if (Number(topic.is_public) === 1 && topic.audience_type === "general") {
    return {
      ok: true,
      topic,
    };
  }

  if (Number(topic.is_public) === 0 && topic.audience_type === "organization") {
    if (user.role !== "org_student") {
      return {
        ok: false,
        status: 403,
        error: "Only org students can access premium topics",
      };
    }

    if (!user.organization_id) {
      return {
        ok: false,
        status: 403,
        error: "No organization assigned",
      };
    }

    const [accessRows] = await pool.query(
      `
      SELECT om.id
      FROM organization_modules om
      WHERE om.organization_id = ?
        AND om.module_id = ?
      LIMIT 1
      `,
      [user.organization_id, topic.module_id]
    );

    if (accessRows.length === 0) {
      return {
        ok: false,
        status: 403,
        error: "You do not have access to this premium topic",
      };
    }

    return {
      ok: true,
      topic,
    };
  }

  return {
    ok: false,
    status: 403,
    error: "Access denied",
  };
}

/* ===============================
   GET SINGLE TOPIC DETAIL
================================ */
router.get("/:topicId", verifyToken, async (req, res) => {
  try {
    const access = await getAccessibleTopic(req.user, req.params.topicId);

    if (!access.ok) {
      return res.status(access.status).json({
        success: false,
        error: access.error,
      });
    }

    return res.json({
      success: true,
      data: access.topic,
    });
  } catch (err) {
    console.error("Get topic detail error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/* ===============================
   TEXT COMPLETE
================================ */
router.post("/:topicId/text-complete", verifyToken, async (req, res) => {
  try {
    const access = await getAccessibleTopic(req.user, req.params.topicId);

    if (!access.ok) {
      return res.status(access.status).json({
        success: false,
        error: access.error,
      });
    }

    const userId = req.user.id;
    const topicId = req.params.topicId;

    const [existing] = await pool.query(
      `SELECT id FROM topic_progress 
       WHERE student_id = ? AND topic_id = ?`,
      [userId, topicId]
    );

    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO topic_progress (student_id, topic_id, text_completed, status)
         VALUES (?, ?, 1, 'in_progress')`,
        [userId, topicId]
      );
    } else {
      await pool.query(
        `UPDATE topic_progress 
         SET text_completed = 1 
         WHERE student_id = ? AND topic_id = ?`,
        [userId, topicId]
      );
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Text completion error:", err);
    return res.status(500).json({ error: err.message });
  }
});

/* ===============================
   COMPLETE TOPIC + AWARD BADGE
================================ */
router.post("/:topicId/complete", verifyToken, async (req, res) => {
  try {
    const access = await getAccessibleTopic(req.user, req.params.topicId);

    if (!access.ok) {
      return res.status(access.status).json({
        success: false,
        error: access.error,
      });
    }

    const userId = req.user.id;
    const topicId = Number(req.params.topicId);

    if (!topicId) {
      return res.status(400).json({ error: "Invalid topic id" });
    }

    const [rows] = await pool.query(
      `
      SELECT 
        tp.student_id,
        tp.topic_id,
        tp.status,
        tp.video_completed,
        tp.text_completed,
        tp.best_quiz_score,
        tp.best_simulation_score,
        tp.simulations_completed,
        t.module_id
      FROM topic_progress tp
      JOIN topics t ON tp.topic_id = t.id
      WHERE tp.student_id = ? AND tp.topic_id = ?
      LIMIT 1
      `,
      [userId, topicId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Topic progress not found" });
    }

    const progress = rows[0];

    const canComplete =
      Number(progress.video_completed || 0) === 1 &&
      Number(progress.text_completed || 0) === 1 &&
      Number(progress.best_quiz_score || 0) >= 70 &&
      Number(progress.best_simulation_score || 0) >= 70 &&
      Number(progress.simulations_completed || 0) >= 2;

    if (!canComplete) {
      return res.status(400).json({
        error: "Topic is not fully completed yet",
      });
    }

    if (progress.status !== "completed") {
      await pool.query(
        `
        UPDATE topic_progress
        SET status = 'completed',
            completed_at = NOW()
        WHERE student_id = ? AND topic_id = ?
        `,
        [userId, topicId]
      );
    }

    await rewardService.processRewards(userId, topicId, progress.module_id);

    return res.json({
      success: true,
      message: "Topic completed and reward processed",
    });
  } catch (err) {
    console.error("Topic complete error:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

module.exports = router;