/* =========================
   ROLE AUTHORIZATION
   FINAL STABLE VERSION
========================= */

const requireRole = (...allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    throw new Error("requireRole must be called with at least one role");
  }

  return (req, res, next) => {
    // Ensure authenticated user exists
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userRole = String(req.user.role).trim();

    // Direct role check only
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permission",
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
};