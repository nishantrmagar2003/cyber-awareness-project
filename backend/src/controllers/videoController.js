const fs = require("fs");
const path = require("path");
const multer = require("multer");

const { pool } = require("../config/db");
const rewardService = require("../services/rewardService");

const PASS_SCORE = 70;

/* ====================================================
   MULTER SETUP
==================================================== */
const uploadDir = path.join(process.cwd(), "uploads", "videos");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const base = path
      .basename(file.originalname || "video", ext)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 80);

    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowedExt = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mime = String(file.mimetype || "").toLowerCase();

  const isVideo = mime.startsWith("video/") || allowedExt.includes(ext);

  if (!isVideo) {
    return cb(new Error("Only video files are allowed"));
  }

  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB
  },
});

exports.uploadVideoMiddleware = upload.single("video");

/* ====================================================
   HELPERS
==================================================== */
function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("FILE DELETE ERROR:", err);
  }
}

function publicVideoPath(filename) {
  return `/videos/${filename}`;
}

function absoluteFromPublicPath(videoUrl = "") {
  const clean = String(videoUrl).replace(/^\/+/, "");
  return path.join(process.cwd(), clean);
}

async function getPremiumTopic(topicId) {
  const [rows] = await pool.query(
    `
    SELECT
      t.id,
      t.module_id,
      t.title,
      t.description,
      t.sort_order,
      t.video_url,
      t.created_at,
      m.title AS module_title,
      m.description AS module_description,
      m.level,
      m.audience_type,
      m.is_public
    FROM topics t
    JOIN modules m ON m.id = t.module_id
    WHERE t.id = ?
    LIMIT 1
    `,
    [topicId]
  );

  if (rows.length === 0) return null;

  const topic = rows[0];

  const isPremium =
    Number(topic.is_public || 0) === 0 &&
    topic.audience_type === "organization";

  if (!isPremium) return null;

  return topic;
}

/* ====================================================
   SUPERADMIN: GET ALL PREMIUM TOPICS WITH VIDEO
==================================================== */
exports.getPremiumTopicsWithVideos = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        t.id,
        t.module_id,
        t.title,
        t.description,
        t.sort_order,
        t.video_url,
        t.created_at,
        m.title AS module_title,
        m.description AS module_description,
        m.level
      FROM topics t
      JOIN modules m ON m.id = t.module_id
      WHERE m.is_public = 0
        AND m.audience_type = 'organization'
      ORDER BY m.id ASC, t.sort_order ASC, t.id ASC
      `
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("GET PREMIUM TOPICS WITH VIDEOS ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* ====================================================
   SUPERADMIN: GET VIDEO BY TOPIC
   Returns array for frontend compatibility
==================================================== */
exports.getVideosByTopicId = async (req, res) => {
  try {
    const { topicId } = req.params;

    if (!topicId) {
      return res.status(400).json({ error: "topicId is required" });
    }

    const topic = await getPremiumTopic(topicId);

    if (!topic) {
      return res.status(404).json({
        error: "Premium topic not found",
      });
    }

    const rows = topic.video_url
      ? [
          {
            id: topic.id,
            topic_id: topic.id,
            title: topic.title,
            video_url: topic.video_url,
            file_size: null,
            created_at: topic.created_at,
            topic_title: topic.title,
            module_id: topic.module_id,
            module_title: topic.module_title,
          },
        ]
      : [];

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("GET VIDEOS BY TOPIC ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* ====================================================
   SUPERADMIN: UPLOAD VIDEO FOR PREMIUM TOPIC
   multipart/form-data:
   - topic_id
   - title (optional, currently ignored for DB because DB stores topic title)
   - video
==================================================== */
exports.uploadVideoForPremiumTopic = async (req, res) => {
  try {
    const user = req.user;
    const { topic_id } = req.body;
    const file = req.file;

    if (!user || user.role !== "superadmin") {
      if (file?.path) safeUnlink(file.path);
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!topic_id) {
      if (file?.path) safeUnlink(file.path);
      return res.status(400).json({ error: "topic_id is required" });
    }

    if (!file) {
      return res.status(400).json({ error: "Video file is required" });
    }

    const topic = await getPremiumTopic(topic_id);

    if (!topic) {
      safeUnlink(file.path);
      return res.status(404).json({
        error: "Premium topic not found",
      });
    }

    if (topic.video_url) {
      const oldAbsolutePath = absoluteFromPublicPath(topic.video_url);
      safeUnlink(oldAbsolutePath);
    }

    const savedVideoUrl = publicVideoPath(file.filename);

    await pool.query(
      `
      UPDATE topics
      SET video_url = ?
      WHERE id = ?
      `,
      [savedVideoUrl, topic_id]
    );

    return res.status(201).json({
      success: true,
      data: {
        topic_id: Number(topic_id),
        topic_title: topic.title,
        module_id: topic.module_id,
        module_title: topic.module_title,
        video_url: savedVideoUrl,
        file_name: file.filename,
        original_name: file.originalname,
        file_size: file.size || null,
      },
    });
  } catch (err) {
    if (req.file?.path) safeUnlink(req.file.path);

    console.error("UPLOAD PREMIUM VIDEO ERROR:", err);

    if (err.message === "Only video files are allowed") {
      return res.status(400).json({ error: err.message });
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "Video file is too large. Maximum size is 500MB",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* ====================================================
   SUPERADMIN: DELETE VIDEO FROM PREMIUM TOPIC
==================================================== */
exports.deleteVideoFromPremiumTopic = async (req, res) => {
  try {
    const user = req.user;
    const { topicId } = req.params;

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!topicId) {
      return res.status(400).json({ error: "topicId is required" });
    }

    const topic = await getPremiumTopic(topicId);

    if (!topic) {
      return res.status(404).json({
        error: "Premium topic not found",
      });
    }

    if (!topic.video_url) {
      return res.status(404).json({
        error: "No uploaded video found for this topic",
      });
    }

    const absolutePath = absoluteFromPublicPath(topic.video_url);
    safeUnlink(absolutePath);

    await pool.query(
      `
      UPDATE topics
      SET video_url = NULL
      WHERE id = ?
      `,
      [topicId]
    );

    return res.json({
      success: true,
      message: "Video removed successfully",
    });
  } catch (err) {
    console.error("DELETE PREMIUM VIDEO ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* ====================================================
   MARK VIDEO AS COMPLETED
   POST /api/topics/:topicId/video-complete
==================================================== */
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

    const [topicRows] = await conn.query(
      "SELECT id, module_id FROM topics WHERE id = ?",
      [topicId]
    );

    if (topicRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Topic not found" });
    }

    const moduleId = topicRows[0].module_id;

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

    const [reviewRows] = await conn.query(
      `
      SELECT requires_review
      FROM topic_progress
      WHERE student_id = ? AND topic_id = ?
      LIMIT 1
      `,
      [student.id, topicId]
    );

    const wasUnderReview =
      reviewRows.length > 0 && Number(reviewRows[0].requires_review) === 1;

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

    if (wasUnderReview) {
      const [quizRows] = await conn.query(
        `
        SELECT id
        FROM quizzes
        WHERE topic_id = ?
        LIMIT 1
        `,
        [topicId]
      );

      if (quizRows.length > 0) {
        const quizId = quizRows[0].id;

        const [attemptRows] = await conn.query(
          `
          SELECT id
          FROM quiz_attempts
          WHERE student_id = ? AND quiz_id = ?
          `,
          [student.id, quizId]
        );

        const attemptIds = attemptRows.map((row) => row.id);

        if (attemptIds.length > 0) {
          const placeholders = attemptIds.map(() => "?").join(",");

          await conn.query(
            `
            DELETE FROM quiz_answers
            WHERE quiz_attempt_id IN (${placeholders})
            `,
            attemptIds
          );

          await conn.query(
            `
            DELETE FROM quiz_attempts
            WHERE student_id = ? AND quiz_id = ?
            `,
            [student.id, quizId]
          );
        }
      }

      await conn.query(
        `
        UPDATE topic_progress
        SET best_quiz_score = NULL
        WHERE student_id = ? AND topic_id = ?
        `,
        [student.id, topicId]
      );
    }

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

    if (
      Number(progress.video_completed) === 1 &&
      Number(quizScore) >= PASS_SCORE &&
      Number(simulationScore) >= PASS_SCORE &&
      Number(simulationsCompleted) >= 2 &&
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

    if (topicCompletedNow) {
      try {
        await rewardService.processRewards(student.id, topicId, moduleId);
      } catch (rewardErr) {
        console.error("REWARD ERROR:", rewardErr);
      }
    }

    return res.json({
      message: "Video marked as completed",
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch {}

    console.error("VIDEO COMPLETE ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    conn.release();
  }
};