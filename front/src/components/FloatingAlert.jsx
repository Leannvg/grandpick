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
        <div className="global-alert-wrapper">
          <motion.div
             className={`global-alert alert-${type}`}
             initial={{ y: "-100%" }}
             animate={{ y: 0 }}
             exit={{ y: "-100%" }}
             transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
          <div className="global-alert__container container">
            <div className="global-alert__icon" style={{ display: 'flex', alignItems: 'center' }}>
               {type === "success" && "✅"}
               {type === "danger" && "❌"}
               {type === "warning" && (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="1.2em" height="1.2em">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
               )}
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
        </div>
      )}
    </AnimatePresence>
  );
}

export default FloatingAlert;
