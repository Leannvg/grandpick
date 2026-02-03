import { useState } from "react";

function PasswordInput({
  label,
  value,
  onChange,
  error,
  placeholder = "",
  disabled = false,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="mb-3">
      {label && <label>{label}</label>}

      <div className="input-group">
        <input
          type={show ? "text" : "password"}
          className={`form-control ${error ? "is-invalid" : ""}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => setShow(!show)}
          disabled={disabled}
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>

      {error && (
        <div className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </div>
  );
}

export default PasswordInput;
