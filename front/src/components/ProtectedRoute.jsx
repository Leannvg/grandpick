import { Navigate, useLocation } from "react-router-dom";
import { useAlert } from "../context/AlertContext";
import UsersServices from "../services/users.services.js";

export default function ProtectedRoute({
  children,
  isAuthenticated,
  isAdmin = false,
  adminOnly = false,
}) {

  const { showAlert } = useAlert();
  const location = useLocation();

  if (!isAuthenticated) {
    showAlert(
      "Tenés que iniciar sesión para acceder a esta página.",
      "warning",
      false
    );
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (adminOnly && !isAdmin) {
    showAlert(
      "No tenés permisos para acceder a esta sección.",
      "error",
      false
    );
    return <Navigate to="/" replace />;
  }

  return children;
}