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
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center"
            style={{ zIndex: 1050 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            <motion.div
              className="bg-white rounded-4 shadow-lg p-4"
              style={{ width: "40%", maxWidth: "90%" }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h5 className="mb-3">{title}</h5>
              {message && <p className="text-muted mb-4">{message}</p>}

              <div className="d-flex justify-content-end gap-2">
                <button
                  className={`btn btn-${cancelVariant}`}
                  onClick={onCancel}
                >
                  {cancelText}
                </button>
                <button
                  className={`btn btn-${confirmVariant}`}
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
