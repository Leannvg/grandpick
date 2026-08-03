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

            <button className="submit-btn" type="submit" aria-label="Enviar Link" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon-submit">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default ForgotPassword;
