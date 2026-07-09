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
    <div className="reset-password-page page-wrapper">
      <section className="auth-section page-section container text-center">
        <div className="auth-container">
          <header className="page-header">
            <h1 className="section-title">RESTABLECER CONTRASEÑA</h1>
            <p className="section-subtitle">Ingresa tu nueva contraseña</p>
          </header>

          <form onSubmit={onSubmit} className="auth-form mt-4">
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

            <button className="gp-btn-submit w-100 mt-4" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Actualizando...
                </>
              ) : (
                "Actualizar contraseña"
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default ResetPassword;
