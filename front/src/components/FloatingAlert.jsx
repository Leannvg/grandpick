import { motion, AnimatePresence } from "framer-motion";
import "./../assets/styles/components.css";

function FloatingAlert({
  show,
  message,
  type = "success", // "success" | "danger" | "warning" | "info"
  onClose,
}) {

  return (
    <AnimatePresence>
      {show && (
        <motion.div
           className={`global-alert alert-${type}`}
           initial={{ y: "-100%" }}
           animate={{ y: 0 }}
           exit={{ y: "-100%" }}
           transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="global-alert__container container">
            <div className="global-alert__icon">
               {type === "success" && "✅"}
               {type === "danger" && "❌"}
               {type === "warning" && "⚠️"}
               {type === "info" && "ℹ️"}
            </div>
            <div className="global-alert__message">{message}</div>
            {onClose && (
              <button
                type="button"
                className="global-alert__close"
                aria-label="Close"
                onClick={onClose}
              >
                &times;
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FloatingAlert;
