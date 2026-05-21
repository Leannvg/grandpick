import { useState } from "react";
import NotificationsServices from "../../services/notifications.services";
import { useAlert } from "../../context/AlertContext";
import LoaderSpinner from "../LoaderSpinner";

function NotificationsTab({ users = [] }) {
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    link: "",
    userId: "all",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      showAlert("El título y el mensaje son obligatorios.", "danger", true);
      return;
    }

    setLoading(true);
    try {
      const response = await NotificationsServices.sendAdminNotification(formData);
      showAlert(`✅ ${response.message} (In-App: ${response.inAppCount}, Push: ${response.pushCount})`, "success");
      
      setFormData({
        title: "",
        message: "",
        link: "",
        userId: "all",
      });
    } catch (err) {
      console.error(err);
      showAlert("❌ Error al enviar la notificación.", "danger", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <h2 className="admin-form-title">Enviar Comunicado</h2>
      <p style={{ color: "#fff", marginBottom: "20px", fontSize: "0.9rem" }}>
        Envía un comunicado a todos los usuarios o a uno en específico. Esto enviará tanto una notificación interna en la aplicación como una notificación Push a quienes las tengan habilitadas.
      </p>

      {loading ? (
        <LoaderSpinner />
      ) : (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-input-group full-width">
            <label htmlFor="userId">Destinatario</label>
            <select
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="admin-form-input"
            >
              <option value="all">Todos los usuarios</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} {user.last_name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="admin-input-group full-width">
            <label htmlFor="title">Título del comunicado</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Ej: Mantenimiento programado"
              value={formData.title}
              onChange={handleChange}
              className="admin-form-input"
            />
          </div>

          <div className="admin-input-group full-width">
            <label htmlFor="message">Mensaje</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              placeholder="Escribe el mensaje aquí..."
              value={formData.message}
              onChange={handleChange}
              className="admin-form-input"
              style={{ resize: "vertical", padding: "12px" }}
            ></textarea>
          </div>

          <div className="admin-input-group full-width">
            <label htmlFor="link">Link adjunto (opcional)</label>
            <input
              type="text"
              id="link"
              name="link"
              placeholder="Ej: /predictions"
              value={formData.link}
              onChange={handleChange}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn-admin-submit">
              Enviar Comunicado
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default NotificationsTab;
