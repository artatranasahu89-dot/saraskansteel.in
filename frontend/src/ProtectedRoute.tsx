import { Navigate } from "react-router-dom";

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "ADMIN") {
      return <Navigate to="/dashboard" replace />;
    }

    if (user.role === "STAFF") {
      return <Navigate to="/staff-dashboard" replace />;
    }

    if (user.role === "CUSTOMER") {
      return <Navigate to="/customer-dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;