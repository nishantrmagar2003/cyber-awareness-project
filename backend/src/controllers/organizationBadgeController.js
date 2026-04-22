const { pool } = require("../config/db");

/* ===============================
   GET BADGE STATS FOR SUPERADMIN
=============================== */
exports.getBadgeStats = async (req, res) => {
  try {
    const [generalEarnedRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM student_badges"
    );

    const [orgEarnedRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM student_organization_badges"
    );

    const [orgDefinitionRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM organization_badges"
    );

    return res.json({
      success: true,
      data: {
        totalGeneralEarnedBadges: generalEarnedRows[0]?.total || 0,
        totalOrgEarnedBadges: orgEarnedRows[0]?.total || 0,
        totalOrgBadgeDefinitions: orgDefinitionRows[0]?.total || 0,
        totalEarnedBadges:
          (generalEarnedRows[0]?.total || 0) +
          (orgEarnedRows[0]?.total || 0),
      },
    });
  } catch (error) {
    console.error("getBadgeStats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch badge stats",
    });
  }
};

/* ===============================
   GET ALL ORG BADGES FOR SUPERADMIN
=============================== */
exports.getAllOrganizationBadges = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        ob.id,
        ob.organization_id,
        ob.module_id,
        ob.topic_id,
        ob.name,
        ob.subtitle,
        ob.description,
        ob.icon_name,
        ob.theme_color,
        ob.rarity,
        ob.xp_reward,
        ob.display_order,
        ob.badge_scope,
        ob.rule_type,
        ob.min_quiz_score,
        ob.require_simulation_1,
        ob.require_simulation_2,
        ob.is_active,
        ob.created_by,
        ob.created_at,
        ob.updated_at,
        o.name AS organization_name,
        m.title AS module_name,
        t.title AS topic_name,
        COUNT(sob.id) AS earned_count
      FROM organization_badges ob
      LEFT JOIN organizations o ON o.id = ob.organization_id
      LEFT JOIN modules m ON m.id = ob.module_id
      LEFT JOIN topics t ON t.id = ob.topic_id
      LEFT JOIN student_organization_badges sob
        ON sob.organization_badge_id = ob.id
      GROUP BY
        ob.id,
        ob.organization_id,
        ob.module_id,
        ob.topic_id,
        ob.name,
        ob.subtitle,
        ob.description,
        ob.icon_name,
        ob.theme_color,
        ob.rarity,
        ob.xp_reward,
        ob.display_order,
        ob.badge_scope,
        ob.rule_type,
        ob.min_quiz_score,
        ob.require_simulation_1,
        ob.require_simulation_2,
        ob.is_active,
        ob.created_by,
        ob.created_at,
        ob.updated_at,
        o.name,
        m.title,
        t.title
      ORDER BY ob.display_order ASC, ob.created_at DESC
    `);

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("getAllOrganizationBadges error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch organization badges",
    });
  }
};

/* ===============================
   CREATE ORG BADGE
   SIMPLE VERSION:
   - superadmin selects name
   - subtitle
   - description
   - module
   - topic optional
   - icon
   - color
   - rarity
   - xp reward
=============================== */
exports.createOrganizationBadge = async (req, res) => {
  try {
    const {
      module_id,
      topic_id,
      name,
      subtitle,
      description,
      icon_name,
      theme_color,
      rarity,
      xp_reward,
      display_order,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Badge name is required",
      });
    }

    if (!module_id) {
      return res.status(400).json({
        success: false,
        message: "Module is required",
      });
    }

    const parsedModuleId = Number(module_id);
    const parsedTopicId = topic_id ? Number(topic_id) : null;
    const parsedXpReward = xp_reward !== undefined ? Number(xp_reward) : 50;
    const parsedDisplayOrder =
      display_order !== undefined ? Number(display_order) : 0;

    if (!Number.isInteger(parsedModuleId) || parsedModuleId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid module is required",
      });
    }

    if (
      parsedTopicId !== null &&
      (!Number.isInteger(parsedTopicId) || parsedTopicId <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Topic must be a valid ID",
      });
    }

    if (
      Number.isNaN(parsedXpReward) ||
      parsedXpReward < 0 ||
      parsedXpReward > 10000
    ) {
      return res.status(400).json({
        success: false,
        message: "XP reward must be between 0 and 10000",
      });
    }

    if (Number.isNaN(parsedDisplayOrder) || parsedDisplayOrder < 0) {
      return res.status(400).json({
        success: false,
        message: "Display order must be 0 or more",
      });
    }

    const [moduleRows] = await pool.query(
      `
      SELECT id, title, audience_type
      FROM modules
      WHERE id = ?
      LIMIT 1
      `,
      [parsedModuleId]
    );

    if (!moduleRows.length) {
      return res.status(404).json({
        success: false,
        message: "Selected module not found",
      });
    }

    const module = moduleRows[0];

    if (module.audience_type !== "organization") {
      return res.status(400).json({
        success: false,
        message: "Only organization modules can have organization badges",
      });
    }

    let topic = null;

    if (parsedTopicId) {
      const [topicRows] = await pool.query(
        `
        SELECT id, title, module_id
        FROM topics
        WHERE id = ?
        LIMIT 1
        `,
        [parsedTopicId]
      );

      if (!topicRows.length) {
        return res.status(404).json({
          success: false,
          message: "Selected topic not found",
        });
      }

      topic = topicRows[0];

      if (Number(topic.module_id) !== parsedModuleId) {
        return res.status(400).json({
          success: false,
          message: "Selected topic does not belong to the selected module",
        });
      }
    }

    const [orgMapRows] = await pool.query(
      `
      SELECT organization_id
      FROM organization_modules
      WHERE module_id = ?
      ORDER BY organization_id ASC
      LIMIT 1
      `,
      [parsedModuleId]
    );

    const organizationId = orgMapRows[0]?.organization_id || null;

    const badgeScope = parsedTopicId ? "topic" : "module";
    const ruleType = parsedTopicId ? "topic_completed" : "module_completed";

    const [result] = await pool.query(
      `
      INSERT INTO organization_badges (
        organization_id,
        module_id,
        topic_id,
        name,
        subtitle,
        description,
        icon_name,
        theme_color,
        rarity,
        xp_reward,
        display_order,
        badge_scope,
        rule_type,
        min_quiz_score,
        require_simulation_1,
        require_simulation_2,
        is_active,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        organizationId,
        parsedModuleId,
        parsedTopicId,
        String(name).trim(),
        subtitle ? String(subtitle).trim() : null,
        description ? String(description).trim() : null,
        icon_name || "shield-check",
        theme_color || "blue",
        rarity || "common",
        parsedXpReward,
        parsedDisplayOrder,
        badgeScope,
        ruleType,
        70,
        1,
        1,
        1,
        req.user.id,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Organization badge created successfully",
      data: {
        id: result.insertId,
      },
    });
  } catch (error) {
    console.error("createOrganizationBadge error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create organization badge",
    });
  }
};

/* ===============================
   GET MY ORG BADGES FOR ORG STUDENT
=============================== */
exports.getMyOrganizationBadges = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        sob.id AS student_badge_id,
        sob.awarded_at,
        ob.id AS badge_id,
        ob.organization_id,
        ob.module_id,
        ob.topic_id,
        ob.name,
        ob.subtitle,
        ob.description,
        ob.icon_name,
        ob.theme_color,
        ob.rarity,
        ob.xp_reward,
        ob.display_order,
        ob.badge_scope,
        ob.rule_type,
        ob.min_quiz_score,
        ob.require_simulation_1,
        ob.require_simulation_2,
        ob.is_active
      FROM student_organization_badges sob
      INNER JOIN organization_badges ob
        ON ob.id = sob.organization_badge_id
      WHERE sob.student_id = ?
      ORDER BY ob.display_order ASC, sob.awarded_at DESC
      `,
      [studentId]
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("getMyOrganizationBadges error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student organization badges",
    });
  }
};
/* ===============================
   GET GENERAL BADGES FOR SUPERADMIN
   READ ONLY LIST
=============================== */
exports.getGeneralBadgesList = async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT
          b.id,
          b.name,
          b.title_text,
          b.description,
          b.icon_name,
          b.theme_color,
          b.rarity,
          b.xp_reward,
          b.display_order,
          b.badge_type,
          b.reference_id,
          COUNT(sb.id) AS awarded_count
        FROM badges b
        LEFT JOIN student_badges sb
          ON sb.badge_id = b.id
        GROUP BY
          b.id,
          b.name,
          b.title_text,
          b.description,
          b.icon_name,
          b.theme_color,
          b.rarity,
          b.xp_reward,
          b.display_order,
          b.badge_type,
          b.reference_id
        ORDER BY b.display_order ASC, b.id ASC
      `);
  
      return res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error("getGeneralBadgesList error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch general badges list",
      });
    }
  };