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
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          disabled={disabled}
          style={{
            border: "none",
            background: "transparent",
            padding: "0 15px",
            fontSize: "1.2rem",
            cursor: "pointer"
          }}
        >
          {show ? "🙈" : "👁️"}
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
