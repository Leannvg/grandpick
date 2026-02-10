import { useEffect, useState } from "react";
import UsersServices from "../services/users.services.js";
import FloatingEditProfile from "../components/FloatingEditProfile.jsx";
import FloatingChangePassword from "../components/FloatingChangePassword.jsx";

function Profile() {
  const [usuario, setUsuario] = useState({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  
  const API_URL = import.meta.env.VITE_API_URL;

  const imageUrl = currentImage && currentImage !== "profile_default.png"
  ? `${API_URL}/api/static/${currentImage}`
  : `${API_URL}/api/static/general/profile_default.png`;



  useEffect(() => {
    if (usuario?.img_user) {

      console.log(usuario.img_user)
      setCurrentImage(usuario.img_user);
    }
  }, [usuario]);


  const fetchUsuario = async () => {
    try {
      const perfil = await UsersServices.getUserProfile();
      const stats = await UsersServices.getUserStats(perfil._id);
      setUsuario(stats);
    } catch (error) {
      console.error("Error al obtener usuario:", error);
    }
  };

  useEffect(() => {
    fetchUsuario();
  }, []);

  return (
    <div>
      <div className="container admin">
        <h1>Tu ficha de piloto</h1>
        <div className="d-flex w-100">
          <div className="profile-card mb-2 p-4 d-flex flex-column align-items-center w-75">
            <div className="mb-3">
                <div className="mt-3 text-center">
                  <img
                    src={imageUrl}
                    alt="Usuario"
                    style={{ width: "120px", borderRadius: "8px" }}
                  />
                </div>
            </div>

            <p>
              <strong>Nombre de usuario:</strong> {usuario.name} {usuario.last_name}
            </p>
            <p>
              <strong>País:</strong>{" "}
              <span className="emoji-flag">{usuario.country}</span>
            </p>
            <p>
              <strong>Email:</strong> {usuario.email}
            </p>
          </div>

          <div className="d-flex gap-2 justify-content-center mb-5 w-25">
            <div className="d-flex flex-column gap-2">
              <button
                className="btn btn-primary"
                onClick={() => setShowProfileModal(true)}
              >
                Editar perfil
              </button>

              <button
                className="btn btn-primary"
                onClick={() => setShowPasswordModal(true)}
              >
                Cambiar contraseña
              </button>

              <FloatingEditProfile 
                show={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                usuario={usuario}
                onUpdated={fetchUsuario}
              />

              <FloatingChangePassword 
                show={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                usuario={usuario}
                onUpdated={fetchUsuario}
              />
            </div>
          </div>
        </div>
      

        <div className="d-flex justify-content-around stats-container">
          <div>
            <h2>Predicciones</h2>
            <p>Total de predicciones: {usuario.stats?.predictions?.total ?? 0}</p>
            <p>Predicciones en Clasificación: {usuario.stats?.predictions?.qualifyng ?? 0}</p>
            <p>Predicciones en Sprint: {usuario.stats?.predictions?.sprint ?? 0}</p>
            <p>Predicciones en Carrera: {usuario.stats?.predictions?.race ?? 0}</p>
          </div>
          <div>
            <h2>Aciertos</h2>
            <p>Total de aciertos: {usuario.stats?.successes?.total ?? 0}</p>
            <p>Aciertos en Clasificación: {usuario.stats?.successes?.qualifyng ?? 0}</p>
            <p>Aciertos en Sprint: {usuario.stats?.successes?.sprint ?? 0}</p>
            <p>Aciertos en Carrera: {usuario.stats?.successes?.race ?? 0}</p>
          </div>
          <div>
            <h2>Puntos</h2>
            <p>Total de puntos: {usuario.stats?.points?.total ?? 0}</p>
            <p>Puntos en Clasificación: {usuario.stats?.points?.qualifyng ?? 0}</p>
            <p>Puntos en Sprint: {usuario.stats?.points?.sprint ?? 0}</p>
            <p>Puntos en Carrera: {usuario.stats?.points?.race ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
