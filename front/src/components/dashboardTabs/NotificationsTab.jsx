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

      {loading ? (
        <LoaderSpinner />
      ) : (
        <form onSubmit={handleSubmit} className="p-4 rounded shadow-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
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

    </div>
  );
}

export default NotificationsTab;
