const { pool } = require("../config/db");

/* ===============================
   GET SYSTEM SETTINGS
=============================== */
exports.getSystemSettings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        platform_name,
        platform_email,
        max_organizations,
        max_students_per_org,
        session_timeout_minutes,
        maintenance_mode,
        email_notifications,
        two_factor_required,
        updated_by,
        updated_at
      FROM system_settings
      ORDER BY id ASC
      LIMIT 1
      `
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "System settings not found",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("getSystemSettings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch system settings",
    });
  }
};

/* ===============================
   UPDATE SYSTEM SETTINGS
=============================== */
exports.updateSystemSettings = async (req, res) => {
  try {
    const {
      platform_name,
      platform_email,
      max_organizations,
      max_students_per_org,
      session_timeout_minutes,
      maintenance_mode,
      email_notifications,
      two_factor_required,
    } = req.body;

    if (!platform_name || !String(platform_name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Platform name is required",
      });
    }

    if (!platform_email || !String(platform_email).trim()) {
      return res.status(400).json({
        success: false,
        message: "Platform email is required",
      });
    }

    const parsedMaxOrganizations = Number(max_organizations);
    const parsedMaxStudentsPerOrg = Number(max_students_per_org);
    const parsedSessionTimeout = Number(session_timeout_minutes);

    if (
      Number.isNaN(parsedMaxOrganizations) ||
      parsedMaxOrganizations < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Max organizations must be at least 1",
      });
    }

    if (
      Number.isNaN(parsedMaxStudentsPerOrg) ||
      parsedMaxStudentsPerOrg < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Max students per organization must be at least 1",
      });
    }

    if (
      Number.isNaN(parsedSessionTimeout) ||
      parsedSessionTimeout < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Session timeout must be at least 1 minute",
      });
    }

    const [existingRows] = await pool.query(
      `SELECT id FROM system_settings ORDER BY id ASC LIMIT 1`
    );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message: "System settings row not found",
      });
    }

    const settingsId = existingRows[0].id;

    await pool.query(
      `
      UPDATE system_settings
      SET
        platform_name = ?,
        platform_email = ?,
        max_organizations = ?,
        max_students_per_org = ?,
        session_timeout_minutes = ?,
        maintenance_mode = ?,
        email_notifications = ?,
        two_factor_required = ?,
        updated_by = ?
      WHERE id = ?
      `,
      [
        String(platform_name).trim(),
        String(platform_email).trim(),
        parsedMaxOrganizations,
        parsedMaxStudentsPerOrg,
        parsedSessionTimeout,
        maintenance_mode ? 1 : 0,
        email_notifications ? 1 : 0,
        two_factor_required ? 1 : 0,
        req.user.id,
        settingsId,
      ]
    );

    const [updatedRows] = await pool.query(
      `
      SELECT
        id,
        platform_name,
        platform_email,
        max_organizations,
        max_students_per_org,
        session_timeout_minutes,
        maintenance_mode,
        email_notifications,
        two_factor_required,
        updated_by,
        updated_at
      FROM system_settings
      WHERE id = ?
      LIMIT 1
      `,
      [settingsId]
    );

    return res.json({
      success: true,
      message: "System settings updated successfully",
      data: updatedRows[0],
    });
  } catch (error) {
    console.error("updateSystemSettings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update system settings",
    });
  }
};