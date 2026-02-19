import { useEffect, useState } from "react";
import UsersServices from "../services/users.services.js";
import FloatingEditProfile from "../components/FloatingEditProfile.jsx";
import FloatingChangePassword from "../components/FloatingChangePassword.jsx";
import { getFlagEmoji } from "../utils/helpers";
import profileDefault from "../assets/images/profile_default.png";
import "../assets/styles/profile.css";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function Profile() {
  const [usuario, setUsuario] = useState({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (usuario?.img_user) {
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

  const createChartData = (stats, type) => {
    const data = stats?.[type] || {};
    return {
      datasets: [
        {
          data: [data.qualifyng || 0, data.sprint || 0, data.race || 0],
          backgroundColor: [
            "#E6E6E6", // Qualy - White/Light Gray
            "#FFCD56", // Sprint - Yellow
            "#D40000", // Race - Red
          ],
          borderWidth: 0,
          cutout: "85%",
        },
      ],
    };
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    maintainAspectRatio: false,
  };

  return (
    <main className="profile-section container">
      <header className="profile-header">
        <p className="section-label">Tu garaje digital</p>
        <h1 className="section-title">TU FICHA DE PILOTO</h1>
        <p className="section-subtitle">Seguimiento de predicciones y resultados</p>
      </header>

      <div className="profile-info-grid">
        {/* User Card */}
        <article className="user-card">
          <div className="user-avatar-box">
            <img src={profileDefault} alt="Helmet" />
          </div>
          <div className="user-details">
            <div>
              <h2>{(usuario.name || "PILOTO").toUpperCase()} {(usuario.last_name || "").toUpperCase()}</h2>
              <p className="user-email">{usuario.email}</p>
            </div>

            <div className="user-country-tag">
              <span className="emoji-flag" title={usuario.country}>
                {getFlagEmoji(usuario.country)}
              </span>
            </div>
          </div>
        </article>

        {/* Actions */}
        <aside className="profile-actions">
          <button className="btn-profile-action">Mis Predicciones</button>
          <button className="btn-profile-action" onClick={() => setShowPasswordModal(true)}>
            Cambiar Contraseña
          </button>
          <button className="btn-profile-action" onClick={() => setShowProfileModal(true)}>
            Cambiar Email
          </button>
        </aside>
      </div>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-title">
          <span>MIS ESTADISTICAS</span>
          <div className="stats-legend">
            <div className="legend-item">
              <span className="dot" style={{ backgroundColor: "#E6E6E6" }}></span>
              <span>Qualy</span>
            </div>
            <div className="legend-item">
              <span className="dot" style={{ backgroundColor: "#FFCD56" }}></span>
              <span>Sprint</span>
            </div>
            <div className="legend-item">
              <span className="dot" style={{ backgroundColor: "#D40000" }}></span>
              <span>Race</span>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          {/* Predicciones Chart */}
          <div className="chart-item">
            <div style={{ height: "180px" }}>
              <Doughnut data={createChartData(usuario.stats, "predictions")} options={chartOptions} />
            </div>
            <div className="chart-label-center">
              <span className="chart-center-title">PREDICCIONES</span>
              <span className="chart-center-value">{usuario.stats?.predictions?.total || 0}</span>
            </div>
          </div>

          {/* Aciertos Chart */}
          <div className="chart-item">
            <div style={{ height: "180px" }}>
              <Doughnut data={createChartData(usuario.stats, "successes")} options={chartOptions} />
            </div>
            <div className="chart-label-center">
              <span className="chart-center-title">ACIERTOS</span>
              <span className="chart-center-value">{usuario.stats?.successes?.total || 0}</span>
            </div>
          </div>

          {/* Puntos Chart */}
          <div className="chart-item">
            <div style={{ height: "180px" }}>
              <Doughnut data={createChartData(usuario.stats, "points")} options={chartOptions} />
            </div>
            <div className="chart-label-center">
              <span className="chart-center-title">PUNTOS</span>
              <span className="chart-center-value">{usuario.stats?.points?.total || 0}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
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
    </main>
  );
}

export default Profile;
