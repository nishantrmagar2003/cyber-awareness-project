import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireRole({ children, role }) {
  const { loading, isAuthenticated, user } = useAuth();

  // ⏳ Wait for auth to load
  if (loading) {
    return <p>Loading...</p>;
  }

  // 🔒 Not logged in
  if (!isAuthenticated || !user?.role) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Allowed roles (array or single)
  const allowedRoles = Array.isArray(role) ? role : [role];

  // 🔍 Debug (optional)
  console.log("USER ROLE:", user.role);
  console.log("ALLOWED ROLES:", allowedRoles);

  // 🚫 Access denied
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Access granted
  return children;
}