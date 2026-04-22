import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireOrg({ children }) {
  const { loading, isAuthenticated, user, orgId } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // superadmin can pass
  if (user.role === "superadmin") {
    return children;
  }

  // only org-based roles should pass
  if (
    (user.role === "org_admin" || user.role === "org_student") &&
    orgId
  ) {
    return children;
  }

  return <Navigate to="/" replace />;
}