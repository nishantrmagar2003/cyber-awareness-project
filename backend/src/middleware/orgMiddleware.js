const { pool } = require("../config/db");

/**
 * Attach organization scope
 * - superadmin => access all
 * - org_admin / org_student => restricted to their organization
 * - general_user => forbidden (no org access)
 */
exports.attachOrgScope = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Superadmin can access everything
  if (user.role === "superadmin") {
    req.orgScope = { mode: "all" };
    return next();
  }

  // General users should NOT use organization routes
  if (user.role === "general_user") {
    return res.status(403).json({
      error: "General users cannot access organization resources"
    });
  }

  // Org-based roles must have organization_id
  if (!user.organization_id) {
    return res.status(403).json({
      error: "No organization assigned"
    });
  }

  req.orgScope = {
    mode: "org",
    organization_id: user.organization_id
  };

  next();
};


/**
 * Prevent cross-organization update/delete
 */
exports.requireResourceOrg = (tableName) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Superadmin bypass
      if (user.role === "superadmin") {
        return next();
      }

      // General users cannot access org resources
      if (user.role === "general_user") {
        return res.status(403).json({
          error: "Access denied"
        });
      }

      const { id } = req.params;

      const [rows] = await pool.query(
        `SELECT organization_id FROM ${tableName} WHERE id = ? LIMIT 1`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Resource not found" });
      }

      if (rows[0].organization_id !== user.organization_id) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();

    } catch (err) {
      console.error("ORG MIDDLEWARE ERROR:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};