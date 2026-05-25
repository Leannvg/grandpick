import confirmarIcon from "../assets/icons/confirmar.svg";

function SubmitButton({ ariaLabel = "Confirmar", disabled = false, className = "", style = {}, onClick, ...props }) {
  return (
    <button
      className={`submit-btn ${className}`}
      type="submit"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      style={style}
      {...props}
    >
      <img
        src={confirmarIcon}
        alt="Confirmar"
        className="icon-submit"
        style={{ objectFit: "contain" }}
      />
    </button>
  );
}

export default SubmitButton;
