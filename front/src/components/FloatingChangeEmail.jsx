import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "./../context/AlertContext.jsx";
import UsersServices from "../services/users.services";

function FloatingChangeEmail({ show, onClose, usuario, onUpdated }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorsForm, setErrorsForm] = useState({});
  const { showAlert } = useAlert();

  useEffect(() => {
    if (show && usuario) {
      setEmail(usuario.email || "");
      setErrorsForm({});
    }
  }, [show, usuario]);

  const handleSave = async () => {
    setLoading(true);
    setErrorsForm({});

    try {
      // Create a FormData object as the update service expects it for profile updates
      const formData = new FormData();
      formData.append("email", email);
      
      // We keep existing data to avoid overwriting with empty values if the backend doesn't handle partial updates well with FormData
      formData.append("name", usuario.name || "");
      formData.append("last_name", usuario.last_name || "");
      formData.append("country", usuario.country || "");

      await UsersServices.update(usuario._id, formData);

      if (onUpdated) onUpdated();

      setTimeout(() => {
        onClose();
        showAlert("Email actualizado correctamente.", "success", false);
      }, 500);

    } catch (err) {
      console.error("Error updating email:", err);
      setErrorsForm(err.response?.data?.errors || { general: "Error al actualizar el email" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="edit-profile-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="edit-profile-card"
            initial={{ scale: 0.8, opacity: 0, y: -30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -30 }}
            transition={{ type: "spring", duration: 0.35 }}
          >
            <h3 className="mb-3">Cambiar Email</h3>

            <div className="gp-input-group-container">
              <div className={`gp-input-group ${errorsForm.email ? "is-invalid" : ""}`}>
                <label className="gp-input-label">Nuevo Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                />
              </div>
              {errorsForm.email && (
                <div className="invalid-feedback d-block mt-1">{errorsForm.email}</div>
              )}
              {errorsForm.general && (
                <div className="text-danger small mt-1">{errorsForm.general}</div>
              )}
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button
                className="btn btn-success"
                disabled={loading}
                onClick={handleSave}
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FloatingChangeEmail;
