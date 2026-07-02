import { useState } from "react";
import NotificationsServices from "../../services/notifications.services";
import { useAlert } from "../../context/AlertContext";
import { useDialog } from "../../context/DialogContext";
import LoaderSpinner from "../LoaderSpinner";

function NotificationsTab({ users = [] }) {
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();
  const { confirmDialog } = useDialog();

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

    const recipientName = formData.userId === "all" 
      ? "Todos los usuarios" 
      : (() => {
          const u = users.find((user) => user._id === formData.userId);
          return u ? `${u.name} ${u.last_name} (${u.email})` : "Usuario específico";
        })();

    try {
      await confirmDialog({
        title: "¿Confirmar Envío?",
        message: (
          <span>
            Estás a punto de enviar una notificación a <strong>{recipientName}</strong>.<br /><br />
            <strong>Título:</strong> {formData.title}<br />
            <strong>Mensaje:</strong> {formData.message}
            {formData.link && <><br /><strong>Link:</strong> {formData.link}</>}
            <br /><br />
            Esta acción disparará notificaciones push reales.
          </span>
        ),
        confirmText: "Enviar",
        cancelText: "Cancelar",
        confirmVariant: "danger",
      });
    } catch (e) {
      // Usuario canceló
      return;
    }

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

  return (
    <div className="container mt-4" style={{ maxWidth: "800px" }}>
      <div className="bg-white p-4 rounded-3 shadow-sm mb-4 text-start">
        <h2 className="m-0 fw-bold pb-3 border-bottom" style={{ color: "#000", textTransform: "uppercase", fontSize: "1.5rem" }}>
          Enviar Comunicado
        </h2>
        <p className="mt-3" style={{ color: "#222", fontSize: "1rem", margin: 0 }}>
          Envía un comunicado a todos los usuarios o a uno en específico. Esto enviará tanto una notificación interna en la aplicación como una notificación Push a quienes las tengan habilitadas.
        </p>
      </div>

      {loading ? (
        <LoaderSpinner />
      ) : (
        <form onSubmit={handleSubmit} className="text-start">
          <div className="row mb-3">
            <div className="col-12">
              <div className="gp-input-group-container">
                <div className="gp-input-group">
                  <span className="gp-input-label" style={{ width: "200px", minWidth: "200px" }}>Destinatario</span>
                  <select
                    id="userId"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    className="form-control bg-white m-0"
                    style={{ border: "none", cursor: "pointer" }}
                  >
                    <option value="all">Todos los usuarios</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-12">
              <div className="gp-input-group-container">
                <div className="gp-input-group">
                  <span className="gp-input-label" style={{ width: "200px", minWidth: "200px" }}>Título del comunicado</span>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Ej: Mantenimiento programado"
                    value={formData.title}
                    onChange={handleChange}
                    className="form-control bg-white m-0"
                    style={{ border: "none" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-12">
              <div className="gp-input-group-container">
                <div
                  className="gp-input-group"
                  style={{ flexDirection: "column", alignItems: "stretch" }}
                >
                  <span
                    className="gp-input-label"
                    style={{
                      width: "100%",
                      minWidth: "100%",
                      borderRadius: "8px 8px 0px 0px",
                      height: "38px",
                      justifyContent: "start",
                      paddingLeft: "20px"
                    }}
                  >
                    Mensaje
                  </span>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    placeholder="Escribe el mensaje aquí..."
                    value={formData.message}
                    onChange={handleChange}
                    className="form-control text-start bg-white m-0"
                    style={{
                      border: "none",
                      borderRadius: "0px 0px 8px 8px",
                      padding: "15px",
                      minHeight: "120px",
                      resize: "vertical",
                      color: "#222"
                    }}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <div className="gp-input-group-container">
                <div className="gp-input-group">
                  <span className="gp-input-label" style={{ width: "200px", minWidth: "200px" }}>Link adjunto (opcional)</span>
                  <input
                    type="text"
                    id="link"
                    name="link"
                    placeholder="Ej: /predictions"
                    value={formData.link}
                    onChange={handleChange}
                    className="form-control bg-white m-0"
                    style={{ border: "none" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-4">
            <button type="submit" className="btn-admin-add" style={{ padding: "10px 24px" }}>
              <i className="bi bi-send"></i> Revisar Comunicado
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default NotificationsTab;
