import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authServices from "../services/auth.services.js";
import CountrySelect from "../components/CountrySelect.jsx";
import * as helpers from "../utils/helpers.js";
import { useAlert } from "./../context/AlertContext.jsx";
import { useDialog } from "./../context/DialogContext.jsx";

function Register() {
  const [name, setNombre] = useState("");
  const [last_name, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setPais] = useState("");
  const [errorsForm, setErrors] = useState({});
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { confirmDialog } = useDialog();

  async function onSubmit(event) {
    event.preventDefault();

    const dialog = {
      title: "¿Todo listo para correr?",
      message: `Este es un viaje de ida.`,
      confirmText: "Registrarme",
      cancelText: "Cancelar",
      confirmVariant: "success",
    };
    const confirmed = await confirmDialog(dialog);
    if (!confirmed) return;

    authServices
      .register(name, last_name, country, email, password)
      .then(() => {
        navigate("/login");
        showAlert("Usuario creado con éxito!", "success");
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
            <p className="section-label">¡Bienvenido/a!</p>
            <h1 className="section-title">CREÁ TU CUENTA</h1>
            <p className="section-subtitle">
              Estás a punto de formar parte de una gran comunidad
            </p>
          </header>

          <form className="auth-form" onSubmit={onSubmit}>
            {/* NOMBRE */}
            <div className={`input-group ${errorsForm.name ? "is-invalid" : ""}`}>
              <span className="input-label">Nombre</span>
              <input
                type="text"
                placeholder="Juan"
                value={name}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            {errorsForm.name && (
              <div className="invalid-feedback d-block text-start mb-2">
                {errorsForm.name}
              </div>
            )}

            {/* APELLIDO */}
            <div
              className={`input-group ${errorsForm.last_name ? "is-invalid" : ""}`}
            >
              <span className="input-label">Apellido</span>
              <input
                type="text"
                placeholder="Perez"
                value={last_name}
                onChange={(e) => setApellido(e.target.value)}
              />
            </div>
            {errorsForm.last_name && (
              <div className="invalid-feedback d-block text-start mb-2">
                {errorsForm.last_name}
              </div>
            )}

            {/* PAIS */}
            <div
              className={`input-group ${errorsForm.country ? "is-invalid" : ""}`}
              style={{ overflow: "visible" }}
            >
              <span className="input-label">País</span>
              <div className="flex-fill">
                <CountrySelect
                  countryFunction={setPais}
                  isInvalid={!!errorsForm.country}
                  hideLabel={true}
                />
              </div>
            </div>
            {errorsForm.country && (
              <div className="invalid-feedback d-block text-start mb-2">
                {errorsForm.country}
              </div>
            )}

            {/* EMAIL */}
            <div className={`input-group ${errorsForm.email ? "is-invalid" : ""}`}>
              <span className="input-label">Email</span>
              <input
                type="email"
                placeholder="juan@perez.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {errorsForm.email && (
              <div className="invalid-feedback d-block text-start mb-2">
                {errorsForm.email}
              </div>
            )}

            {/* PASSWORD */}
            <div
              className={`input-group ${errorsForm.password ? "is-invalid" : ""}`}
            >
              <span className="input-label">Contraseña</span>
              <input
                type="password"
                placeholder="123456"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errorsForm.password && (
              <div className="invalid-feedback d-block text-start mb-2">
                {errorsForm.password}
              </div>
            )}

            <button className="submit-btn" type="submit" aria-label="Crear cuenta">
              <svg
                className="icon-submit"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                />
              </svg>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Register;
