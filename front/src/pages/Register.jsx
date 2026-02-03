import { useState, useEffect } from "react";
import * as authServices from "../services/auth.services.js";
import * as countriesServices from "../services/countries.services.js";
import { useNavigate } from "react-router-dom";
import CountrySelect from "../components/CountrySelect.jsx";
import * as helpers from "../utils/helpers.js";
import { useAlert } from "./../context/AlertContext.jsx";
import { useDialog } from "./../context/DialogContext.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

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

    /* if(!country || !name || !last_name || !email || !password){
      showAlert("Tenés que completar todos los campos para continuar.", "danger", true)
      return;
    } */

    const dialog = {
      title: "¿Todo listo para correr?",
      message: `Este es un viaje de ida.`,
      confirmText: "Registrarme",
      cancelText: "Cancelar",
      confirmVariant: "success",
    }
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
            showAlert("Ups! parece que los datos ingresados no son válidos.", "danger", true);
          }

          const parsedErrors = helpers.parseErrorMessage(error);
          console.log(parsedErrors);
          setErrors(parsedErrors);
        });
    }

  function crearNombre(e) {
    setNombre(e.target.value);
  }

  function crearEmail(e) {
    setEmail(e.target.value);
  }

  function crearPassword(e) {
    setPassword(e.target.value);
  }

   function crearApellido(e) {
    setApellido(e.target.value);
  }

  return (
    <div>
      <div className="container admin">
        <h1>Registro</h1>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label>Nombre</label>
            <input
              className={`form-control ${errorsForm.name ? "is-invalid" : ""}`}
              type="text"
              name="name"
              onChange={crearNombre}
              value={name}
            />
            {errorsForm.name && (
              <div className="invalid-feedback">{errorsForm.name}</div>
            )}
          </div>
          <div className="mb-3">
            <label>Apellido</label>
            <input
              className={`form-control ${errorsForm.last_name ? "is-invalid" : ""}`}
              type="text"
              name="name"
              onChange={crearApellido}
              value={last_name}
            />
            {errorsForm.last_name && (
              <div className="invalid-feedback">{errorsForm.last_name}</div>
            )}
          </div>

          <div className="mb-3">
            <CountrySelect 
              countryFunction={setPais} 
              isInvalid={!!errorsForm.country}
              error={errorsForm.country}
            />
          </div>
          
          <div className="mb-3">
            <label>Email</label>
            <input
              className={`form-control ${errorsForm.email ? "is-invalid" : ""}`}
              type="email"
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

          <button className="btn btn-success mt-4">Registrarse</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
