const { pool } = require("../config/db");
const bcrypt = require("bcrypt");

/* =====================================
   SUPERADMIN CREATES ORGANIZATION
===================================== */
exports.createOrganization = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({
        error: "Only superadmin can create organizations"
      });
    }

    const { name, industry } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Organization name is required"
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM organizations WHERE name = ?",
      [name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Organization already exists"
      });
    }

    const [result] = await pool.query(
      "INSERT INTO organizations (name, industry, status, created_at) VALUES (?, ?, 'active', NOW())",
      [name, industry || null]
    );

    res.status(201).json({
      message: "Organization created successfully",
      organization_id: result.insertId
    });

  } catch (error) {
    console.error("CREATE ORG ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* =====================================
   SUPERADMIN CREATES ORGANIZATION ADMIN
===================================== */
exports.createOrganizationAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({
        error: "Only superadmin can create org admins"
      });
    }

    const { full_name, email, password, organization_id } = req.body;

    if (!full_name || !email || !password || !organization_id) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Email already exists"
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users
       (full_name, email, password_hash, role, account_type, organization_id, status, created_at)
       VALUES (?, ?, ?, 'org_admin', 'organization', ?, 'active', NOW())`,
      [full_name, email, password_hash, organization_id]
    );

    res.status(201).json({
      message: "Organization admin created successfully",
      user_id: result.insertId
    });

  } catch (error) {
    console.error("CREATE ORG ADMIN ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};