/* =========================
   ROLE AUTHORIZATION
   Supports multiple roles
========================= */

const requireRole = (...allowedRoles) => {

  // Safety check: ensure roles were provided
  if (!allowedRoles || allowedRoles.length === 0) {
    throw new Error("requireRole must be called with at least one role");
  }

  return function (req, res, next) {

    // Ensure user exists
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check role match
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return next();
  };
};

module.exports = {
  requireRole
};