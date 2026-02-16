import { useState } from "react";
import { Link } from "react-router-dom";
import * as authServices from "../services/auth.services.js";
import * as helpers from "../utils/helpers.js";
import { useAlert } from "./../context/AlertContext.jsx";
import { useDialog } from "./../context/DialogContext.jsx";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorsForm, setErrors] = useState({});
  const { showAlert } = useAlert();

  function onSubmit(event) {
    event.preventDefault();
    authServices
      .login(email, password)
      .then(({ user, token }) => {
        onLogin(user, token);
        showAlert(`Bienvenido/a ${user.name}!`, "success");
      })
      .catch((error) => {
        if (!error) return;

        console.log(error);

        const backendMsg = error.response?.data?.message;

        if (backendMsg) {
          showAlert(backendMsg, "danger", true);
        } else {
          showAlert(
            "Ups! parece que los datos ingresados no son válidos.",
            "danger",
            true
          );
        }

        const parsedErrors = helpers.parseErrorMessage(error);
        setErrors(parsedErrors);
      });
  }

  return (
    <main>
      <section className="auth-section page-section container text-center">
        <div className="auth-container">
          <header className="page-header">
            <p className="section-label">¡Luces encendidas!</p>
            <h1 className="section-title">BIENVENIDO/A</h1>
            <p className="section-subtitle">
              El semáforo está en rojo...por ahora
            </p>
          </header>

          <form className="auth-form" onSubmit={onSubmit}>
            <div className={`input-group ${errorsForm.email ? "is-invalid" : ""}`}>
              <span className="input-label">Email</span>
              <input
                type="email"
                placeholder="juan@perez"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            {errorsForm.email && (
              <div className="invalid-feedback d-block text-start mb-2">
                {errorsForm.email}
              </div>
            )}

            <div className={`input-group ${errorsForm.password ? "is-invalid" : ""}`}>
              <span className="input-label">Contraseña</span>
              <input
                type="password"
                placeholder="123456"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {errorsForm.password && (
              <div className="invalid-feedback d-block text-start mb-2">
                {errorsForm.password}
              </div>
            )}

            <div className="mt-2 text-end">
              <Link to="/forgot-password" style={{ color: "white", fontSize: "12px", textDecoration: "none" }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button className="submit-btn" type="submit" aria-label="Ingresar">
              <svg
                className="icon-submit"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
                />
              </svg>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Login;
