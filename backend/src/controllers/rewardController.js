const { pool } = require("../config/db");

/* ====================================================
   HELPERS
==================================================== */

function normalizeOptionalString(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

function normalizePositiveInt(value, fallback = 0) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0) return fallback;
  return num;
}

function validateBadgePayload(body = {}) {
  const name = String(body.name || "").trim();
  const description = normalizeOptionalString(body.description);
  const badge_type = normalizeOptionalString(body.badge_type);
  const reference_id = normalizeOptionalString(body.reference_id);
  const icon_name = normalizeOptionalString(body.icon_name);
  const theme_color = normalizeOptionalString(body.theme_color);
  const rarity = normalizeOptionalString(body.rarity);
  const title_text = normalizeOptionalString(body.title_text);
  const xp_reward = normalizePositiveInt(body.xp_reward, 0);
  const display_order = normalizePositiveInt(body.display_order, 0);

  let criteria_json = null;

  if (body.criteria_json !== undefined && body.criteria_json !== null && body.criteria_json !== "") {
    try {
      criteria_json =
        typeof body.criteria_json === "string"
          ? JSON.stringify(JSON.parse(body.criteria_json))
          : JSON.stringify(body.criteria_json);
    } catch (err) {
      return {
        ok: false,
        error: "criteria_json must be valid JSON",
      };
    }
  }

  if (!name) {
    return {
      ok: false,
      error: "name is required",
    };
  }

  return {
    ok: true,
    data: {
      name,
      description,
      badge_type,
      reference_id,
      icon_name,
      theme_color,
      rarity,
      title_text,
      xp_reward,
      display_order,
      criteria_json,
    },
  };
}

/* ====================================================
   STUDENT: GET OWN BADGES
   GET /api/rewards/badges
==================================================== */
exports.getStudentBadges = async (req, res) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [rows] = await pool.query(
      `
      SELECT
        sb.id AS student_badge_id,
        sb.awarded_at,
        b.id,
        b.name,
        b.description,
        b.criteria_json,
        b.created_at,
        b.badge_type,
        b.reference_id,
        b.icon_name,
        b.theme_color,
        b.rarity,
        b.title_text,
        b.xp_reward,
        b.display_order
      FROM student_badges sb
      JOIN badges b ON sb.badge_id = b.id
      WHERE sb.student_id = ?
      ORDER BY b.display_order ASC, sb.awarded_at DESC
      `,
      [studentId]
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("GET STUDENT BADGES ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* ====================================================
   SUPERADMIN: GET ALL BADGES
   GET /api/rewards/admin/badges
==================================================== */
exports.getAdminBadges = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        b.id,
        b.name,
        b.description,
        b.criteria_json,
        b.created_at,
        b.badge_type,
        b.reference_id,
        b.icon_name,
        b.theme_color,
        b.rarity,
        b.title_text,
        b.xp_reward,
        b.display_order,
        COUNT(sb.id) AS awarded_count
      FROM badges b
      LEFT JOIN student_badges sb ON sb.badge_id = b.id
      GROUP BY
        b.id,
        b.name,
        b.description,
        b.criteria_json,
        b.created_at,
        b.badge_type,
        b.reference_id,
        b.icon_name,
        b.theme_color,
        b.rarity,
        b.title_text,
        b.xp_reward,
        b.display_order
      ORDER BY b.display_order ASC, b.id DESC
      `
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("GET ADMIN BADGES ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* ====================================================
   SUPERADMIN: CREATE BADGE
   POST /api/rewards/admin/badges
==================================================== */
exports.createBadge = async (req, res) => {
  try {
    const validated = validateBadgePayload(req.body);

    if (!validated.ok) {
      return res.status(400).json({ error: validated.error });
    }

    const {
      name,
      description,
      badge_type,
      reference_id,
      icon_name,
      theme_color,
      rarity,
      title_text,
      xp_reward,
      display_order,
      criteria_json,
    } = validated.data;

    const [result] = await pool.query(
      `
      INSERT INTO badges
      (
        name,
        description,
        criteria_json,
        badge_type,
        reference_id,
        icon_name,
        theme_color,
        rarity,
        title_text,
        xp_reward,
        display_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        description,
        criteria_json,
        badge_type,
        reference_id,
        icon_name,
        theme_color,
        rarity,
        title_text,
        xp_reward,
        display_order,
      ]
    );

    return res.status(201).json({
      success: true,
      data: {
        message: "Badge created successfully",
        badge_id: result.insertId,
      },
    });
  } catch (err) {
    console.error("CREATE BADGE ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* ====================================================
   SUPERADMIN: UPDATE BADGE
   PUT /api/rewards/admin/badges/:badgeId
==================================================== */
exports.updateBadge = async (req, res) => {
  try {
    const badgeId = Number(req.params.badgeId);

    if (!badgeId) {
      return res.status(400).json({ error: "Invalid badgeId" });
    }

    const validated = validateBadgePayload(req.body);

    if (!validated.ok) {
      return res.status(400).json({ error: validated.error });
    }

    const [existingRows] = await pool.query(
      `
      SELECT id
      FROM badges
      WHERE id = ?
      LIMIT 1
      `,
      [badgeId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: "Badge not found" });
    }

    const {
      name,
      description,
      badge_type,
      reference_id,
      icon_name,
      theme_color,
      rarity,
      title_text,
      xp_reward,
      display_order,
      criteria_json,
    } = validated.data;

    await pool.query(
      `
      UPDATE badges
      SET
        name = ?,
        description = ?,
        criteria_json = ?,
        badge_type = ?,
        reference_id = ?,
        icon_name = ?,
        theme_color = ?,
        rarity = ?,
        title_text = ?,
        xp_reward = ?,
        display_order = ?
      WHERE id = ?
      `,
      [
        name,
        description,
        criteria_json,
        badge_type,
        reference_id,
        icon_name,
        theme_color,
        rarity,
        title_text,
        xp_reward,
        display_order,
        badgeId,
      ]
    );

    return res.json({
      success: true,
      data: {
        message: "Badge updated successfully",
      },
    });
  } catch (err) {
    console.error("UPDATE BADGE ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* ====================================================
   SUPERADMIN: DELETE BADGE
   DELETE /api/rewards/admin/badges/:badgeId
==================================================== */
exports.deleteBadge = async (req, res) => {
  try {
    const badgeId = Number(req.params.badgeId);

    if (!badgeId) {
      return res.status(400).json({ error: "Invalid badgeId" });
    }

    const [existingRows] = await pool.query(
      `
      SELECT id
      FROM badges
      WHERE id = ?
      LIMIT 1
      `,
      [badgeId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: "Badge not found" });
    }

    const [awardedRows] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM student_badges
      WHERE badge_id = ?
      `,
      [badgeId]
    );

    const awardedCount = Number(awardedRows[0]?.total || 0);

    if (awardedCount > 0) {
      return res.status(400).json({
        error: "Cannot delete badge because it has already been awarded to students",
      });
    }

    await pool.query(
      `
      DELETE FROM badges
      WHERE id = ?
      `,
      [badgeId]
    );

    return res.json({
      success: true,
      data: {
        message: "Badge deleted successfully",
      },
    });
  } catch (err) {
    console.error("DELETE BADGE ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};