import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authServices from "../services/auth.services";
import { useAlert } from "../context/AlertContext.jsx";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const { showAlert } = useAlert();
  const navigate = useNavigate();

  function onSubmit(e) {
    e.preventDefault();

    if (!email) {
      showAlert("Ingresá un email", "danger", true);
      return;
    }

    setLoading(true);

    authServices
      .forgotPassword(email)
      .then(() => {
        showAlert(
          "Si el email existe, te enviamos un link para recuperar la contraseña.",
          "success",
          false
        );

        // Redirigir al login
        navigate("/login");
      })
      .catch(() => {
        showAlert("Error al procesar la solicitud", "danger", true);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="forgot-password-page page-wrapper">
      <section className="auth-section page-section container text-center">
        <div className="auth-container">
          <header className="page-header">
            <h1 className="section-title">RECUPERAR CONTRASEÑA</h1>
            <p className="section-subtitle">Te enviaremos un link para restablecerla</p>
          </header>

          <form onSubmit={onSubmit} className="auth-form mt-4">
            <div className="gp-input-group-container">
              <div className="gp-input-group">
                <label className="gp-input-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button className="gp-btn-submit w-100 mt-4" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Enviando...
                </>
              ) : (
                "Enviar Link"
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default ForgotPassword;
