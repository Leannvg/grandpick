import { motion, AnimatePresence } from "framer-motion";

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
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            className="gp-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            <motion.div
              className="gp-modal-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h5 className="gp-modal-title">{title}</h5>
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
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default FloatingDialog;
