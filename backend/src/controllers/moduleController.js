const { pool } = require("../config/db");

function buildModuleAccessFilter(user) {
  const role = user?.role || null;
  const organizationId = user?.organization_id || null;

  if (role === "superadmin") {
    return {
      whereSql: "1=1",
      params: [],
    };
  }

  if ((role === "org_student" || role === "org_admin") && organizationId) {
    return {
      whereSql: `
        (
          (m.audience_type = 'general' AND m.is_public = 1)
          OR
          (m.audience_type = 'organization' AND om.organization_id = ?)
        )
      `,
      params: [organizationId],
    };
  }

  return {
    whereSql: `(m.audience_type = 'general' AND m.is_public = 1)`,
    params: [],
  };
}

/* ===============================
   CREATE MODULE
================================ */
const createModule = async (req, res) => {
  try {
    const user = req.user;

    const {
      title,
      description,
      key_points,
      closing_summary,
      level = "basic",
      audience_type = "organization",
      is_public = false,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "title is required",
      });
    }

    const allowedLevels = ["basic", "intermediate", "advanced"];
    const finalLevel = allowedLevels.includes(level) ? level : "basic";

    if (audience_type !== "organization" || Number(is_public) === 1) {
      return res.status(400).json({
        success: false,
        error: "Only premium organization modules can be created here",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO modules (
        title,
        description,
        key_points,
        closing_summary,
        level,
        is_public,
        audience_type,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title.trim(),
        description || null,
        key_points || null,
        closing_summary || null,
        finalLevel,
        0,
        "organization",
        user.id,
      ]
    );

    return res.status(201).json({
      success: true,
      data: {
        message: "Premium module created",
        module_id: result.insertId,
      },
    });
  } catch (err) {
    console.error("CREATE MODULE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/* ===============================
   GET ALL MODULES
================================ */
const getModules = async (req, res) => {
  try {
    const studentId = req.user?.id || 0;
    const user = req.user || {};

    const { whereSql, params } = buildModuleAccessFilter(user);

    const [modules] = await pool.query(
      `
      SELECT DISTINCT
        m.id,
        m.title,
        m.description,
        m.key_points,
        m.closing_summary,
        m.level,
        m.audience_type,
        m.is_public,
        CASE
          WHEN mp.pre_assessment_score IS NOT NULL THEN 1
          ELSE 0
        END AS is_unlocked
      FROM modules m
      LEFT JOIN module_progress mp
        ON mp.module_id = m.id
        AND mp.student_id = ?
      LEFT JOIN organization_modules om
        ON om.module_id = m.id
      WHERE ${whereSql}
      ORDER BY m.id ASC
      `,
      [studentId, ...params]
    );

    const [topics] = await pool.query(
      `
      SELECT
        t.id,
        t.module_id,
        t.title,
        t.description,
        t.explanation_english,
        t.video_url,
        t.sort_order
      FROM topics t
      INNER JOIN modules m
        ON m.id = t.module_id
      LEFT JOIN organization_modules om
        ON om.module_id = m.id
      WHERE ${whereSql}
      ORDER BY t.module_id ASC, t.sort_order ASC
      `,
      params
    );

    const moduleMap = {};

    modules.forEach((m) => {
      moduleMap[m.id] = {
        id: m.id,
        title: m.title,
        description: m.description,
        key_points: m.key_points,
        closing_summary: m.closing_summary,
        level: m.level,
        audience_type: m.audience_type,
        is_public: Number(m.is_public),
        is_unlocked: Number(m.is_unlocked),
        topics: [],
      };
    });

    topics.forEach((t) => {
      if (moduleMap[t.module_id]) {
        moduleMap[t.module_id].topics.push({
          id: t.id,
          title: t.title,
          description: t.description,
          explanation_english: t.explanation_english,
          video_url: t.video_url,
          sort_order: t.sort_order,
        });
      }
    });

    return res.json({
      success: true,
      data: Object.values(moduleMap),
    });
  } catch (err) {
    console.error("GET MODULES ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/* ===============================
   GET GENERAL MODULES
================================ */
const getGeneralModules = async (req, res) => {
  try {
    const studentId = req.user?.id || 0;

    const [modules] = await pool.query(
      `
      SELECT
        m.id,
        m.title,
        m.description,
        m.key_points,
        m.closing_summary,
        m.level,
        m.is_public,
        m.audience_type,
        CASE
          WHEN mp.pre_assessment_score IS NOT NULL THEN 1
          ELSE 0
        END AS is_unlocked
      FROM modules m
      LEFT JOIN module_progress mp
        ON mp.module_id = m.id
        AND mp.student_id = ?
      WHERE m.is_public = 1
        AND m.audience_type = 'general'
      ORDER BY m.id ASC
      `,
      [studentId]
    );

    const [topics] = await pool.query(
      `
      SELECT
        id,
        module_id,
        title,
        description,
        video_url,
        sort_order
      FROM topics
      WHERE module_id IN (
        SELECT id
        FROM modules
        WHERE is_public = 1
          AND audience_type = 'general'
      )
      ORDER BY module_id ASC, sort_order ASC
      `
    );

    const moduleMap = {};

    modules.forEach((m) => {
      moduleMap[m.id] = {
        id: m.id,
        title: m.title,
        description: m.description,
        key_points: m.key_points,
        closing_summary: m.closing_summary,
        level: m.level,
        is_public: Number(m.is_public),
        audience_type: m.audience_type,
        is_unlocked: Number(m.is_unlocked),
        topics: [],
      };
    });

    topics.forEach((t) => {
      if (moduleMap[t.module_id]) {
        moduleMap[t.module_id].topics.push({
          id: t.id,
          title: t.title,
          description: t.description,
          video_url: t.video_url,
          sort_order: t.sort_order,
        });
      }
    });

    return res.json({
      success: true,
      data: Object.values(moduleMap),
    });
  } catch (err) {
    console.error("GET GENERAL MODULES ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/* ===============================
   GET PREMIUM MODULES
================================ */
const getPremiumModules = async (req, res) => {
  try {
    const studentId = req.user?.id || 0;
    const organizationId = req.user?.organization_id || null;
    const role = req.user?.role || null;

    if (role === "superadmin") {
      const [modules] = await pool.query(
        `
        SELECT
          m.id,
          m.title,
          m.description,
          m.key_points,
          m.closing_summary,
          m.level,
          m.is_public,
          m.audience_type,
          m.created_by,
          m.created_at
        FROM modules m
        WHERE m.is_public = 0
          AND m.audience_type = 'organization'
        ORDER BY m.id ASC
        `
      );

      const [topics] = await pool.query(
        `
        SELECT
          id,
          module_id,
          title,
          description,
          explanation_english,
          video_url,
          sort_order
        FROM topics
        WHERE module_id IN (
          SELECT id
          FROM modules
          WHERE is_public = 0
            AND audience_type = 'organization'
        )
        ORDER BY module_id ASC, sort_order ASC
        `
      );

      const moduleMap = {};

      modules.forEach((m) => {
        moduleMap[m.id] = {
          id: m.id,
          title: m.title,
          description: m.description,
          key_points: m.key_points,
          closing_summary: m.closing_summary,
          level: m.level,
          is_public: Number(m.is_public),
          audience_type: m.audience_type,
          created_by: m.created_by,
          created_at: m.created_at,
          topics: [],
        };
      });

      topics.forEach((t) => {
        if (moduleMap[t.module_id]) {
          moduleMap[t.module_id].topics.push({
            id: t.id,
            title: t.title,
            description: t.description,
            explanation_english: t.explanation_english,
            video_url: t.video_url,
            sort_order: t.sort_order,
          });
        }
      });

      return res.json({
        success: true,
        data: Object.values(moduleMap),
      });
    }

    if (!studentId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    if (role !== "org_student" && role !== "org_admin") {
      return res.status(403).json({
        success: false,
        error: "Only organization users can access premium modules",
      });
    }

    if (!organizationId) {
      return res.status(403).json({
        success: false,
        error: "No organization assigned",
      });
    }

    const [modules] = await pool.query(
      `
      SELECT
        m.id,
        m.title,
        m.description,
        m.key_points,
        m.closing_summary,
        m.level,
        m.is_public,
        m.audience_type,
        CASE
          WHEN mp.pre_assessment_score IS NOT NULL THEN 1
          ELSE 0
        END AS is_unlocked
      FROM modules m
      INNER JOIN organization_modules om
        ON om.module_id = m.id
      LEFT JOIN module_progress mp
        ON mp.module_id = m.id
        AND mp.student_id = ?
      WHERE om.organization_id = ?
        AND m.is_public = 0
        AND m.audience_type = 'organization'
      ORDER BY m.id ASC
      `,
      [studentId, organizationId]
    );

    const [topics] = await pool.query(
      `
      SELECT
        t.id,
        t.module_id,
        t.title,
        t.description,
        t.explanation_english,
        t.video_url,
        t.sort_order
      FROM topics t
      INNER JOIN modules m
        ON m.id = t.module_id
      INNER JOIN organization_modules om
        ON om.module_id = m.id
      WHERE om.organization_id = ?
        AND m.is_public = 0
        AND m.audience_type = 'organization'
      ORDER BY t.module_id ASC, t.sort_order ASC
      `,
      [organizationId]
    );

    const moduleMap = {};

    modules.forEach((m) => {
      moduleMap[m.id] = {
        id: m.id,
        title: m.title,
        description: m.description,
        key_points: m.key_points,
        closing_summary: m.closing_summary,
        level: m.level,
        is_public: Number(m.is_public),
        audience_type: m.audience_type,
        is_unlocked: Number(m.is_unlocked),
        topics: [],
      };
    });

    topics.forEach((t) => {
      if (moduleMap[t.module_id]) {
        moduleMap[t.module_id].topics.push({
          id: t.id,
          title: t.title,
          description: t.description,
          explanation_english: t.explanation_english,
          video_url: t.video_url,
          sort_order: t.sort_order,
        });
      }
    });

    return res.json({
      success: true,
      data: Object.values(moduleMap),
    });
  } catch (err) {
    console.error("GET PREMIUM MODULES ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/* ===============================
   GET MODULE BY ID
================================ */
const getModuleById = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user?.id || 0;
    const user = req.user || {};

    const { whereSql, params } = buildModuleAccessFilter(user);

    const [rows] = await pool.query(
      `
      SELECT DISTINCT
        m.*,
        CASE
          WHEN mp.pre_assessment_score IS NOT NULL THEN 1
          ELSE 0
        END AS is_unlocked
      FROM modules m
      LEFT JOIN module_progress mp
        ON mp.module_id = m.id
        AND mp.student_id = ?
      LEFT JOIN organization_modules om
        ON om.module_id = m.id
      WHERE m.id = ?
        AND ${whereSql}
      LIMIT 1
      `,
      [studentId, id, ...params]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Module not found or access denied",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error("GET MODULE BY ID ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/* ===============================
   UPDATE MODULE
================================ */
const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, key_points, closing_summary, level } = req.body;

    const [existingRows] = await pool.query(
      `
      SELECT id, is_public, audience_type
      FROM modules
      WHERE id = ?
      `,
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Module not found",
      });
    }

    const moduleRow = existingRows[0];

    if (
      Number(moduleRow.is_public || 0) === 1 &&
      moduleRow.audience_type === "general"
    ) {
      return res.status(403).json({
        success: false,
        error: "General static modules cannot be updated",
      });
    }

    const allowedLevels = ["basic", "intermediate", "advanced"];
    const finalLevel = allowedLevels.includes(level) ? level : "basic";

    await pool.query(
      `
      UPDATE modules
      SET
        title = ?,
        description = ?,
        key_points = ?,
        closing_summary = ?,
        level = ?
      WHERE id = ?
      `,
      [
        title,
        description || null,
        key_points || null,
        closing_summary || null,
        finalLevel,
        id,
      ]
    );

    return res.json({
      success: true,
      data: { message: "Module updated" },
    });
  } catch (err) {
    console.error("UPDATE MODULE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/* ===============================
   DELETE MODULE
================================ */
const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingRows] = await pool.query(
      `
      SELECT id, is_public, audience_type
      FROM modules
      WHERE id = ?
      `,
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Module not found",
      });
    }

    const moduleRow = existingRows[0];

    if (
      Number(moduleRow.is_public || 0) === 1 &&
      moduleRow.audience_type === "general"
    ) {
      return res.status(403).json({
        success: false,
        error: "General static modules cannot be deleted",
      });
    }

    const [[assignmentRow]] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM organization_modules
      WHERE module_id = ?
      `,
      [id]
    );

    if (Number(assignmentRow.total || 0) > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete module because it is assigned to organization(s)",
      });
    }

    const [[topicRow]] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM topics
      WHERE module_id = ?
      `,
      [id]
    );

    if (Number(topicRow.total || 0) > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete module because it already has topics",
      });
    }

    await pool.query(`DELETE FROM modules WHERE id = ?`, [id]);

    return res.json({
      success: true,
      data: { message: "Module deleted" },
    });
  } catch (err) {
    console.error("DELETE MODULE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/* ===============================
   CREATE TOPIC
================================ */
const createTopic = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const {
      title,
      description,
      explanation_english = null,
      sort_order = 1,
      video_url = null,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "title is required",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO topics (
        module_id,
        title,
        description,
        explanation_english,
        sort_order,
        video_url
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        moduleId,
        title.trim(),
        description || null,
        explanation_english || null,
        Number(sort_order) || 1,
        video_url || null,
      ]
    );

    return res.status(201).json({
      success: true,
      data: {
        message: "Topic created",
        topic_id: result.insertId,
      },
    });
  } catch (err) {
    console.error("CREATE TOPIC ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/* ===============================
   GET TOPICS BY MODULE
================================ */
const getTopicsByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const user = req.user || {};

    const { whereSql, params } = buildModuleAccessFilter(user);

    const [rows] = await pool.query(
      `
      SELECT
        t.id,
        t.module_id,
        t.title,
        t.description,
        t.explanation_english,
        t.video_url,
        t.sort_order
      FROM topics t
      INNER JOIN modules m
        ON m.id = t.module_id
      LEFT JOIN organization_modules om
        ON om.module_id = m.id
      WHERE t.module_id = ?
        AND ${whereSql}
      ORDER BY t.sort_order ASC
      `,
      [moduleId, ...params]
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("GET TOPICS ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/* ===============================
   GET TOPIC PROGRESS
================================ */
const getTopicProgress = async (req, res) => {
  try {
    const studentId = req.user?.id;

    const [[totals]] = await pool.query(
      `SELECT COUNT(*) AS totalTopics FROM topics`
    );

    if (!studentId) {
      return res.json({
        success: true,
        data: {
          total: totals.totalTopics || 0,
          completed: 0,
          nextTopic: null,
        },
      });
    }

    const [[completedRow]] = await pool.query(
      `
      SELECT COUNT(*) AS completed
      FROM topic_progress
      WHERE student_id = ? AND status = 'completed'
      `,
      [studentId]
    );

    const [nextRows] = await pool.query(
      `
      SELECT
        t.id,
        t.title,
        m.title AS moduleName
      FROM topics t
      JOIN modules m
        ON m.id = t.module_id
      LEFT JOIN topic_progress tp
        ON tp.topic_id = t.id
        AND tp.student_id = ?
      WHERE COALESCE(tp.status, 'not_started') <> 'completed'
      ORDER BY t.module_id ASC, t.sort_order ASC
      LIMIT 1
      `,
      [studentId]
    );

    return res.json({
      success: true,
      data: {
        total: totals.totalTopics || 0,
        completed: completedRow.completed || 0,
        nextTopic: nextRows[0] || null,
      },
    });
  } catch (err) {
    console.error("GET TOPIC PROGRESS ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/* ===============================
   GET SINGLE TOPIC PROGRESS
================================ */
const getSingleTopicProgress = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { topicId } = req.params;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        status,
        video_completed,
        text_completed,
        text_completed_at,
        best_quiz_score,
        simulations_completed
      FROM topic_progress
      WHERE student_id = ? AND topic_id = ?
      `,
      [studentId, topicId]
    );

    const row = rows[0];

    if (!row) {
      return res.json({
        success: true,
        data: {
          video_completed: 0,
          text_completed: 0,
          text_completed_at: null,
          quiz_completed: 0,
          simulation1_completed: 0,
          simulation2_completed: 0,
          completed: 0,
        },
      });
    }

    return res.json({
      success: true,
      data: {
        video_completed: Number(row.video_completed || 0),
        text_completed: Number(row.text_completed || 0),
        text_completed_at: row.text_completed_at || null,
        quiz_completed: Number(row.best_quiz_score || 0) > 0 ? 1 : 0,
        simulation1_completed:
          Number(row.simulations_completed || 0) >= 1 ? 1 : 0,
        simulation2_completed:
          Number(row.simulations_completed || 0) >= 2 ? 1 : 0,
        completed: row.status === "completed" ? 1 : 0,
      },
    });
  } catch (err) {
    console.error("GET SINGLE TOPIC PROGRESS ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/* ===============================
   CREATE TOPIC BY MODULE
================================ */
const createTopicByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const {
      title,
      description,
      explanation_english = null,
      sort_order = 1,
      video_url = null,
    } = req.body;

    if (!moduleId) {
      return res.status(400).json({
        success: false,
        error: "moduleId is required",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "title is required",
      });
    }

    const [moduleRows] = await pool.query(
      `
      SELECT id, is_public, audience_type
      FROM modules
      WHERE id = ?
      LIMIT 1
      `,
      [moduleId]
    );

    if (moduleRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Module not found",
      });
    }

    const moduleRow = moduleRows[0];

    if (
      Number(moduleRow.is_public || 0) === 1 &&
      moduleRow.audience_type === "general"
    ) {
      return res.status(403).json({
        success: false,
        error: "Cannot add topic to general static module",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO topics (
        module_id,
        title,
        description,
        explanation_english,
        sort_order,
        video_url
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        Number(moduleId),
        title.trim(),
        description || null,
        explanation_english || null,
        Number(sort_order) || 1,
        video_url || null,
      ]
    );

    return res.status(201).json({
      success: true,
      data: {
        message: "Topic created successfully",
        topic_id: result.insertId,
      },
    });
  } catch (err) {
    console.error("CREATE TOPIC BY MODULE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/* ===============================
   UPDATE TOPIC
================================ */
const updateTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const {
      title,
      description,
      explanation_english = null,
      sort_order = 1,
      video_url = null,
    } = req.body;

    if (!topicId) {
      return res.status(400).json({
        success: false,
        error: "topicId is required",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "title is required",
      });
    }

    const [topicRows] = await pool.query(
      `
      SELECT
        t.id,
        t.module_id,
        m.is_public,
        m.audience_type
      FROM topics t
      JOIN modules m ON m.id = t.module_id
      WHERE t.id = ?
      LIMIT 1
      `,
      [topicId]
    );

    if (topicRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Topic not found",
      });
    }

    const topicRow = topicRows[0];

    if (
      Number(topicRow.is_public || 0) === 1 &&
      topicRow.audience_type === "general"
    ) {
      return res.status(403).json({
        success: false,
        error: "Cannot update topic from general static module",
      });
    }

    await pool.query(
      `
      UPDATE topics
      SET
        title = ?,
        description = ?,
        explanation_english = ?,
        sort_order = ?,
        video_url = ?
      WHERE id = ?
      `,
      [
        title.trim(),
        description || null,
        explanation_english || null,
        Number(sort_order) || 1,
        video_url || null,
        Number(topicId),
      ]
    );

    return res.json({
      success: true,
      data: {
        message: "Topic updated successfully",
      },
    });
  } catch (err) {
    console.error("UPDATE TOPIC ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/* ===============================
   DELETE TOPIC
================================ */
const deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    if (!topicId) {
      return res.status(400).json({
        success: false,
        error: "topicId is required",
      });
    }

    const [topicRows] = await pool.query(
      `
      SELECT
        t.id,
        t.module_id,
        m.is_public,
        m.audience_type
      FROM topics t
      JOIN modules m ON m.id = t.module_id
      WHERE t.id = ?
      LIMIT 1
      `,
      [topicId]
    );

    if (topicRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Topic not found",
      });
    }

    const topicRow = topicRows[0];

    if (
      Number(topicRow.is_public || 0) === 1 &&
      topicRow.audience_type === "general"
    ) {
      return res.status(403).json({
        success: false,
        error: "Cannot delete topic from general static module",
      });
    }

    await pool.query(`DELETE FROM topics WHERE id = ?`, [Number(topicId)]);

    return res.json({
      success: true,
      data: {
        message: "Topic deleted successfully",
      },
    });
  } catch (err) {
    console.error("DELETE TOPIC ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/* ===============================
   SUBMIT GENERAL MODULE PRE-ASSESSMENT
================================ */
const submitModulePreAssessment = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { moduleId } = req.params;
    const { score = 0 } = req.body;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const numericModuleId = Number(moduleId);
    const numericScore = Number(score || 0);

    if (!Number.isInteger(numericModuleId) || numericModuleId <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid module id",
      });
    }

    const [moduleRows] = await pool.query(
      `
      SELECT id, is_public, audience_type
      FROM modules
      WHERE id = ?
      LIMIT 1
      `,
      [numericModuleId]
    );

    if (moduleRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Module not found",
      });
    }

    const moduleRow = moduleRows[0];

    const isGeneralModule =
      Number(moduleRow.is_public || 0) === 1 &&
      moduleRow.audience_type === "general";

    if (!isGeneralModule) {
      return res.status(403).json({
        success: false,
        error: "This route is only for general module pre-assessment",
      });
    }

    await pool.query(
      `
      INSERT INTO module_progress (student_id, module_id, pre_assessment_score)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
      pre_assessment_score = GREATEST(
        COALESCE(pre_assessment_score, 0),
        VALUES(pre_assessment_score)
      )
      `,
      [studentId, numericModuleId, numericScore]
    );

    return res.json({
      success: true,
      data: {
        message: "Pre-assessment submitted and module unlocked",
      },
    });
  } catch (err) {
    console.error("SUBMIT MODULE PRE-ASSESSMENT ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = {
  createModule,
  getModules,
  getGeneralModules,
  getPremiumModules,
  getModuleById,
  updateModule,
  deleteModule,
  createTopic,
  getTopicsByModule,
  getTopicProgress,
  getSingleTopicProgress,
  createTopicByModule,
  updateTopic,
  deleteTopic,
  submitModulePreAssessment,
};