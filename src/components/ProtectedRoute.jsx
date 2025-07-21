import { Navigate, useLocation } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { user, token, loading } = useUserContext();

  const currentRole = location.pathname.includes("staff") ? "staff" : "student";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-600 dark:text-gray-300">
        Loading dashboard...
      </div>
    );
  }

  if (!token || user?.role !== currentRole) {
    return <Navigate to={`/${currentRole}/login`} replace />;
  }

  return children;
}
