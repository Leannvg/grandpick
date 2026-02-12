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
    <div className="container mt-5">
      <h1>Recuperar contraseña</h1>

      <form onSubmit={onSubmit} className="mt-4">
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              Enviando...
            </>
          ) : (
            "Enviar"
          )}
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
