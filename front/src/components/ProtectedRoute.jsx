import { Navigate } from "react-router-dom";
import { useAlert } from "../context/AlertContext";
import UsersServices from "../services/users.services.js";

/* export default async function ProtectedRoute({ children, adminOnly = false }) {
    const { showAlert } = useAlert();
    const token = localStorage.getItem("auth-token");
    const perfil = await UsersServices.getUserProfile();
    const rol = perfil.rol;

    if (!token) {
        showAlert(
            "Tenés que iniciar sesión para acceder a esta página.",
            "warning",
            false
        );
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && rol !== "admin") {
        showAlert(
            "No tenés permisos para acceder a esta sección.",
            "error",
            false
        );
        return <Navigate to="/" replace />;
    }

    return children;
} */

export default function ProtectedRoute({
  children,
  isAuthenticated,
  isAdmin = false,
  adminOnly = false,
}) {

     const { showAlert } = useAlert();

  if (!isAuthenticated) {
    showAlert(
        "Tenés que iniciar sesión para acceder a esta página.",
        "warning",
        false
    );
    return <Navigate to="/login" replace />;
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