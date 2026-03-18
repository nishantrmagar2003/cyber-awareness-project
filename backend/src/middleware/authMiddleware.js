// src/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const { pool } = require("../config/db"); // ✅ NEW: database check

/* =====================================================
   VERIFY ACCESS TOKEN
   - Checks Bearer token
   - Validates JWT
   - Confirms user still exists in DB
   - Confirms account is active
   - Attaches user to req.user
===================================================== */
const verifyToken = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    // 1️⃣ Check header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // 2️⃣ Must be Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    // 3️⃣ Extract token
    const token = authHeader.split(" ")[1];

    // 4️⃣ Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // 5️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 6️⃣ 🔐 Fetch latest user from database (SECURITY UPGRADE)
    const [users] = await pool.query(
      `SELECT id, role, organization_id, account_type, status
       FROM users
       WHERE id = ?`,
      [decoded.id]
    );

    // 7️⃣ Check user exists
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    // 8️⃣ Check account status
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account inactive",
      });
    }

    // 9️⃣ Attach safe user object
    req.user = {
      id: user.id,
      role: user.role,
      organization_id: user.organization_id || null,
      account_type: user.account_type || "general",
      status: user.status
    };

    next();

  } catch (error) {

    console.error("JWT Verification Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });

  }
};

/* =====================================================
   ROLE AUTHORIZATION (Optional Professional Layer)
   Example usage:
   router.post("/admin", verifyToken, requireRole("admin"), ...)
===================================================== */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
};