const { pool } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cleanTextInput = (value = "") => {
  return String(value).trim();
};

const hasUnsafeProfileInput = (value = "") => {
  const input = String(value);

  return /<[^>]*>|javascript:|data:text\/html|vbscript:|on\w+\s*=/i.test(input);
};

const isValidEmail = (value = "") => {
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
};

const isValidProfileName = (value = "") => {
  return /^[a-zA-Z\s.'-]+$/.test(value);
};

const isValidPhoneNumber = (value = "") => {
  return /^[0-9+\-\s]+$/.test(value);
};

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
        status: user.status,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        account_type: user.account_type,
        organization_id: user.organization_id,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
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
      [full_name, normalizedEmail, phone || null, password_hash, role, account_type, organization_id]
    );

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT secret not configured" });
    }

    const token = jwt.sign(
      {
        id: result.insertId,
        role,
        organization_id,
        account_type,
        status: "active",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "General user registered successfully",
      token,
      user: {
        id: result.insertId,
        full_name,
        email: normalizedEmail,
        phone: phone || "",
        role,
        account_type,
        organization_id,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
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

    if (req.user.status !== "active") {
      return res.status(403).json({ error: "Account inactive" });
    }

    if (req.user.role !== "org_admin") {
      return res.status(403).json({
        error: "Only organization admin can create organization students",
      });
    }

    if (req.user.account_type !== "organization") {
      return res.status(403).json({
        error: "Only organization accounts allowed",
      });
    }

    if (!req.user.organization_id) {
      return res.status(403).json({
        error: "Admin not linked to organization",
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

    return res.status(201).json({
      message: "Organization student created successfully",
      user_id: result.insertId,
    });
  } catch (error) {
    console.error("ORG STUDENT ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================
   GET CURRENT PROFILE
===================================== */
exports.getMe = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [rows] = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        role,
        account_type,
        organization_id,
        status,
        created_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];

    return res.json({
      success: true,
      data: {
        id: user.id,
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role,
        account_type: user.account_type,
        organization_id: user.organization_id,
        status: user.status,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================
   UPDATE CURRENT PROFILE
===================================== */
exports.updateMe = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { full_name, email, phone } = req.body;

    if (!full_name || !String(full_name).trim()) {
      return res.status(400).json({ error: "Full name is required" });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const normalizedEmail = cleanTextInput(email).toLowerCase();
    const normalizedFullName = cleanTextInput(full_name);
    const normalizedPhone = cleanTextInput(phone);
    
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }
    
    if (normalizedFullName.length > 100) {
      return res.status(400).json({
        error: "Full name must be less than 100 characters",
      });
    }
    
    if (normalizedPhone.length > 20) {
      return res.status(400).json({
        error: "Phone number must be less than 20 characters",
      });
    }
    
    if (!isValidProfileName(normalizedFullName)) {
      return res.status(400).json({
        error: "Full name contains invalid characters",
      });
    }
    
    if (!isValidPhoneNumber(normalizedPhone)) {
      return res.status(400).json({
        error: "Phone number contains invalid characters",
      });
    }
    
    if (
      hasUnsafeProfileInput(normalizedFullName) ||
      hasUnsafeProfileInput(normalizedEmail) ||
      hasUnsafeProfileInput(normalizedPhone)
    ) {
      return res.status(400).json({
        error: "Invalid input. HTML or script content is not allowed.",
      });
    }

    const [existingEmailRows] = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = ?
        AND id <> ?
      LIMIT 1
      `,
      [normalizedEmail, req.user.id]
    );

    if (existingEmailRows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    await pool.query(
      `
      UPDATE users
      SET full_name = ?, email = ?, phone = ?
      WHERE id = ?
      `,
      [normalizedFullName, normalizedEmail, normalizedPhone, req.user.id]
    );

    const [rows] = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        role,
        account_type,
        organization_id,
        status
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    const user = rows[0];

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role,
        account_type: user.account_type,
        organization_id: user.organization_id,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("UPDATE ME ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================
   CHANGE PASSWORD
===================================== */
exports.changePassword = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: "Current password, new password, and confirm password are required",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: "New password and confirm password do not match",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT id, password_hash
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const samePassword = await bcrypt.compare(newPassword, user.password_hash);

    if (samePassword) {
      return res.status(400).json({
        error: "New password must be different from current password",
      });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `
      UPDATE users
      SET password_hash = ?
      WHERE id = ?
      `,
      [password_hash, req.user.id]
    );

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================
   SUPERADMIN GET ALL USERS
===================================== */
exports.getAllUsersForSuperadmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({
        error: "Only superadmin can view all users",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.role,
        u.account_type,
        u.organization_id,
        u.status,
        u.created_at,
        o.name AS organization_name
      FROM users u
      LEFT JOIN organizations o
        ON o.id = u.organization_id
      ORDER BY u.created_at DESC, u.id DESC
      `
    );

    return res.json({
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        full_name: row.full_name || "User",
        email: row.email || "-",
        phone: row.phone || "-",
        role: row.role,
        account_type: row.account_type || "-",
        organization_id: row.organization_id,
        organization_name: row.organization_name || "-",
        status: row.status || "inactive",
        created_at: row.created_at,
      })),
    });
  } catch (error) {
    console.error("GET ALL USERS FOR SUPERADMIN ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};