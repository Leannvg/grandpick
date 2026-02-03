import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAlert } from "../context/AlertContext.jsx";
import * as authServices from "../services/auth.services";
import PasswordInput from "../components/PasswordInput.jsx";

function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function onSubmit(e) {
    e.preventDefault();

    if (!password || !confirmPassword) {
      showAlert("Completá ambos campos", "danger", true);
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Las contraseñas no coinciden", "danger", true);
      return;
    }

    setLoading(true);

    authServices
      .resetPassword(token, password)
      .then(() => {
        showAlert("Contraseña actualizada correctamente", "success", false);
        navigate("/login");
      })
      .catch((err) => {
        showAlert(err.message, "danger", true);
      })
      .finally(() => setLoading(false));
  }

  if (!token) {
    return <p>Token inválido o inexistente</p>;
  }

  return (
    <div className="container mt-5">
      <h1>Restablecer contraseña</h1>

      <form onSubmit={onSubmit}>
        <PasswordInput
          label="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <PasswordInput
          label="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button className="btn btn-success" disabled={loading}>
          {loading ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
