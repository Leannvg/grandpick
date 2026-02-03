import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "./../context/AlertContext.jsx";
import CountrySelect from "./CountrySelect.jsx";
import UsersServices from "../services/users.services";
import UploadImage from "./UploadImage.jsx";
import UploadsServices from "../services/uploads.services.js";


function FloatingEditProfile({ show, onClose, usuario, onUpdated }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorsForm, setErrorsForm] = useState({});
  const { showAlert } = useAlert();
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  const handleImageSelect = (file) => {
    setImageFile(file);
  };

  const imageUrl = currentImage && currentImage !== "profile_default.png"
  ? `http://localhost:2022/api/static/${currentImage}`
  : `http://localhost:2022/api/static/general/profile_default.png`;



  useEffect(() => {
    if (show && usuario) {
      setEmail(usuario.email || "");
      setName(usuario.name || "");
      setLastName(usuario.last_name || "");
      setCountry(usuario.country || "");

      setCurrentImage(usuario.img_user || "");
      setImageFile(null);

      setErrorsForm({});
    }

    if (!show) {
      setMessage("");
    }

  }, [show, usuario]);


  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    setErrorsForm({});

    try {
      const formData = new FormData();

      formData.append("email", email);
      formData.append("name", name);
      formData.append("last_name", lastName);
      formData.append("country", country);

      // ⚠️ SOLO si hay imagen nueva
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await UsersServices.update(usuario._id, formData);

      if (onUpdated) onUpdated();

      setMessage("Actualizando datos...");

      setTimeout(() => {
        onClose();
        showAlert("Perfil actualizado correctamente.", "success", false);
      }, 800);

    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorsForm(err.response?.data?.errors || {});
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

            <h3 className="mb-3">Editar Perfil</h3>

            {/* Imagen */}
            <div className="mb-3">
            
              <div className="mt-3 text-center">
                <p>Imagen actual:</p>
                <img
                  src={imageUrl}
                  alt="Usuario"
                  style={{ width: "120px", borderRadius: "10px" }}
                />
              </div>

              <UploadImage
                label="Actualizar imagen de perfil"
                onImageSelect={handleImageSelect}
                isInvalid={!!errorsForm.img_user}
                error={errorsForm.img_user}
              />
            </div>


            {/* Nombre */}
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                className={`form-control ${errorsForm.name ? "is-invalid" : ""}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errorsForm.name && (
                <div className="invalid-feedback">{errorsForm.name}</div>
              )}
            </div>

            {/* Apellido */}
            <div className="mb-3">
              <label className="form-label">Apellido</label>
              <input
                className={`form-control ${errorsForm.last_name ? "is-invalid" : ""}`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errorsForm.last_name && (
                <div className="invalid-feedback">{errorsForm.last_name}</div>
              )}
            </div>

            {/* País */}
            <div className="mb-3">
              <CountrySelect 
                countryFunction={setCountry} 
                isInvalid={!!errorsForm.country}
                error={errorsForm.country}
                defaultValue={country}
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className={`form-control ${errorsForm.email ? "is-invalid" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errorsForm.email && (
                <div className="invalid-feedback">{errorsForm.email}</div>
              )}
            </div>

            {message && <p className="alert alert-info">{message}</p>}

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

export default FloatingEditProfile;
