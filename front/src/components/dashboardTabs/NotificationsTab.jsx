import { useState } from "react";
import NotificationsServices from "../../services/notifications.services";
import { useAlert } from "../../context/AlertContext";
import LoaderSpinner from "../LoaderSpinner";

function NotificationsTab({ users = [] }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
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

  const handlePreview = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      showAlert("El título y el mensaje son obligatorios.", "danger", true);
      return;
    }

    setShowModal(true);
  };

  const confirmSend = async () => {
    setShowModal(false);
    setLoading(true);
    try {
      const response = await NotificationsServices.sendAdminNotification(formData);
      showAlert(`${response.message} (Internas: ${response.inAppCount}, Externas push: ${response.pushCount})`, "success");

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

  const recipientName = formData.userId === "all" 
    ? "Todos los usuarios" 
    : (() => {
        const u = users.find((user) => user._id === formData.userId);
        return u ? `${u.name} ${u.last_name} (${u.email})` : "Usuario específico";
      })();

  return (
    <div className="container mt-4" style={{ maxWidth: "800px" }}>
      <div className="d-flex flex-column gap-2 mb-4">
        <h2 className="m-0" style={{ color: "#fff" }}>Enviar Comunicado</h2>
        <p style={{ color: "#aaa", fontSize: "0.95rem", margin: 0 }}>
          Envía un comunicado a todos los usuarios o a uno en específico. Esto enviará tanto una notificación interna en la aplicación como una notificación Push a quienes las tengan habilitadas.
        </p>
      </div>

      {loading ? (
        <LoaderSpinner />
      ) : (
        <form onSubmit={handlePreview} className="p-4 rounded shadow-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <div className="mb-3">
            <label htmlFor="userId" className="form-label text-white">Destinatario</label>
            <select
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="form-control"
              style={{ backgroundColor: "#f8fafc", cursor: "pointer" }}
            >
              <option value="all">Todos los usuarios</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} {user.last_name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="title" className="form-label text-white">Título del comunicado</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Ej: Mantenimiento programado"
              value={formData.title}
              onChange={handleChange}
              className="form-control"
              style={{ backgroundColor: "#f8fafc" }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="message" className="form-label text-white">Mensaje</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              placeholder="Escribe el mensaje aquí..."
              value={formData.message}
              onChange={handleChange}
              className="form-control"
              style={{ resize: "vertical", backgroundColor: "#f8fafc" }}
            ></textarea>
          </div>

          <div className="mb-4">
            <label htmlFor="link" className="form-label text-white">Link adjunto (opcional)</label>
            <input
              type="text"
              id="link"
              name="link"
              placeholder="Ej: /predictions"
              value={formData.link}
              onChange={handleChange}
              className="form-control"
              style={{ backgroundColor: "#f8fafc" }}
            />
          </div>

          <div className="d-flex justify-content-end mt-2">
            <button type="submit" className="btn-admin-add" style={{ padding: "10px 24px" }}>
              <i className="bi bi-send"></i> Revisar Comunicado
            </button>
          </div>
        </form>
      )}

      {/* Modal de confirmación */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ backgroundColor: "#1e2129", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title text-white">Confirmar Envío</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body text-white">
                <p className="mb-2 text-muted">Estás a punto de enviar una notificación con los siguientes datos:</p>
                <div className="p-3 rounded" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
                  <p className="mb-1"><strong>Destinatario:</strong> <span style={{ color: "var(--color-primary)" }}>{recipientName}</span></p>
                  <p className="mb-1"><strong>Título:</strong> {formData.title}</p>
                  <p className="mb-1"><strong>Mensaje:</strong> {formData.message}</p>
                  {formData.link && <p className="mb-1"><strong>Link adjunto:</strong> <a href={formData.link} target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)" }}>{formData.link}</a></p>}
                </div>
                <div className="alert alert-warning mt-3 mb-0" style={{ fontSize: "0.9rem" }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Esta acción no se puede deshacer y los usuarios recibirán alertas push inmediatamente.
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="button" className="btn-admin-add" onClick={confirmSend}>
                  <i className="bi bi-send"></i> Confirmar y Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsTab;
