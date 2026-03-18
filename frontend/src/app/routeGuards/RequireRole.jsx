import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { matchesRole } from "../../utils/roles";

export default function RequireRole({ children, role }) {
  const { role: authRole } = useAuth();

  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    storedUser = null;
  }

  const userRole = authRole || storedUser?.role;

  if (!userRole) {
    return null;
  }

  if (!matchesRole(userRole, role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
