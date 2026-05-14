import { useState } from "react";

function PasswordInput({
  label,
  value,
  onChange,
  error,
  placeholder = "",
  disabled = false,
  ...props
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="gp-input-group-container">
      <div className={`gp-input-group ${error ? "is-invalid" : ""}`}>
        {label && <label className="gp-input-label">{label}</label>}

        <input
          type={show ? "text" : "password"}
          className="form-control"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />

        <button
          type="button"
          className="gp-password-toggle"
          onClick={() => setShow(!show)}
          disabled={disabled}
          title={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.67 8.5 7.652 4.5 12 4.5c4.348 0 8.331 3.5 9.964 7.178.07.154.07.33 0 .484-1.633 3.678-5.616 7.678-9.964 7.678-4.348 0-8.331-4-9.964-7.678z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>

      {error && (
        <div className="invalid-feedback d-block mt-1">
          {error}
        </div>
      )}
    </div>
  );
}

export default PasswordInput;
