import { motion, AnimatePresence } from "framer-motion";

function FloatingAlert({
  show,
  message,
  type = "success", // "success" | "danger" | "warning" | "info"
  position = "top-end", // "top-center" | "bottom-end" | etc.
  autoClose = 7000,
  onClose,
}) {

  if (show && autoClose && onClose) {
    setTimeout(() => onClose(), autoClose);
  }

 
  const positionClasses = {
    "top-start": "top-0 start-0",
    "top-center": "top-0 start-50 translate-middle-x",
    "top-end": "top-0 end-0",
    "bottom-start": "bottom-0 start-0",
    "bottom-center": "bottom-0 start-50 translate-middle-x",
    "bottom-end": "bottom-0 end-0",
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`position-fixed ${positionClasses[position]} p-3`}
          style={{ zIndex: 2000 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div
            className={`alert alert-${type} d-flex align-items-center shadow rounded-3`}
            role="alert"
          >
            <div className="flex-grow-1">{message}</div>
            {onClose && (
              <button
                type="button"
                className="btn-close ms-2"
                aria-label="Close"
                onClick={onClose}
              ></button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FloatingAlert;
