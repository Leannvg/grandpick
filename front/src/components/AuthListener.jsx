import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../context/AlertContext";

export default function AuthListener() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {

    const handler = () => {
      showAlert(
        "Tenés que iniciar sesión para acceder a esta página.",
        "warning",
        false
      );

      navigate("/login", { replace: true });
    };

    window.addEventListener("auth:logout", handler);

    return () => {
      window.removeEventListener("auth:logout", handler);
    };
  }, [navigate, showAlert]);

  return null;
}
