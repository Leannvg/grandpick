import { useNotifications } from "../context/NotificationsContext";
import { Link } from "react-router-dom";

function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  
  const now = new Date();
  const diffInMs = now - date;
  
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMins < 1) return "Hace un momento";
  if (diffInMins < 60) return `Hace ${diffInMins} min`;
  if (diffInHours < 24) return `Hace ${diffInHours} hs`;
  if (diffInDays === 1) return "Hace 1 día";
  if (diffInDays < 7) return `Hace ${diffInDays} días`;
  
  const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString('es-ES', options);
}

function NotificationsBell({ onToggle }) {
  const { notifications, deleteNotification, markAsSeen, markAllAsSeen, deleteAllNotifications } = useNotifications();
  const unread = notifications.filter(n => !n.seen).length;

  return (
    <>
      <button
        className="nav-link btn btn-link position-relative"
        data-bs-toggle="dropdown"
        aria-label="Notificaciones"
        onClick={onToggle}
      >
        <svg
          className={`icon-submit ${unread > 0 ? "unread" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>

        {unread > 0 && <span className="notification-badge">{unread}</span>}
      </button>

      <div className="dropdown-menu dropdown-menu-end notifications-dropdown shadow-lg">
        <div className="notifications-header p-3 border-bottom d-flex justify-content-between align-items-center">
          <p className="dropdown-header m-0 p-0 text-dark fw-bold">Notificaciones</p>
          {notifications.length > 0 && (
            <div className="d-flex gap-2 align-items-center">
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none small text-primary fw-semibold"
                style={{ fontSize: "12px", border: "none", background: "none" }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  markAllAsSeen();
                }}
              >
                Marcar leídas
              </button>
              <span className="text-muted small" style={{ fontSize: "10px" }}>|</span>
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none small text-danger fw-semibold"
                style={{ fontSize: "12px", border: "none", background: "none" }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteAllNotifications();
                }}
              >
                Limpiar todas
              </button>
            </div>
          )}
        </div>

        <div className="notifications-body">
          <div className="list-group list-group-flush">
            {notifications.length === 0 ? (
              <p className="text-center py-4 m-0 text-muted small">No hay notificaciones</p>
            ) : (
              notifications.map((n) => {
                const hasLink = !!n.link;
                const linkTarget = n.link?.startsWith("/results") ? "/prediction-history" : n.link;

                const content = (
                  <>
                    <div className="d-flex flex-column align-items-center justify-content-center me-2">
                      <span className="notification-icon fs-4 mb-2">{n.icon || "🏁"}</span>
                      {n.seen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope-open text-muted" viewBox="0 0 16 16">
                          <path d="M8.47 1.318a1 1 0 0 0-.94 0l-6 3.2A1 1 0 0 0 1 5.4v.817l5.75 3.45L8 8.917l1.25.75L15 6.217V5.4a1 1 0 0 0-.53-.882l-6-3.2ZM15 7.383l-4.778 2.867L15 13.117V7.383Zm-.035 6.88L8 10.082l-6.965 4.18A1 1 0 0 0 2 15h12a1 1 0 0 0 .965-.738ZM1 13.116l4.778-2.867L1 7.383v5.734ZM7.059.435a2 2 0 0 1 1.882 0l6 3.2A2 2 0 0 1 16 5.4V14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5.4a2 2 0 0 1 1.059-1.765l6-3.2Z"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope-fill text-primary" viewBox="0 0 16 16">
                          <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/>
                        </svg>
                      )}
                    </div>
                    <div className="notification-content flex-grow-1">
                      <div className="notification-timestamp mb-1 text-muted" style={{ fontSize: "10px", fontWeight: "500", textTransform: "uppercase" }}>
                        {formatTimeAgo(n.createdAt)}
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="notification-title fw-semibold text-dark">{n.title}</span>
                      </div>
                      <p className="notification-message mb-0 text-muted small">{n.message}</p>
                    </div>
                  </>
                );

                const handleClick = () => {
                  if (!n.seen) {
                    markAsSeen(n.id);
                  }
                };

                return (
                  <div
                    key={n.id}
                    className={`notification-item-wrapper position-relative border-bottom ${!n.seen ? "unread" : ""}`}
                  >
                    {hasLink ? (
                      <Link
                        to={linkTarget}
                        className="notification-item d-flex gap-3 p-3 pe-5 text-decoration-none"
                        onClick={handleClick}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div
                        className="notification-item d-flex gap-3 p-3 pe-5 text-decoration-none"
                        style={{ cursor: "pointer" }}
                        onClick={handleClick}
                      >
                        {content}
                      </div>
                    )}

                    <button
                      type="button"
                      className="notification-close-btn"
                      aria-label="Borrar notificación"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default NotificationsBell;
