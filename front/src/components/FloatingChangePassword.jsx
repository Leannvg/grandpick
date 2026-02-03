import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UsersServices from "../services/users.services";
import { useAlert } from "./../context/AlertContext.jsx";
import PasswordInput from "./PasswordInput.jsx";

function ChangePasswordModal({ show, onClose, usuario }) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { showAlert } = useAlert();


  useEffect(() => {
    if (show) {
      // Cuando se abre → limpiar todo
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
      setErrors({});

      // Reset visibilidad de los campos
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [show]);


  const handleSave = async () => {
    const newErrors = {};

    // Validación local (frontend)
    if (!oldPass.trim()) {
      newErrors.oldPassword = "La contraseña actual es obligatoria";
    }

    if (!newPass.trim()) {
      newErrors.newPassword = "La nueva contraseña es obligatoria";
    } else if (newPass.length < 6) {
      newErrors.newPassword = "La nueva contraseña debe tener al menos 6 caracteres";
    }

    if (!confirmPass.trim()) {
      newErrors.confirmPass = "Debe confirmar la nueva contraseña";
    } else if (newPass !== confirmPass) {
      newErrors.confirmPass = "Las contraseñas no coinciden";
    }

    // Si hay errores locales, no llamamos al backend
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Si la validación local pasó, ahora sí llamamos al backend
    try {
      setLoading(true);

      await UsersServices.updateSecurity(usuario._id, {
        oldPassword: oldPass,
        newPassword: newPass,
      });

      showAlert("Contraseña actualizada correctamente.", "success", false);

      onClose();

    } catch (err) {
      // Errores del backend (ej: oldPassword incorrecta)
      setErrors(err.response?.data?.errors || {});
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

            <h3>Cambiar contraseña</h3>

            <PasswordInput
              label="Contraseña actual"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              error={errors.oldPassword}
            />


            <PasswordInput
              label="Nueva contraseña"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              error={errors.newPassword}
            />


            <PasswordInput
              label="Confirmar nueva contraseña"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              error={errors.confirmPass}
            />


            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button className="btn btn-success" onClick={handleSave} disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ChangePasswordModal;
