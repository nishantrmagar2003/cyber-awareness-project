// src/controllers/videoController.js

const { pool } = require("../config/db");
const rewardService = require("../services/rewardService");

const PASS_SCORE = 70;

/*
====================================================
MARK VIDEO AS COMPLETED
====================================================
POST /api/topics/:topicId/video-complete
====================================================
*/

exports.markVideoComplete = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const student = req.user;
    const topicId = req.params.topicId;

    if (!student || !student.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!topicId) {
      return res.status(400).json({ error: "topicId is required" });
    }

    await conn.beginTransaction();

    // =========================
    // 1️⃣ Check topic exists
    // =========================
    const [topicRows] = await conn.query(
      "SELECT id, module_id FROM topics WHERE id = ?",
      [topicId]
    );

    if (topicRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Topic not found" });
    }

    const moduleId = topicRows[0].module_id;

    // =========================
    // 2️⃣ Insert or update topic_progress
    //    (IMPORTANT: add video_completed_at)
    // =========================
    await conn.query(
      `
      INSERT INTO topic_progress
        (student_id, topic_id, status, video_completed, video_completed_at)
      VALUES (?, ?, 'in_progress', 1, NOW())
      ON DUPLICATE KEY UPDATE
        video_completed = 1,
        video_completed_at = NOW(),
        status = IF(status = 'not_started', 'in_progress', status)
      `,
      [student.id, topicId]
    );

    // =========================
    // 3️⃣ AUTO-UNLOCK LOGIC
    //    If topic was locked due to simulation failures,
    //    remove lock when video is rewatched.
    // =========================
    await conn.query(
      `
      UPDATE topic_progress
      SET requires_review = 0,
          requires_review_reason = NULL,
          requires_review_set_at = NULL
      WHERE student_id = ?
        AND topic_id = ?
        AND requires_review = 1
      `,
      [student.id, topicId]
    );

    // =========================
    // 4️⃣ Check current progress
    // =========================
    const [progressRows] = await conn.query(
      `
      SELECT video_completed,
             best_quiz_score,
             best_simulation_score,
             simulations_completed,
             status
      FROM topic_progress
      WHERE student_id = ? AND topic_id = ?
      `,
      [student.id, topicId]
    );

    if (progressRows.length === 0) {
      await conn.rollback();
      return res.status(500).json({ error: "Progress record not found" });
    }

    const progress = progressRows[0];

    const quizScore = progress.best_quiz_score || 0;
    const simulationScore = progress.best_simulation_score || 0;
    const simulationsCompleted = progress.simulations_completed || 0;

    let topicCompletedNow = false;

    // =========================
    // 5️⃣ If all requirements met → complete topic
    // =========================
    if (
      progress.video_completed === 1 &&
      quizScore >= PASS_SCORE &&
      simulationScore >= PASS_SCORE &&
      simulationsCompleted >= 2 && // your rule: 2 simulations per topic
      progress.status !== "completed"
    ) {
      await conn.query(
        `
        UPDATE topic_progress
        SET status = 'completed',
            completed_at = NOW()
        WHERE student_id = ? AND topic_id = ?
        `,
        [student.id, topicId]
      );

      topicCompletedNow = true;
    }

    await conn.commit();

    // =========================
    // 6️⃣ Trigger rewards AFTER commit
    // =========================
    if (topicCompletedNow) {
      try {
        await rewardService.processRewards(
          student.id,
          topicId,
          moduleId
        );
      } catch (rewardErr) {
        console.error("REWARD ERROR:", rewardErr);
        // Do not fail video completion if reward fails
      }
    }

    return res.json({
      message: "Video marked as completed",
    });

  } catch (err) {
    try { await conn.rollback(); } catch {}
    console.error("VIDEO COMPLETE ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    conn.release();
  }
};