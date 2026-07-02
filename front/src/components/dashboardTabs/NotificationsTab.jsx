import { useState } from "react";
import NotificationsServices from "../../services/notifications.services";
import { useAlert } from "../../context/AlertContext";
import { useDialog } from "../../context/DialogContext";
import LoaderSpinner from "../LoaderSpinner";
import SearchableSelect from "../SearchableSelect";

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

  const userOptions = [
    { _id: "all", full_name: "Todos los usuarios" },
    ...users.map((user) => ({
      _id: user._id,
      full_name: `${user.name} ${user.last_name} (${user.email})`,
    })),
  ];

  return (
    <div className="mt-4">
      <div className="bg-white p-4 rounded-3 shadow-sm mb-4 text-start">
        <h2 className="m-0 fw-bold pb-3 border-bottom admin-tab-title">
          Enviar Comunicado
        </h2>
        <p className="mt-3 mb-0 admin-tab-subtitle">
          Envía un comunicado a todos los usuarios o a uno en específico. Esto enviará tanto una notificación interna en la aplicación como una notificación Push a quienes las tengan habilitadas.
        </p>
      </div>

      {loading ? (
        <LoaderSpinner />
      ) : (
        <form onSubmit={handleSubmit} className="text-start notifications-form">
          <div className="row">
            {/* Columna Izquierda */}
            <div className="col-lg-6 col-12 d-flex flex-column">
              <div className="gp-input-group-container">
                <div className="gp-input-group overflow-visible">
                  <span className="gp-input-label gp-input-label-fixed">Destinatario</span>
                  <div className="flex-fill gp-input-content-flex">
                    <SearchableSelect
                      options={userOptions}
                      value={formData.userId}
                      onChange={(selected) => setFormData((prev) => ({ ...prev, userId: selected ? selected.value : "all" }))}
                      placeholder="Buscar usuario..."
                    />
                  </div>
                </div>
              </div>

              <div className="gp-input-group-container">
                <div className="gp-input-group">
                  <span className="gp-input-label gp-input-label-fixed">Título del comunicado</span>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Ej: Mantenimiento programado"
                    value={formData.title}
                    onChange={handleChange}
                    className="form-control bg-white m-0 border-0"
                  />
                </div>
              </div>

              <div className="gp-input-group-container mb-lg-0">
                <div className="gp-input-group">
                  <span className="gp-input-label gp-input-label-fixed">Link adjunto (opcional)</span>
                  <input
                    type="text"
                    id="link"
                    name="link"
                    placeholder="Ej: /predictions"
                    value={formData.link}
                    onChange={handleChange}
                    className="form-control bg-white m-0 border-0"
                  />
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="col-lg-6 col-12 d-flex flex-column mt-0">
              <div className="gp-input-group-container flex-grow-1 d-flex flex-column mb-0">
                <div className="gp-input-group flex-grow-1 flex-column align-items-stretch">
                  <span className="gp-input-label gp-textarea-label">
                    Mensaje
                  </span>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Escribe el mensaje aquí..."
                    value={formData.message}
                    onChange={handleChange}
                    className="form-control text-start bg-white m-0 flex-grow-1 gp-textarea-input"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-4">
            <button type="submit" className="btn-admin-add btn-admin-submit">
              <i className="bi bi-send"></i> Revisar Comunicado
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default NotificationsTab;
