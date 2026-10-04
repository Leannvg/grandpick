import { useModalPhase } from "../hooks/useModalPhase";
import { useEscapeKey } from "../hooks/useEscapeKey";

function FloatingDialog({
  show,
  title = "Confirmar acción",
  message = "",
  onConfirm,
  onCancel,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  confirmVariant = "primary", // (btn-primary, btn-danger, etc.)
  cancelVariant = "secondary",
}) {
  useEscapeKey(show, onCancel);
  const phase = useModalPhase(show);

  if (phase === "closed") return null;

  return (
    <div className={`gp-modal-overlay gp-modal-overlay--css ${phase === "closing" ? "is-closing" : ""}`}>
      <div
        className="gp-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <h2 id="dialog-title" className="gp-modal-title">{title}</h2>
        {message && <p className="gp-modal-subtitle">{message}</p>}

        <div className="gp-modal-actions">
          <button
            className="gp-btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="gp-btn-confirm"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FloatingDialog;
