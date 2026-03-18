const { pool } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* =====================================
   LOGIN
===================================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [normalizedEmail]
    );

    // 🔐 Security upgrade: Do not reveal if user exists
    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    if (user.status === "inactive") {
      return res.status(403).json({ error: "Account is inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT secret not configured" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        organization_id: user.organization_id,
        account_type: user.account_type,
        status: user.status
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        role: user.role,
        account_type: user.account_type,
        organization_id: user.organization_id
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* =====================================
   REGISTER (GENERAL USERS ONLY)
===================================== */
exports.register = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const account_type = "general";
    const role = "general_user";
    const organization_id = null;

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users
       (full_name, email, phone, password_hash, role, account_type, organization_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [full_name, normalizedEmail, phone, password_hash, role, account_type, organization_id]
    );

    // 🔐 JWT Secret Safety Added
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT secret not configured" });
    }

    const token = jwt.sign(
      {
        id: result.insertId,
        role,
        organization_id,
        account_type,
        status: "active"
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "General user registered successfully",
      token,
      user: {
        id: result.insertId,
        full_name,
        role,
        account_type,
        organization_id
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* =====================================
   ORGANIZATION ADMIN CREATES ORG STUDENT
===================================== */
exports.createOrganizationStudent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 🔐 New safety: Check admin account status
    if (req.user.status !== "active") {
      return res.status(403).json({ error: "Account inactive" });
    }

    if (req.user.role !== "org_admin") {
      return res.status(403).json({
        error: "Only organization admin can create organization students"
      });
    }

    if (req.user.account_type !== "organization") {
      return res.status(403).json({
        error: "Only organization accounts allowed"
      });
    }

    if (!req.user.organization_id) {
      return res.status(403).json({
        error: "Admin not linked to organization"
      });
    }

    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users
       (full_name, email, password_hash, role, account_type, organization_id, status, created_at)
       VALUES (?, ?, ?, 'org_student', 'organization', ?, 'active', NOW())`,
      [full_name, normalizedEmail, password_hash, req.user.organization_id]
    );

    res.status(201).json({
      message: "Organization student created successfully",
      user_id: result.insertId
    });

  } catch (error) {
    console.error("ORG STUDENT ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};