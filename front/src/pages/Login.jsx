import { useState } from "react";
import { Link } from "react-router-dom";
import * as authServices from "../services/auth.services.js";
import * as helpers from "../utils/helpers.js";
import { useAlert } from "./../context/AlertContext.jsx";
import { useDialog } from "./../context/DialogContext.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorsForm, setErrors] = useState({});
  const { showAlert } = useAlert();
  const { confirmDialog } = useDialog();

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
          showAlert(backendMsg, "danger", true); // Mensaje del backend
        } else {
          showAlert("Ups! parece que los datos ingresados no son válidos.", "danger", true);
        }

        const parsedErrors = helpers.parseErrorMessage(error);
        setErrors(parsedErrors);
      });
  }

  function crearEmail(e) {
    setEmail(e.target.value);
  }

  function crearPassword(e) {
    setPassword(e.target.value);
  }

  return (
    <div>
      <div className="container admin">
        <h1>Iniciar Sesión</h1>
        <form onSubmit={onSubmit}>
        <div>
          
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input
               className={`form-control ${errorsForm.email ? "is-invalid" : ""}`}
              type="text"
              name="email"
              onChange={crearEmail}
              value={email}
            />
            {errorsForm.email && (
              <div className="invalid-feedback">{errorsForm.email}</div>
            )}
          </div>
          <PasswordInput
            label="Contraseña"
            value={password}
            onChange={crearPassword}
            error={errorsForm.password}
          />

          <div className="mt-2 text-end">
            <Link to="/forgot-password" className="text-decoration-none">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button className="btn btn-success mt-4">Ingresar</button>
        </form>
      </div>
    </div>
    
  );
}

export default Login;
